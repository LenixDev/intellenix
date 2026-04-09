import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const key = 'groq_key' as const

export const prefs = {
  getKey: () => Platform.OS === 'web'
    ? localStorage.getItem(key)
    : SecureStore.getItemAsync(key),
  setKey: (val: string) => Platform.OS === 'web'
    ? localStorage.setItem(key, val)
    : SecureStore.setItemAsync(key, val),
}