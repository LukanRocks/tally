import { Redirect } from 'expo-router'
import { getServerUrl } from '../lib/storage'

export default function Index() {
  const hasServer = getServerUrl() !== null

  return <Redirect href={hasServer ? '/(tabs)' : '/setup'} />
}
