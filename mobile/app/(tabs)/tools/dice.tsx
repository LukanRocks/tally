import { useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

type Phase = 'setup' | 'rolling' | 'results'

const PRESETS = [2, 4, 6, 8, 10, 12, 20, 100]

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function getGridColumns(count: number): number {
  if (count === 1) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

function randomDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function DieCell({ value, animating }: { value: number; animating: boolean }) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (animating) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        -1,
        false
      )
    } else {
      opacity.value = withTiming(1, { duration: 100 })
    }
  }, [animating])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View style={[styles.dieCell, style]}>
      <Text style={styles.dieValue}>{value}</Text>
    </Animated.View>
  )
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function DiceScreen() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [count, setCount] = useState(2)
  const [sides, setSides] = useState(6)
  const [displayValues, setDisplayValues] = useState<number[]>([])
  const [results, setResults] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  function roll() {
    const final = Array.from({ length: count }, () => randomDie(sides))
    setResults(final)
    setDisplayValues(Array.from({ length: count }, () => randomDie(sides)))
    setPhase('rolling')
    startTimeRef.current = Date.now()

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const t = Math.min(elapsed / 1800, 1)
      const updateChance = 1 - easeOut(t)

      if (Math.random() < lerp(1, 0, easeOut(t))) {
        setDisplayValues(prev => prev.map((_, i) =>
          Math.random() < updateChance ? randomDie(sides) : final[i]
        ))
      }

      if (elapsed >= 1800) {
        clearInterval(intervalRef.current!)
        intervalRef.current = null
        setDisplayValues(final)
        setPhase('results')
      }
    }, 16)
  }

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const numCols = getGridColumns(count)
  const total = results.reduce((a, b) => a + b, 0)
  const isRolling = phase === 'rolling'

  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.setupContainer}>
          <View style={styles.steppers}>
            <Stepper label="Dice" value={count} onChange={setCount} min={1} max={10} />
            <Stepper label="Sides" value={sides} onChange={setSides} min={2} max={999} />
          </View>

          <View style={styles.presets}>
            {PRESETS.map(d => (
              <Pressable
                key={d}
                style={[styles.presetBtn, sides === d && styles.presetBtnActive]}
                onPress={() => setSides(d)}
              >
                <Text style={[styles.presetText, sides === d && styles.presetTextActive]}>
                  d{d}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.rollBtn} onPress={roll}>
            <Text style={styles.rollBtnText}>Roll</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.resultsContainer}>
        <FlatList
          data={displayValues}
          keyExtractor={(_, i) => String(i)}
          numColumns={numCols}
          key={numCols}
          renderItem={({ item }) => (
            <DieCell value={item} animating={isRolling} />
          )}
          contentContainerStyle={styles.dieGrid}
          scrollEnabled={false}
        />

        {!isRolling && (
          <>
            <Text style={styles.totalText}>{total}</Text>
            <View style={styles.resultActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={roll}
              >
                <Text style={styles.actionBtnText}>Roll Again</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.actionBtnSecondary]}
                onPress={() => setPhase('setup')}
              >
                <Text style={styles.actionBtnTextSecondary}>New Roll</Text>
              </Pressable>
            </View>
          </>
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
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 28,
  },
  steppers: {
    flexDirection: 'row',
    gap: 40,
  },
  stepper: {
    alignItems: 'center',
    gap: 8,
  },
  stepperLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    color: '#0f172a',
    fontWeight: '600',
  },
  stepValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    minWidth: 50,
    textAlign: 'center',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 44,
    justifyContent: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  presetText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  presetTextActive: {
    color: '#ffffff',
  },
  rollBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  rollBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 24,
  },
  dieGrid: {
    alignItems: 'center',
  },
  dieCell: {
    width: 72,
    height: 72,
    margin: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  dieValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionBtnTextSecondary: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
})
