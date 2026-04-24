import { ScrollView, Text, View } from 'tamagui'

// eslint-disable-next-line max-lines-per-function
export const Conversation = ({
	conversations,
	scrollRef,
	isPortrait
}: {
	conversations: {
		id: string
		role: 'user' | 'assistant'
		content: string
	}[]
	scrollRef: React.RefObject<ScrollView | null>
	isPortrait: boolean
}) => (
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
	>
		{conversations.map(({ id, role, content }) => {
			if (role === 'user') return (
				<View key={id} items='flex-end'>
					<Text
						py='$2'
						px='$3'
						maxW='90%'
						color='$colorFocus'
						bg='$color02'
						rounded='$5'
						mb='$5'
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
