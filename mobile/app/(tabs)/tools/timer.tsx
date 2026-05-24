import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTimer } from '../../../hooks/useTimer'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

function getColor(pct: number): string {
  if (pct > 0.4) return '#22c55e'
  if (pct > 0.2) return '#facc15'
  return '#ef4444'
}

const PRESETS = [
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
]

export default function TimerScreen() {
  const timer = useTimer()
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSecondsLocal] = useState(0)
  const [resetting, setResetting] = useState(false)
  const [blink, setBlink] = useState(true)

  const fillHeight = useSharedValue(0)

  useEffect(() => {
    fillHeight.value = withTiming((1 - timer.pct) * 100, {
      duration: resetting ? 500 : 1000,
      easing: Easing.linear,
    })
  }, [timer.pct, resetting])

  useEffect(() => {
    if (timer.state !== 'expired') return
    const id = setInterval(() => setBlink(b => !b), 500)
    return () => clearInterval(id)
  }, [timer.state])

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value}%`,
  }))

  const isIdle = timer.state === 'idle'
  const isExpired = timer.state === 'expired'
  const totalSeconds = minutes * 60 + seconds

  function handleStart() {
    setResetting(false)
    timer.start(totalSeconds)
  }

  function handleStop() {
    timer.stop()
  }

  function handleRestart() {
    setResetting(true)
    timer.restart()
    setTimeout(() => setResetting(false), 600)
  }

  function handlePreset(val: number) {
    const m = Math.floor(val / 60)
    const s = val % 60
    setMinutes(m)
    setSecondsLocal(s)
  }

  if (isIdle) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.idleContainer}>
          <Text style={styles.idleTitle}>Turn Timer</Text>

          <View style={styles.stepperRow}>
            <Stepper label="min" value={minutes} onChange={setMinutes} min={0} max={99} />
            <Text style={styles.colon}>:</Text>
            <Stepper label="sec" value={seconds} onChange={setSecondsLocal} min={0} max={59} />
          </View>

          <View style={styles.presets}>
            {PRESETS.map(p => (
              <Pressable key={p.label} style={styles.presetBtn} onPress={() => handlePreset(p.value)}>
                <Text style={styles.presetText}>{p.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.startBtn, totalSeconds === 0 && styles.btnDisabled]}
            onPress={handleStart}
            disabled={totalSeconds === 0}
          >
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const color = isExpired ? '#ef4444' : getColor(timer.pct)

  return (
    <View style={styles.runningContainer}>
      <Animated.View style={[styles.fill, fillStyle, { backgroundColor: color }]} />
      <SafeAreaView style={styles.runningContent} edges={['bottom']}>
        <Text style={[styles.timeDisplay, isExpired && !blink && { opacity: 0 }]}>
          {formatTime(timer.remaining)}
        </Text>

        <View style={styles.controls}>
          <Pressable style={styles.controlBtn} onPress={handleStop}>
            <Text style={styles.controlBtnText}>Stop</Text>
          </Pressable>
          <Pressable style={styles.controlBtn} onPress={handleRestart}>
            <Text style={styles.controlBtnText}>Restart</Text>
          </Pressable>
          <Pressable
            style={styles.controlBtn}
            onPress={timer.state === 'running' ? timer.pause : timer.resume}
          >
            <Text style={styles.controlBtnText}>
              {timer.state === 'running' ? 'Pause' : 'Resume'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.addTimeRow}>
          {[10, 30, 60].map(n => (
            <Pressable
              key={n}
              style={[styles.addBtn, isExpired && styles.btnDisabled]}
              onPress={() => timer.addSeconds(n)}
              disabled={isExpired}
            >
              <Text style={styles.addBtnText}>+{n}s</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </View>
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
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <TextInput
        style={styles.stepInput}
        value={String(value)}
        onChangeText={t => {
          const n = parseInt(t, 10)
          if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
        }}
        keyboardType="number-pad"
        selectTextOnFocus
      />
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 24,
  },
  idleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colon: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
  },
  stepper: {
    alignItems: 'center',
    gap: 8,
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
  stepInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    width: 60,
  },
  stepLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  presets: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 44,
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.4,
  },

  // Running mode
  runningContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  runningContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  timeDisplay: {
    fontSize: 80,
    fontWeight: '700',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    minHeight: 44,
    justifyContent: 'center',
  },
  controlBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  addTimeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    minHeight: 44,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
})
