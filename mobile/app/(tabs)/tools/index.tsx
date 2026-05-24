import { router } from 'expo-router'
import { Dices, Shuffle, Timer } from 'lucide-react-native'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const TOOLS = [
  {
    title: 'Turn Timer',
    description: 'Countdown timer with play, pause, and reset',
    icon: Timer,
    route: '/(tabs)/tools/timer' as const,
  },
  {
    title: 'Who Goes First?',
    description: 'Random prompt to determine who goes first',
    icon: Shuffle,
    route: '/(tabs)/tools/first-player' as const,
  },
  {
    title: 'Dice Roller',
    description: 'Roll any number of any dice',
    icon: Dices,
    route: '/(tabs)/tools/dice' as const,
  },
]

export default function ToolsIndexScreen() {
  return (
    <View style={styles.container}>
      {TOOLS.map(tool => {
        const Icon = tool.icon
        return (
          <TouchableOpacity
            key={tool.title}
            style={styles.card}
            onPress={() => router.push(tool.route)}
            activeOpacity={0.7}
          >
            <Icon size={28} color="#0f172a" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{tool.title}</Text>
              <Text style={styles.cardDesc}>{tool.description}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    gap: 16,
    minHeight: 80,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#94a3b8',
  },
})
