import { useLocalSearchParams } from 'expo-router'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import ErrorScreen from '../../../../components/ErrorScreen'
import LoadingScreen from '../../../../components/LoadingScreen'
import { useApi } from '../../../../hooks/useApi'
import { api } from '../../../../lib/api'
import { resolveAssetUrl } from '../../../../lib/storage'
import type { Session } from '../../../../lib/types'

function formatDate(iso: string): string {
  return iso.slice(0, 10)
}

function InitialsAvatar({ name, size }: { name: string; size: number }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  )
}

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const playerId = Number(id)

  const { data: player, loading: loadingPlayer, error: errorPlayer, refetch: refetchPlayer } =
    useApi(() => api.players.get(playerId), [playerId])
  const { data: sessions, loading: loadingSessions, error: errorSessions, refetch: refetchSessions } =
    useApi(api.sessions.list, [])

  if ((loadingPlayer && !player) || (loadingSessions && !sessions)) return <LoadingScreen />
  if (errorPlayer) return <ErrorScreen message={errorPlayer} onRetry={refetchPlayer} />
  if (errorSessions) return <ErrorScreen message={errorSessions} onRetry={refetchSessions} />
  if (!player) return null

  const avatarUri = resolveAssetUrl(player.avatar_path)
  const recentSessions = (sessions ?? []).slice(0, 20)

  return (
    <FlatList<Session>
      style={styles.container}
      data={recentSessions}
      keyExtractor={item => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <InitialsAvatar name={player.name} size={64} />
          )}
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.since}>Member since {formatDate(player.created_at)}</Text>

          <View style={styles.grid}>
            <StatCell label="Points" value={String(player.total_points ?? 0)} />
            <StatCell label="Sessions" value={String(player.total_sessions ?? 0)} />
            <StatCell label="Wins" value={String(player.wins ?? 0)} />
            <StatCell label="Win Rate" value={`${Math.round((player.win_rate ?? 0) * 100)}%`} />
          </View>

          <Text style={styles.sectionTitle}>Recent Sessions</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.sessionRow}>
          <Text style={styles.sessionDate}>{formatDate(item.played_at)}</Text>
          <Text style={styles.sessionGame} numberOfLines={1}>{item.game_name ?? '—'}</Text>
          {item.player_count != null && (
            <Text style={styles.sessionMeta}>{item.player_count} players</Text>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No sessions found.</Text>
      }
    />
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  since: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    marginBottom: 24,
  },
  statCell: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  sessionDate: {
    fontSize: 13,
    color: '#94a3b8',
    width: 90,
  },
  sessionGame: {
    flex: 1,
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
    marginTop: 24,
    paddingHorizontal: 16,
  },
})
