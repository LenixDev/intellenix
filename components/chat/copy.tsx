import { Copy as CopyIcon } from '@tamagui/lucide-icons-2'
import { Button, ButtonProps } from 'tamagui'
import * as Clipboard from 'expo-clipboard'

export const Copy = ({
	text,
	...props
}: { text: string } & Omit<ButtonProps, 'text'>) => (
	<Button
		chromeless
		circular
		icon={CopyIcon}
		size='$2'
		onPress={e => {
			Clipboard.setStringAsync(text)
			e.stopPropagation()
		}}
		{...props}
	/>
)
