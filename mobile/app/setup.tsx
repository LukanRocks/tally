import { router } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../lib/api'
import { saveServerUrl } from '../lib/storage'

export default function SetupScreen() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    const trimmed = url.trim().replace(/\/+$/, '')
    if (!trimmed) {
      setError('Please enter a server URL.')
      return
    }
    setLoading(true)
    setError(null)
    await saveServerUrl(trimmed)
    try {
      await api.health.check()
      router.replace('/(tabs)')
    } catch {
      await saveServerUrl('')
      setError('Could not reach the server — check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Tally</Text>
        <Text style={styles.subtitle}>Enter your server URL to get started</Text>

        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder='http://192.168.1.100:3001'
          keyboardType='url'
          autoCapitalize='none'
          autoCorrect={false}
          onSubmitEditing={handleConnect}
          returnKeyType='go'
        />

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleConnect} disabled={loading}>
          {loading ? <ActivityIndicator color='#ffffff' /> : <Text style={styles.buttonText}>Connect</Text>}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    marginTop: 16,
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
  },
})
