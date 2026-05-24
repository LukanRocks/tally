import { Stack } from 'expo-router'

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0f172a',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Library' }} />
      <Stack.Screen name="[id]" options={{ title: 'Game' }} />
    </Stack>
  )
}
