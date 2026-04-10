import { ScrollView, Text, View } from "tamagui"

export const Conversation = ({
	conversations,
	scrollRef
}: {
	conversations: {
		id: string
		role: 'user' | 'assistant'
		content: string
	}[]
	scrollRef: React.RefObject<ScrollView | null>
}) => (
	<ScrollView
		ref={scrollRef}
		width='100%'
		gap='$5'
		scrollbarWidth='none'
		flex={1}
		justify='flex-end'
		onContentSizeChange={() => { scrollRef.current?.scrollToEnd({ animated: true }) }}
	>
		{conversations.map(({ id, role, content }) => {
			if (role === 'user') return (
				<View key={id} items='flex-end'>
					<Text
						p='$2'
						maxW='90%'
						color='$colorFocus'
						bg='$backgroundFocus'
						rounded='$3'
					>
						{content}
					</Text>
				</View>
			)
			return (
				<View key={id}>
					<Text
						maxW='90%'
						self='flex-start'
						color='$color'
						mb='$10'
					>
						{content}
					</Text>
				</View>
			)
		})}
	</ScrollView>
)