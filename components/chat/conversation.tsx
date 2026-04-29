import type { Conversation as IConversation } from '@/types'
import { Copy, Pencil } from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View, Button } from 'tamagui'

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
				const opacify = shown[$.date] === true ? 1 : 0
				if ($.role === 'user')
					return (
						<View
							key={$.date}
							items='flex-end'
							gap='$4'
							mb='$5'
							onMouseEnter={() => setShown({ [$.date]: true })}
							onClick={() => setShown({ [$.date]: !shown[$.date] })}
							onMouseLeave={() => setShown({ [$.date]: false })}>
							<View flexDirection='row' items='center' gap='$3'>
								<Button
									chromeless
									circular
									icon={Pencil}
									opacity={opacify}
									size='$2'
									onPress={() => {
										toast.info(t('not_yet'))
									}}
								/>
								<Button
									chromeless
									circular
									icon={Copy}
									opacity={opacify}
									size='$2'
									onPress={() => {
										navigator.clipboard.writeText($.content)
									}}
								/>
								<Text
									py='$2'
									px='$3'
									maxW='90%'
									color='$colorFocus'
									bg='$color01'
									rounded='$5'>
									{$.content}
								</Text>
							</View>
							<View opacity={opacify} gap={0} items='flex-end'>
								<Text color='$color04' fontSize='$1'>
									{$.date}
								</Text>
								<Text color='$color04' fontStyle='italic' fontSize='$1'>
									{t('tokens_used')} {$.completion_tokens}
								</Text>
							</View>
						</View>
					)
				return (
					<View
						key={$.date}
						gap='$4'
						mb='$10'
						onMouseEnter={() => setShown({ [$.date]: true })}
						onClick={() => setShown({ [$.date]: shown[$.date] === false })}
						onMouseLeave={() => setShown({ [$.date]: false })}>
						<View flexDirection='row' gap='$3'>
							<Text maxW='90%' self='flex-start' color='$color'>
								{$.content}
							</Text>
							<Button
								chromeless
								circular
								icon={Copy}
								opacity={opacify}
								size='$2'
								onPress={() => {
									navigator.clipboard.writeText($.content)
								}}
							/>
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
