import { StyleSheet, Text, View } from 'react-native'
import type { ToastConfig } from 'react-native-toast-message'

export const toastConfig: ToastConfig = {
  success: ({ text1 }) => (
    <View style={[styles.toast, styles.success]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  error: ({ text1 }) => (
    <View style={[styles.toast, styles.error]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
}

const styles = StyleSheet.create({
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    minWidth: 200,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  success: {
    backgroundColor: '#0f172a',
  },
  error: {
    backgroundColor: '#ef4444',
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
})
