import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../lib/api'
import { getServerUrl, saveServerUrl } from '../../lib/storage'

export default function SettingsScreen() {
  const [editing, setEditing] = useState(false)
  const [draftUrl, setDraftUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUrl = getServerUrl()

  function startEditing() {
    setDraftUrl(currentUrl)
    setError(null)
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
    const trimmed = draftUrl.trim().replace(/\/+$/, '')
    if (!trimmed) {
      setError('Please enter a server URL.')
      return
    }
    setLoading(true)
    setError(null)
    const previous = getServerUrl()
    await saveServerUrl(trimmed)
    try {
      await api.health.check()
      setEditing(false)
    } catch {
      await saveServerUrl(previous)
      setError('Could not reach the server — check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.sectionHeader}>Server</Text>

        {editing ? (
          <View style={styles.editCard}>
            <TextInput
              style={styles.input}
              value={draftUrl}
              onChangeText={setDraftUrl}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
              autoFocus
              onSubmitEditing={handleSave}
              returnKeyType="done"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.editActions}>
              <Pressable style={styles.cancelBtn} onPress={cancelEditing} disabled={loading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, loading && styles.btnDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.displayRow}>
            <View style={styles.displayText}>
              <Text style={styles.rowLabel}>Server URL</Text>
              <Text style={styles.rowValue} numberOfLines={1}>{currentUrl || 'Not set'}</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={startEditing}>
              <Text style={styles.editBtnText}>Edit</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    minHeight: 64,
  },
  displayText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    minHeight: 36,
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  editCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#0f172a',
  },
  saveBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})
