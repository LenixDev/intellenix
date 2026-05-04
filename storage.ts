import { Key } from '@/types'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

export const prefs = {
	getKey: async (key: Key) =>
		Platform.OS === 'web' ?
			localStorage.getItem(key)
		:	SecureStore.getItemAsync(key),
	setKey: async (val: string, key: Key) => {
		if (Platform.OS !== 'web') return SecureStore.setItemAsync(key, val)
		localStorage.setItem(key, val)
	},
	destroy: async (key: Key) => {
		if (Platform.OS !== 'web') return SecureStore.deleteItemAsync(key)
		localStorage.removeItem(key)
	}
}
