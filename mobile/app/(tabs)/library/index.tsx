import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native'
import ErrorScreen from '../../../components/ErrorScreen'
import GameRow from '../../../components/GameRow'
import LoadingScreen from '../../../components/LoadingScreen'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../lib/api'
import type { Game } from '../../../lib/types'

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [searchQuery])

  const { data, loading, error, refetch } = useApi(
    () => api.games.list(debouncedQuery || undefined),
    [debouncedQuery]
  )

  if (loading && !data) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} onRetry={refetch} />

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search games…"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList<Game>
        data={data ?? []}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <GameRow
            game={item}
            onPress={() => router.push(`/(tabs)/library/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchQuery ? 'No games match your search.' : 'Your library is empty. Add games from the web app.'}
          </Text>
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
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
    marginTop: 48,
    paddingHorizontal: 32,
  },
})
