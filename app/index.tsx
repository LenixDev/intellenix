import { Button, ScrollView, Text, TextArea, View } from 'tamagui'
import { Command, Send } from '@tamagui/lucide-icons-2'
import { useEffect, useRef, useState } from 'react'
import Groq from 'groq-sdk'
import { raise } from 'lenix'
import { toast } from '@tamagui/toast/v2'
import { Kbd } from '@/components/kdb'

const groq = new Groq({ apiKey: process.env['EXPO_PUBLIC_GROQ_API_KEY'], dangerouslyAllowBrowser: true })
const composeId = () => Date.now().toString()
const isMac = navigator.platform.toUpperCase().includes('MAC')

// eslint-disable-next-line max-lines-per-function
export default function Page() {
	const [conversations, setConversations] = useState<{
		id: string
		role: 'user' | 'assistant'
		content: string
	}[]>([])
	const [content, setContent] = useState('')
	const [aiThinking, setAiThinking] = useState(false)

	const scrollRef = useRef<ScrollView>(null)

	const placeholderRows = content.split('\n').length !== 1 ? content.split('\n').length + 1 : 2
	
	const chat = async (request: string) => {
		setAiThinking(true)
		try {
			const completion = await groq.chat.completions.create({
				messages: [
					{
						role: 'user',
						content: request,
					},
				],
				model: "llama-3.3-70b-versatile",
			})
			const response = completion.choices[0]?.message.content
			if (!response) return raise('No response')

			setConversations(prev =>  [...prev, {
				id: composeId(),
				role: 'assistant',
				content: response
			}])
		} catch(err) {
			toast.error('Something went wrong')
			raise(err)
		} finally {
			setAiThinking(false)
		}
	}

	const send = () => {
		if (!content.trim()) return
		setConversations(prev => [...prev, {
			id: composeId(),
			content,
			role: 'user'
		}])
		chat(content)
		setContent('')
	}

	useEffect(() => {
		if (conversations.length === 0) return
	
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault()
		}
	
		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [conversations])

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
				<ScrollView
				  ref={scrollRef}
					width='100%'
					gap='$5'
					scrollbarWidth='none'
					flex={1}
					justify='flex-end'
					onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
				>
					{conversations.map(({ id, role, content }) => {
						if (role === 'user') {
							return (
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
						} else if (role === 'assistant') {
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
						}
						else return null
					})}
				</ScrollView>
				<View width='100%' gap='$2'>
					<View
						width='100%'
						flexDirection='row'
						justify='center'
						items='center'
						gap='$2'
					>
						<TextArea
							flex={1}
							paddingBlock='$2.5'
							style={{ scrollbarWidth: 'none', resize: 'none', maxHeight: '50vh', scrollPaddingBottom: 10 }}
							rows={placeholderRows}
							autoComplete='on'
							autoCorrect
							placeholder='Ask Intellenix...'
							value={content}
							onChangeText={setContent}
							onKeyDown={e => {
								if (e.key !== 'Enter') return
  							if (isMac ? !e.metaKey : !e.ctrlKey) return
								if (aiThinking) return
								send()
							}}
						/>
						<Button
							circular
							chromeless
							icon={Send}
							iconSize='$8'
							disabled={aiThinking || !content.trim()}
							onPress={send}
						/>
					</View>
					<View flexDirection='row' gap='$1'>
						<Text color='$color06' fontSize='$1'>Press</Text>
						<View flexDirection='row' items='center'>
							<Kbd size={10}>
							{isMac ? <Command color='$color06' size={10} /> : 'Ctrl'}
							</Kbd>
							<Text>+</Text>
							<Kbd size={10}>Enter</Kbd>
						</View>
						<Text color='$color06' fontSize='$1'>to send</Text>
					</View>
				</View>
			</View>
		</View>
	)
}
