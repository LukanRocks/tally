import { router } from 'expo-router'
import { useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import ErrorScreen from '../../../components/ErrorScreen'
import LoadingScreen from '../../../components/LoadingScreen'
import { useLogSession } from '../../../context/LogSessionContext'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../lib/api'
import type { Player } from '../../../lib/types'

export default function LogSelectPlayersScreen() {
  const context = useLogSession()
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const { data, loading, error, refetch } = useApi(
    async () => {
      const players = await api.players.list()
      return players.filter(p => p.player_type === 'person')
    },
    []
  )

  if (loading && !data) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} onRetry={refetch} />

  function toggle(id: number) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleNext() {
    const selectedPlayers = (data ?? []).filter(p => selected.has(p.id))
    context.setPlayers(selectedPlayers)
    router.push('/(tabs)/log/results')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList<Player>
        style={styles.list}
        data={data ?? []}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id)
          return (
            <Pressable
              style={styles.row}
              onPress={() => toggle(item.id)}
            >
              <Text style={styles.playerName}>{item.name}</Text>
              <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          )
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No players found.</Text>
        }
      />

      <View style={styles.footer}>
        {selected.size < 2 && (
          <Text style={styles.hint}>Select at least 2 players.</Text>
        )}
        <Text style={styles.count}>{selected.size} selected</Text>
        <Pressable
          style={[styles.nextButton, selected.size < 2 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selected.size < 2}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    flex: 1,
  },
  count: {
    fontSize: 13,
    color: '#94a3b8',
  },
  nextButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 48,
  },
})
