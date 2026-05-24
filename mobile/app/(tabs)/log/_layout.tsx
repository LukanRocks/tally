import { Stack } from 'expo-router'
import { LogSessionProvider } from '../../../context/LogSessionContext'

export default function LogLayout() {
  return (
    <LogSessionProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0f172a',
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Pick a Game' }} />
        <Stack.Screen name="players" options={{ title: 'Select Players' }} />
        <Stack.Screen name="results" options={{ title: 'Record Results' }} />
      </Stack>
    </LogSessionProvider>
  )
}
