import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY } = process.env
if (typeof EXPO_PUBLIC_SUPABASE_URL !== 'string' || typeof EXPO_PUBLIC_SUPABASE_KEY !== 'string')
	throw new Error('Could not find Supabase credentials', {
		cause: { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_KEY }
	})

export const supabase = createClient(
	EXPO_PUBLIC_SUPABASE_URL,
	EXPO_PUBLIC_SUPABASE_KEY,
	{
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		}
	}
)