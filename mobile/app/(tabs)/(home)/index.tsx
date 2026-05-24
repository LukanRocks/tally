import { router } from 'expo-router'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import ErrorScreen from '../../../components/ErrorScreen'
import LoadingScreen from '../../../components/LoadingScreen'
import PlayerRow from '../../../components/PlayerRow'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../lib/api'
import type { LeaderboardEntry } from '../../../lib/types'

export default function LeaderboardScreen() {
  const { data, loading, error, refetch } = useApi(api.stats.leaderboard)

  if (loading && !data) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} onRetry={refetch} />

  return (
    <View style={styles.container}>
      <FlatList<LeaderboardEntry>
        data={data ?? []}
        keyExtractor={item => String(item.player_id)}
        renderItem={({ item, index }) => (
          <PlayerRow
            rank={index + 1}
            name={item.player_name}
            totalPoints={item.total_points}
            onPress={() => router.push(`/(tabs)/(home)/player/${item.player_id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No sessions logged yet.</Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 48,
  },
})
