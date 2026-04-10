import { Button } from 'tamagui'
import { Send as ISend } from '@tamagui/lucide-icons-2'

export const Send = ({
	content,
	send,
	aiThinking
}: {
	content: string
	send: () => void
	aiThinking: boolean
}) => (
	<Button
		circular
		chromeless
		icon={ISend}
		iconSize='$8'
		disabled={aiThinking || !content.trim()}
		onPress={send}
	/>
)