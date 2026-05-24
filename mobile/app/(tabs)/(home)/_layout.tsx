import { Stack } from 'expo-router'

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="player/[id]" options={{ title: 'Player Profile' }} />
    </Stack>
  )
}
