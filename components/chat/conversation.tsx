import type { Conversation as IConversation } from '@/types'
import { useState } from 'react'
import { ScrollView, Text, View } from 'tamagui'

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
	
	return (
		<ScrollView
			ref={scrollRef}
			width='100%'
			px={isPortrait ? '$2' : '$5'}
			pb='$10'
			flex={1}
			justify='flex-end'
			minH={0}
			onContentSizeChange={() => {
				scrollRef.current?.scrollToEnd({ animated: true })
			}}
			scrollbarWidth='none'
		>
			{/* eslint-disable-next-line max-lines-per-function */}
			{conversations.map($ => {
				if ($.role === 'user') return (
					<View
						key={$.date}
						items='flex-end'
						gap='$4'
						mb='$5'
						onMouseEnter={() => {
							setShown({ [$.date]: true })
						}}
						onClick={() => {
							setShown({ [$.date]: shown[$.date] === false })
						}}
						onMouseLeave={() => {
							setShown({ [$.date]: false })
						}}
					>
						<Text
							py='$2'
							px='$3'
							maxW='90%'
							color='$colorFocus'
							bg='$color01'
							rounded='$5'
						>
							{$.content}
						</Text>
						<View opacity={shown[$.date] === true ? 1 : 0}>
							<Text
								color='$color04'
								fontStyle='italic'
								fontSize='$1'
							>{$.date}</Text>
						</View>
					</View>
				)
				return (
					<View
						key={$.date}
						gap='$4'
						mb='$10'
						onMouseEnter={() => {
							setShown({ [$.date]: true })
						}}
						onClick={() => {
							setShown({ [$.date]: shown[$.date] === false })
						}}
						onMouseLeave={() => {
							setShown({ [$.date]: false })
						}}
					>
						<Text
							maxW='90%'
							self='flex-start'
							color='$color'
						>
							{$.content}
						</Text>
						<View opacity={shown[$.date] === true ? 1 : 0}>
							<Text
								color='$color04'
								fontStyle='italic'
								fontSize='$1'
							>
								{$.date} | service tier: {$.service_tier} | tokens used: {$.usage?.completion_tokens}
							</Text>
						</View>
					</View>
				)
			})}
		</ScrollView>
	)
}
