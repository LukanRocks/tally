import { useLocalSearchParams } from 'expo-router'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import CoverImage from '../../../components/CoverImage'
import ErrorScreen from '../../../components/ErrorScreen'
import LoadingScreen from '../../../components/LoadingScreen'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../lib/api'
import type { Session } from '../../../lib/types'

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

function playerCountLabel(min: number | null, max: number | null): string {
  if (min && max) {
    if (min === max) return `${min} players`
    return `${min}–${max} players`
  }
  if (min) return `${min}+ players`
  if (max) return `Up to ${max} players`
  return ''
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const gameId = Number(id)

  const { data: game, loading: loadingGame, error: errorGame, refetch: refetchGame } =
    useApi(() => api.games.get(gameId), [gameId])
  const { data: allSessions, loading: loadingSessions, error: errorSessions, refetch: refetchSessions } =
    useApi(api.sessions.list, [])

  if ((loadingGame && !game) || (loadingSessions && !allSessions)) return <LoadingScreen />
  if (errorGame) return <ErrorScreen message={errorGame} onRetry={refetchGame} />
  if (errorSessions) return <ErrorScreen message={errorSessions} onRetry={refetchSessions} />
  if (!game) return null

  const recentSessions = (allSessions ?? [])
    .filter(s => s.game_id === gameId)
    .sort((a, b) => b.played_at.localeCompare(a.played_at))
    .slice(0, 5)

  const playerCount = playerCountLabel(game.min_players, game.max_players)

  return (
    <FlatList<Session>
      style={styles.container}
      data={recentSessions}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View>
          <CoverImage
            path={game.cover_image_path}
            size={{ width: 9999, height: 240 }}
            style={styles.cover}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{game.name}</Text>
            {game.year_published ? (
              <Text style={styles.meta}>{game.year_published}</Text>
            ) : null}
            {playerCount ? (
              <Text style={styles.meta}>{playerCount}</Text>
            ) : null}
          </View>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.sessionRow}>
          <Text style={styles.sessionDate}>{formatDate(item.played_at)}</Text>
          {item.player_count != null && (
            <Text style={styles.sessionMeta}>{item.player_count} players</Text>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No sessions for this game yet.</Text>
      }
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  cover: {
    width: '100%',
    height: 240,
    borderRadius: 0,
  },
  info: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  sessionDate: {
    fontSize: 15,
    color: '#0f172a',
  },
  sessionMeta: {
    fontSize: 13,
    color: '#94a3b8',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
    paddingHorizontal: 32,
    marginTop: 16,
  },
})
