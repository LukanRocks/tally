import { Stack } from 'expo-router'

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Tools' }} />
      <Stack.Screen name="timer" options={{ title: 'Turn Timer' }} />
      <Stack.Screen name="first-player" options={{ title: 'Who Goes First?' }} />
      <Stack.Screen name="dice" options={{ title: 'Dice Roller' }} />
    </Stack>
  )
}
