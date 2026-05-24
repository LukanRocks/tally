import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'tally_server_url'
let _serverUrl: string | null = null

export async function loadServerUrl(): Promise<string | null> {
  return await AsyncStorage.getItem(KEY)
}

export async function saveServerUrl(url: string): Promise<void> {
  _serverUrl = url
  await AsyncStorage.setItem(KEY, url)
}

export async function clearServerUrl(): Promise<void> {
  _serverUrl = null
  await AsyncStorage.removeItem(KEY)
}

export function getServerUrl(): string | null {
  return _serverUrl
}

export function resolveAssetUrl(path: string | null): string | null {
  if (!path || !_serverUrl) return null
  return `${_serverUrl}${path}`
}
