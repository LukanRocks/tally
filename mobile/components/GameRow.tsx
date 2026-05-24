import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Game } from '../lib/types'
import CoverImage from './CoverImage'

interface Props {
  game: Game
  onPress: () => void
}

function playerCountLabel(game: Game): string {
  if (game.min_players && game.max_players) {
    if (game.min_players === game.max_players) return `${game.min_players} players`
    return `${game.min_players}–${game.max_players} players`
  }
  if (game.min_players) return `${game.min_players}+ players`
  if (game.max_players) return `Up to ${game.max_players} players`
  return ''
}

export default function GameRow({ game, onPress }: Props) {
  const playerCount = playerCountLabel(game)
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <CoverImage path={game.cover_image_path} size={48} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{game.name}</Text>
        {playerCount ? <Text style={styles.meta}>{playerCount}</Text> : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  cover: {
    marginRight: 12,
    borderRadius: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  meta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
})
