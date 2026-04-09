import { TamaguiProvider } from '@tamagui/core'
import { config } from '@/tamagui.config'
import { useColorScheme } from 'react-native'
import { Slot } from 'expo-router'
import { Toaster } from '@tamagui/toast/v2'
import { SpeedInsights } from '@vercel/speed-insights/react'

export default function App() {
	const theme = useColorScheme()
	return (
		<TamaguiProvider config={config} defaultTheme={theme ?? 'light'}>
			<Toaster />
			<Slot />
			<SpeedInsights />
		</TamaguiProvider>
	)
}
