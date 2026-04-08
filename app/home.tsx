import { Button, Text, TextArea, View } from 'tamagui'
import { ArrowRight } from '@tamagui/lucide-icons-2'
import { useState } from 'react'

// eslint-disable-next-line max-lines-per-function
export const Home = () => {
	const [conversation, setConversation] = useState<{
		id: string
		role: 'user' | 'assistant'
		content: string
	}[]>([])
	const [input, setInput] = useState('')

	return (
		<View
			items='center'
			width='100%'
			height='100%'
		>
			<View
				width='50%'
				height='100%'
				items='center'
				justify='flex-end'
				pb='$10'
				gap='$7'
			>
				<View width='100%' gap='$5'>
					{conversation.map(({ id, role, content }) => {
						if (role === 'user') {
							return (
								<View key={id} items='flex-end'>
									<Text
										p='$2'
										maxW='90%'
										color='$background'
										bg='$colorFocus'
										text='center'
										rounded='$3'
									>
										{content}
									</Text>
								</View>
							)
						} else if (role === 'assistant') {
							return (
								<View>
									<Text
										p='$2'
										maxW='90%'
										self='flex-start'
										bg='$color002'
										color='$color'
										text='center'
										rounded='$3'
									>
										{content}
									</Text>
								</View>
							)
						}
					})}
				</View>
				<View
					width='100%'
					flexDirection='row'
					justify='center'
					items='center'
					gap='$2'
				>
					<TextArea
						flex={1}
						height='$true'
						paddingBlock='$2.5'
						style={{ scrollbarWidth: 'none' }}
						placeholder='Ask Intellenix...'
						value={input}
						onChangeText={setInput}
					/>
					<Button
						circular
						chromeless
						icon={ArrowRight}
						iconSize='$8'
						onPress={() => {
							if (!input.trim()) return
							setConversation(prev => [...prev, {
								id: Date.now().toString(),
								content: input,
								role: 'user'
							}])
							setInput('')
						}}
					/>
				</View>
			</View>
		</View>
	)
}
