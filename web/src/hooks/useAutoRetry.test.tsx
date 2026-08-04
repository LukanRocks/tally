import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StrictMode, useState } from 'react'
import { act, cleanup, render, screen, fireEvent } from '@testing-library/react'
import { useAutoRetry } from './useAutoRetry'

/**
 * The arrangement that produced the bug, not a bare renderHook: the retry handed
 * to the hook belongs to a *parent* that renders the consumer — SettingsProvider
 * renders ErrorScreen and passes its own refetch down. That is the only shape in
 * which "update a component while rendering a different component" can happen, so
 * the test has to reproduce it rather than call the hook in isolation.
 */
const Consumer = ({ onRetry }: { onRetry: () => void }) => {
  const { enabled, toggle, formatted } = useAutoRetry(onRetry)

  return <button onClick={toggle}>{enabled ? formatted : 'paused'}</button>
}

const Parent = ({ onRetry }: { onRetry: () => void }) => {
  const [attempts, setAttempts] = useState(0)

  // Stands in for SettingsProvider.fetchSettings: the callback sets state on the
  // parent, which is what turns a render-phase call into a React warning.
  const retry = () => {
    setAttempts((a) => a + 1)
    onRetry()
  }

  return (
    <>
      <span data-testid='attempts'>{attempts}</span>
      <Consumer onRetry={retry} />
    </>
  )
}

const renderApp = (onRetry = vi.fn()) => {
  render(
    <StrictMode>
      <Parent onRetry={onRetry} />
    </StrictMode>,
  )

  return { onRetry, countdown: () => screen.getByRole('button') }
}

const tick = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('useAutoRetry', () => {
  const consoleErrors: string[] = []

  beforeEach(() => {
    vi.useFakeTimers()
    consoleErrors.length = 0
    vi.spyOn(console, 'error').mockImplementation((...args) => void consoleErrors.push(args.join(' ')))
  })

  /**
   * The regression, asserted after every test rather than in one of them. React
   * warns about a render-phase update only the first time it sees one, so a
   * single dedicated test would pass for free the moment any test above it
   * tripped the warning first. Checking every test makes the guard immune to
   * ordering: whichever one reintroduces the bug is the one that fails.
   *
   * The bug: the countdown fired the retry from inside a setCountdown updater.
   * React runs updaters lazily, during the render phase of the component that
   * owns the state — so each attempt called the parent's setState mid-render,
   * and StrictMode's double invocation ran the whole retry twice per cycle.
   */
  afterEach(() => {
    vi.useRealTimers()
    // Unmount before asserting. A throw here would otherwise skip the shared
    // cleanup afterEach and leak this test's DOM into the next one, turning one
    // real failure into a cascade of unrelated ones.
    cleanup()

    expect(consoleErrors.join('\n')).not.toMatch(/while rendering a different component/)
  })

  it('counts down towards the next attempt', () => {
    const { countdown } = renderApp()

    expect(countdown()).toHaveTextContent('0:30')

    tick(5000)

    expect(countdown()).toHaveTextContent('0:25')
  })

  it('retries when the countdown runs out and starts over', () => {
    const { onRetry, countdown } = renderApp()

    tick(30_000)

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(countdown()).toHaveTextContent('0:30')

    tick(30_000)

    expect(onRetry).toHaveBeenCalledTimes(2)
  })

  it('stops attempting once paused', () => {
    const { onRetry, countdown } = renderApp()

    fireEvent.click(countdown())

    expect(countdown()).toHaveTextContent('paused')

    tick(90_000)

    expect(onRetry).not.toHaveBeenCalled()
  })
})
