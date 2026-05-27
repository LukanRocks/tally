import { ErrorScreen } from '@/components/feedback/error-screen'

const mockError = Object.assign(new Error('Connection refused'), { code: 503 })

export const ErrorScreenSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Error screen</h2>
      <p className='mt-1 text-sm text-ink-secondary'>Full-screen error state when the server is unreachable. Includes auto-retry.</p>
    </div>

    <div className='overflow-hidden rounded-xl border border-border'>
      <ErrorScreen error={mockError} onRetry={() => {}} />
    </div>
  </section>
)
