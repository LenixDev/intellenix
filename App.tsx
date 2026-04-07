import { TamaguiProvider, View } from '@tamagui/core'
import { config } from '~/tamagui.config'
import { Button } from 'tamagui'

export default function App() {
  return (
		<TamaguiProvider config={config} defaultTheme="light">
			<View width={200} height={200} background="$color" />
			<Button theme="blue">Hello world</Button>
		</TamaguiProvider>
  );
}