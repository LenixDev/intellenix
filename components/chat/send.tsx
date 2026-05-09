import { Button } from 'tamagui'
import { Send as ISend, Mic } from '@tamagui/lucide-icons-2'

export const Send = ({
	content,
	send,
	aiThinking,
	r_tPM
}: {
	content: string
	send: () => void
	aiThinking: boolean
	r_tPM: boolean
}) => (
	<Button
		circular
		chromeless
		icon={content.trim() ? ISend : Mic}
		disabled={aiThinking || r_tPM}
		onPress={send}
		size='$3'
		ml='$3'
		hoverStyle={{
			borderColor: '$color6',
			bg: '$background08'
		}}
	/>
)
