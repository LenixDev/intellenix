import {
	Button,
	type ScrollView,
	View
} from 'tamagui'
import { SlidersHorizontal } from '@tamagui/lucide-icons-2'
import { useEffect, useMemo, useRef, useState } from 'react'
import Groq from 'groq-sdk'
import { raise } from 'lenix'
import { toast } from '@tamagui/toast/v2'
import { prefs } from '@/storage'
import { Conversation } from '@/components/chat/conversation'
import { Api } from '@/components/chat/api'
import { Message } from '@/components/chat/message'
import { Send } from '@/components/chat/send'
import { Kdb } from '@/components/chat/kdb'
import { Preferences } from '@/components/chat/preferences'

const isMac = navigator.platform.toUpperCase().includes('MAC')
const composeId = () => Date.now().toString()

// eslint-disable-next-line max-lines-per-function, max-statements
export default function Page() {
	const [conversations, setConversations] = useState<
		{
			id: string
			role: 'user' | 'assistant'
			content: string
		}[]
	>([])
	const [content, setContent] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [apiKey, setApiKey] = useState<string>('')
	const [apiKeyDialog, setApiKeyDialog] = useState(false)

	const scrollRef = useRef<ScrollView>(null)

	const groq = useMemo(
		() => new Groq({ apiKey, dangerouslyAllowBrowser: true }),
		[apiKey]
	)

	useEffect(() => {
		if (conversations.length === 0) return

		const handler = (event: BeforeUnloadEvent) => {
			event.preventDefault()
		}

		window.addEventListener('beforeunload', handler)
		return () => {
			window.removeEventListener('beforeunload', handler)
		}
	}, [conversations])

	useEffect(() => {
		const key = prefs.getKey()
		if (key === null) {
			setApiKeyDialog(true)
			return
		}
		if (key instanceof Promise) key.then(key => {
			if (key === null) return
			setApiKey(key)
		}).catch(raise)
		else setApiKey(key)
	}, [])

	if (!apiKey.trim() || apiKeyDialog) return (
		<Api
			{...{
				apiKey,
				setApiKey,
				apiKeyDialog,
				setApiKeyDialog
			}}
		/>
	)

	const chat = async(request: string) => {
		setAiThinking(true)
		try {
			const completion = await groq.chat.completions.create({
				messages: [
					{
						role: 'user',
						content: request
					}
				],
				model: 'llama-3.3-70b-versatile'
			})
			const response = completion.choices[0]?.message.content
			if (typeof response !== 'string') return raise('No response')

			setConversations(prev => [
				...prev,
				{
					id: composeId(),
					role: 'assistant',
					content: response
				}
			])
		} catch(err) {
			toast.error('Something went wrong')
			raise(err)
		} finally {
			setAiThinking(false)
		}
	}
	const send = () => {
		if (!content.trim()) return
		setConversations(prev => [
			...prev,
			{
				id: composeId(),
				content,
				role: 'user'
			}
		])
		chat(content).catch(raise)
		setContent('')
	}

	return (
		<View items='center' width='100%' height='100%'>
			<View
				width='50%'
				height='100%'
				items='center'
				justify='flex-end'
				gap='$2'
				pb='$5'
			>
				<Conversation {...{ conversations, scrollRef }} />
				<View
					width='100%'
					bg='$color001'
					rounded='$8'
					px='$4'
					py='$3'
					justify='center'
					border='1px solid $color01'
				>
					<View
						width='100%'
						flexDirection='row'
						justify='center'
						items='flex-end'
						gap='$2'
					>
						<Message
							{...{
								content,
								setContent,
								send,
								aiThinking,
								apiKey,
								isMac
							}}
						/>
					</View>
					<View
						flexDirection='row'
						justify='flex-end'
						gap='$2'
					>
						<Button chromeless icon={SlidersHorizontal} />
						<Send {...{ content, send, aiThinking }} />
					</View>
				</View>
				<Kdb {...{ isMac }} />
			</View>
			<Preferences />
		</View>
	)
}
