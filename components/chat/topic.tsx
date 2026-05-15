import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Input, Label, YStack } from "tamagui"

export const Topic = ({
	send
}: {
	send: (request?: string) => void
}) => {
	const [topic, setTopic] = useState('')
	const { t } = useTranslation()

	return (
		<YStack gap='$2'>
			<Label htmlFor='topic' lineHeight='$1'>{t('what_conversation')}</Label>
			<Input
				value={topic}
				onChangeText={setTopic}
				id='topic'
				placeholder={t('conversation_topic')}
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