import { TamaguiProvider, View } from '@tamagui/core'
import { config } from '~/tamagui.config'
import { Button } from 'tamagui'
import { useColorScheme } from 'react-native'

export default function App() {
	const theme = useColorScheme()
  return (
		<TamaguiProvider config={config} defaultTheme={theme ?? 'light'}>
			<View width={"100%"} justify={"center"} items={"center"}>
				<Button theme="blue">Hello world</Button>
			</View>
		</TamaguiProvider>
  );
}