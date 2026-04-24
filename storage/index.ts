import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const key = 'groq_key' as const

export const prefs = {
	// eslint-disable-next-line @stylistic/max-len, @stylistic/no-confusing-arrow
	getKey: async () => Platform.OS === 'web' ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
	setKey: async (val: string): Promise<void> => {
		if (Platform.OS !== 'web') return SecureStore.setItemAsync(key, val)
		localStorage.setItem(key, val)
		return undefined
	}
}
