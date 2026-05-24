import { router } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import ErrorScreen from '../../../components/ErrorScreen'
import GameRow from '../../../components/GameRow'
import LoadingScreen from '../../../components/LoadingScreen'
import { useLogSession } from '../../../context/LogSessionContext'
import { useApi } from '../../../hooks/useApi'
import { api } from '../../../lib/api'
import type { Game } from '../../../lib/types'

export default function LogPickGameScreen() {
  const context = useLogSession()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error, refetch } = useApi(api.games.list, [])

  useFocusEffect(
    useCallback(() => {
      context.reset()
    }, [])
  )

  if (loading && !data) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} onRetry={refetch} />

  const filtered = (data ?? []).filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function handleSelect(game: Game) {
    context.setGame(game)
    router.push('/(tabs)/log/players')
  }

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
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <GameRow game={item} onPress={() => handleSelect(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchQuery ? 'No games match.' : 'Your library is empty.'}
          </Text>
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
