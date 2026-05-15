import { S } from "@/types"
import { useTranslation } from "react-i18next"
import { Button, Input, Label, YStack } from "tamagui"

export const Topic = ({
	send,
	topic,
	setTopic
}: {
	send: (request?: string) => void
	topic: string
	setTopic: S<string>
}) => {
	const { t } = useTranslation()

	return (
		<YStack gap='$2'>
			<Label htmlFor='topic' lineHeight='$1'>{t('what_conversation')}</Label>
			<Input
				value={topic}
				onChangeText={setTopic}
				id='topic'
				placeholder={t('conversation_topic')}
				fontSize={16}
			/>
			<Button
				chromeless
				onPress={() => {
					send(topic)
				}}
			>{t('create_conversation')}</Button>
		</YStack>
	)
}