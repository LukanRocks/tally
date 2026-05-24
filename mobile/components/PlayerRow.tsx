import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface Props {
  rank: number
  name: string
  totalPoints: number
  onPress: () => void
}

export default function PlayerRow({ rank, name, totalPoints, onPress }: Props) {
  const isFirst = rank === 1
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.badge, isFirst && styles.badgeGold]}>
        <Text style={[styles.badgeText, isFirst && styles.badgeTextGold]}>{rank}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.points}>{totalPoints} pts</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeGold: {
    backgroundColor: '#fbbf24',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  badgeTextGold: {
    color: '#ffffff',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a',
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
})
