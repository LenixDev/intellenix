import { TamaguiProvider } from '@tamagui/core'
import { config } from '@/tamagui.config'
import { useColorScheme } from 'react-native'
import { Signin } from '@/app/signin'
import { Home } from '@/app/home'
import { ToastProvider, ToastViewport } from 'tamagui'

export default function App() {
	const theme = useColorScheme()
	return (
		<TamaguiProvider config={config} defaultTheme={theme ?? 'light'}>
			<ToastProvider>
				<ToastViewport />
				<Home />
			</ToastProvider>
			</TamaguiProvider>
	)
}
