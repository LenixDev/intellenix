import { S } from '@/types'
import { useTranslation } from 'react-i18next'
import { Button, Input, Label, YStack } from 'tamagui'

export const Topic = ({
	send,
	topic,
	setTopic,
	isPortrait
}: {
	send: (request?: string) => void
	topic: string
	setTopic: S<string>
	isPortrait: boolean
}) => {
	const { t } = useTranslation()

	return (
		<YStack gap='$2' width={isPortrait ? '90%' : '33%'}>
			<Label htmlFor='topic' lineHeight='$1'>
				{t('what_conversation')}
			</Label>
			<Input
				value={topic}
				onChangeText={setTopic}
				id='topic'
				placeholder={t('conversation_topic')}
				fontSize={16}
			/>
			<Button chromeless onPress={() => send()}>
				{t('create_conversation')}
			</Button>
		</YStack>
	)
}
