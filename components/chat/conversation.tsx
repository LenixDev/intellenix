import type { Conversation as IConversation } from '@/types'
import { Copy, Pencil } from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View, Button, VisuallyHidden } from 'tamagui'
import * as Clipboard from 'expo-clipboard'
import { i18n } from 'i18next'

const CopyButton = ({ text }: { text: string }) => <Button
	chromeless
	circular
	icon={Copy}
	size='$2'
	onPress={() => {
		Clipboard.setStringAsync(text)
	}}
/>

const EditButton = ({ t }: { t: i18n['t'] }) => <Button
	chromeless
	circular
	icon={Pencil}
	size='$2'
	onPress={() => {
		toast.info(t('not_yet'))
	}}
/>

const MessageInfo = ({ $, t }: { $: IConversation, t: i18n['t'] }) => (
	<View gap={0} items='flex-end'>
		<Text color='$color04' fontSize='$1'>
			{$.date}
		</Text>
		<Text color='$color04' fontStyle='italic' fontSize='$1'>
			{t('tokens_used')} {($ as any).completion_tokens}
		</Text>
	</View>
)

// eslint-disable-next-line max-lines-per-function
export const Conversation = ({
	conversations,
	scrollRef,
	isPortrait
}: {
	conversations: IConversation[]
	scrollRef: React.RefObject<ScrollView | null>
	isPortrait: boolean
}) => {
	const [shown, setShown] = useState<Record<string, boolean>>({})
	const { t } = useTranslation()

	return (
		<ScrollView
			ref={scrollRef}
			width='100%'
			pt='$10'
			px={isPortrait ? '$2' : '$5'}
			flex={1}
			onContentSizeChange={() => {
				scrollRef.current?.scrollToEnd({ animated: true })
			}}
			scrollbarWidth='none'>
			{/* eslint-disable-next-line max-lines-per-function */}
			{conversations.map($ => {
				if ($.role === 'user')
					return (
						<View
							key={$.date}
							items='flex-end'
							gap='$4'
							mb='$5'
							onClick={() => setShown({ [$.date]: !shown[$.date] })}
							>
							<View flexDirection='row' items='center' gap='$3'>
								{shown[$.date] ? <>
									<EditButton t={t} />
									<CopyButton text={$.content} />
								</> : <VisuallyHidden>
									<EditButton t={t} />
									<CopyButton text={$.content} />
								</VisuallyHidden>}
								<Text
									py='$2'
									px='$3'
									maxW='100%'
									color='$colorFocus'
									bg='$color01'
									rounded='$5'>
									{$.content}
								</Text>
							</View>
							{shown[$.date] ? <MessageInfo $={$} t={t} /> : <VisuallyHidden>
								<MessageInfo $={$} t={t} />
							</VisuallyHidden>}
						</View>
					)
				return (
					<View
						key={$.date}
						gap='$4'
						mb='$10'
						onClick={() => setShown({ [$.date]: !shown[$.date] })}>
						<View flexDirection='row' gap='$3'>
							<Text maxW='90%' self='flex-start' color='$color'>
								{$.content}
							</Text>
							{shown[$.date] ? <CopyButton text={$.content} /> : <VisuallyHidden>
								<CopyButton text={$.content} />
							</VisuallyHidden>}
						</View>
						<View opacity={shown[$.date] === true ? 1 : 0} gap={0}>
							<Text color='$color04' fontSize='$1'>
								{$.date}
							</Text>
							<Text color='$color04' fontStyle='italic' fontSize='$1'>
								{t('took')} {$.usage?.queue_time?.toFixed(2)}
								{t('s')} | {t('tokens_used')} {$.usage?.completion_tokens} |{' '}
								{t('service_tier')} {$.service_tier}
							</Text>
						</View>
					</View>
				)
			})}
		</ScrollView>
	)
}
