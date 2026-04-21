import { Command } from '@tamagui/lucide-icons-2'
import { Kbd } from '../kdb'
import { Separator, Text, View, XStack } from 'tamagui'

export const Kdb = ({ isMac }: { isMac: boolean }) => (
	<XStack flexDirection='row' items='center' gap='$3'>
		<View flexDirection='row' items='center'>
			<Text color='$color06' fontSize='$1'>Press</Text>
			<Kbd size={10}>Tab</Kbd>
			<Text color='$color06' fontSize='$1'>to focus</Text>
		</View>
		<Separator vertical height={12} borderColor='$color02' />
		<View flexDirection='row' gap='$1' items='center'>
			<Text color='$color06' fontSize='$1'>
				Press
			</Text>
			<View flexDirection='row' items='center'>
				<Kbd size={10}>
					{isMac ? <Command color='$color06' size={10} /> :	'Ctrl'}
				</Kbd>
				<Text>+</Text>
				<Kbd size={10}>Enter</Kbd>
			</View>
			<Text color='$color06' fontSize='$1'>
				to send
			</Text>
		</View>
	</XStack>
)
