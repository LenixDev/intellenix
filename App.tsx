import { TamaguiProvider } from '@tamagui/core'
import { config } from '@/tamagui.config'
import { useColorScheme } from 'react-native'
import { Signin } from '@/app/signin'
import { Home } from '@/app/home'
import { Toaster } from '@tamagui/toast/v2'

export default function App() {
	const theme = useColorScheme()
	return (
		<TamaguiProvider config={config} defaultTheme={theme ?? 'light'}>
			<Toaster />
			<Home />
		</TamaguiProvider>
	)
}
