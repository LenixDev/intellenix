import { S } from '@/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Label, Spinner, YStack } from 'tamagui'

export const Topic = ({
	send,
	topic,
	setTopic,
	isPortrait
}: {
	send: (request?: string) => Promise<void>
	topic: string
	setTopic: S<string>
	isPortrait: boolean
}) => {
	const { t } = useTranslation()
	const [loading, setLoading] = useState(false)

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
				readOnly={loading}
			/>
			<Button
				disabled={!topic || loading}
				chromeless
				onPress={async () => {
					setLoading(true)
					await send()
					setLoading(false)
				}}
			>
				{loading ? <Spinner /> : t('create_conversation')}
			</Button>
		</YStack>
	)
}
