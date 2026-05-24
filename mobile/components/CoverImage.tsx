import { BookOpen } from 'lucide-react-native'
import { useState } from 'react'
import { Image, StyleSheet, View, ViewStyle } from 'react-native'
import { resolveAssetUrl } from '../lib/storage'

interface Props {
  path: string | null
  size: number | { width: number; height: number }
  style?: ViewStyle
}

export default function CoverImage({ path, size, style }: Props) {
  const [errored, setErrored] = useState(false)
  const uri = resolveAssetUrl(path)
  const width = typeof size === 'number' ? size : size.width
  const height = typeof size === 'number' ? size : size.height

  if (!uri || errored) {
    return (
      <View style={[styles.placeholder, { width, height }, style]}>
        <BookOpen size={Math.floor(width * 0.45)} color="#94a3b8" />
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width, height, borderRadius: 8 }, style]}
      onError={() => setErrored(true)}
      resizeMode="cover"
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
