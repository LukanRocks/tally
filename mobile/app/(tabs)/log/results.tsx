import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import { GripVertical } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useLogSession } from '../../../context/LogSessionContext'
import { api } from '../../../lib/api'
import { calcPoints } from '../../../lib/points'
import type { Player } from '../../../lib/types'

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function LogResultsScreen() {
  const context = useLogSession()
  const [ranked, setRanked] = useState<Player[]>(context.players)
  const [playedAt, setPlayedAt] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    setRanked(context.players)
  }, [context.players])

  async function handleSubmit() {
    setSubmitting(true)
    const now = new Date()
    const dateStr = playedAt.toISOString().slice(0, 10)
    const timeStr = now.toTimeString().slice(0, 8)

    try {
      await api.sessions.create({
        game_id: context.game!.id,
        played_at: `${dateStr}T${timeStr}`,
        notes: notes.trim() || undefined,
        results: ranked.map((p, i) => ({ player_id: p.id, rank: i + 1 })),
      })
      Toast.show({ type: 'success', text1: 'Session logged!' })
      context.reset()
      router.replace('/(tabs)/log')
    } catch {
      Toast.show({ type: 'error', text1: 'Something went wrong — try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {context.game && (
        <Text style={styles.gameName} numberOfLines={1}>{context.game.name}</Text>
      )}

      <DraggableFlatList
        data={ranked}
        keyExtractor={item => String(item.id)}
        onDragEnd={({ data }) => setRanked(data)}
        renderItem={({ item, drag, isActive, getIndex }) => {
          const index = getIndex() ?? 0
          const rank = index + 1
          const points = calcPoints(ranked.length, rank)
          return (
            <ScaleDecorator>
              <View style={[styles.resultRow, isActive && styles.resultRowActive]}>
                <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
                  <GripVertical size={20} color="#94a3b8" />
                </TouchableOpacity>
                <View style={[styles.rankBadge, rank === 1 && styles.rankBadgeGold]}>
                  <Text style={[styles.rankText, rank === 1 && styles.rankTextGold]}>{rank}</Text>
                </View>
                <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.pointsPreview}>{points} pts</Text>
              </View>
            </ScaleDecorator>
          )
        }}
        style={styles.list}
        containerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.dateValue}>{formatDate(playedAt)}</Text>
        </TouchableOpacity>

        {(showDatePicker || Platform.OS === 'android') && (
          <DateTimePicker
            value={playedAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setShowDatePicker(false)
              if (date) setPlayedAt(date)
            }}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional notes…"
          placeholderTextColor="#94a3b8"
        />

        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Log Session</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gameName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  resultRowActive: {
    backgroundColor: '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dragHandle: {
    paddingRight: 8,
    minWidth: 32,
    minHeight: 44,
    justifyContent: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeGold: {
    backgroundColor: '#fbbf24',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  rankTextGold: {
    color: '#ffffff',
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  pointsPreview: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  dateLabel: {
    fontSize: 15,
    color: '#0f172a',
  },
  dateValue: {
    fontSize: 15,
    color: '#94a3b8',
  },
  notesInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  submitButton: {
    backgroundColor: '#0f172a',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})
