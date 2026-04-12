import { ScrollView, Text, View } from 'tamagui'

export const Conversation = ({
	conversations,
	scrollRef,
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
		px='$5'
		pb='$10'
		scrollbarWidth='none'
		flex={1}
		justify='flex-end'
		onContentSizeChange={() => {
			scrollRef.current?.scrollToEnd({ animated: true })
		}}
	>
		{conversations.map(({ id, role, content }) => {
			if (role === 'user')
				return (
					<View key={id} items='flex-end'>
						<Text
							py='$2'
							px='$3'
							maxW='90%'
							color='$colorFocus'
							bg='$color02'
							rounded='$5'
							my='$5'
						>
							{content}
						</Text>
					</View>
				)
			return (
				<View key={id}>
					<Text maxW='90%' self='flex-start' color='$color' my='$5'>
						{content}
					</Text>
				</View>
			)
		})}
	</ScrollView>
)
