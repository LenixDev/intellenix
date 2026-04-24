import { Button } from 'tamagui'
import { Send as ISend, Mic } from '@tamagui/lucide-icons-2'

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
		icon={content.trim() ? ISend : Mic}
		disabled={aiThinking}
		onPress={send}
		size='$3'
		hoverStyle={{
			borderColor: '$color6',
			bg: '$background08'
		}}
	/>
)
