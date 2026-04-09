import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const key = 'groq_key' as const

export const prefs = {
	// eslint-disable-next-line @stylistic/no-confusing-arrow, @typescript-eslint/promise-function-async
	getKey: () => Platform.OS === 'web'
		? localStorage.getItem(key)
		: SecureStore.getItemAsync(key),
	// eslint-disable-next-line @typescript-eslint/promise-function-async, @stylistic/no-confusing-arrow
	setKey: (val: string) => Platform.OS === 'web'
		// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
		? localStorage.setItem(key, val)
		: SecureStore.setItemAsync(key, val)
}
