import { useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Prompt } from '../../../data/firstPlayerPrompts'
import { PROMPTS } from '../../../data/firstPlayerPrompts'

type Phase = 'idle' | 'animating' | 'revealed'

function randomPrompt(): Prompt {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
}

export default function FirstPlayerScreen() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [displayText, setDisplayText] = useState('')
  const [finalPrompt, setFinalPrompt] = useState<Prompt | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startDraw() {
    setPhase('animating')
    setFinalPrompt(null)
    const chosen = randomPrompt()
    let elapsed = 0

    intervalRef.current = setInterval(() => {
      setDisplayText(randomPrompt().prompt)
      elapsed += 60
      if (elapsed >= 2000) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setDisplayText(chosen.prompt)
        setFinalPrompt(chosen)
        setPhase('revealed')
      }
    }, 60)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (phase === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.container}>
          <Text style={styles.title}>Who Goes First?</Text>
          <Text style={styles.subtitle}>Draw a random prompt to determine who starts the game.</Text>
          <Pressable style={styles.drawBtn} onPress={startDraw}>
            <Text style={styles.drawBtnText}>Draw</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {phase === 'revealed' && finalPrompt && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{finalPrompt.category}</Text>
          </View>
        )}
        <Text style={styles.promptText}>{displayText}</Text>
        {phase === 'revealed' && (
          <Pressable style={styles.rerollBtn} onPress={startDraw}>
            <Text style={styles.rerollBtnText}>Re-roll</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
  drawBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  drawBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  promptText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 42,
  },
  rerollBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 44,
    justifyContent: 'center',
  },
  rerollBtnText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
})
