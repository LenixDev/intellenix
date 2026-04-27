import { Button, Progress, type ScrollView, useWindowDimensions, View } from 'tamagui'
import { SlidersHorizontal } from '@tamagui/lucide-icons-2'
import { SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
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
import { defaultModel } from '@/constants'
import { Tasks } from '@/components/chat/tasks'
import { useTranslation } from 'react-i18next'
import type { Conversation as IConversation } from '@/types'
import { i18n } from 'i18next'

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

const reply = async ({
	request, setAiThinking, groq, conversations, setConversations, t
}: {
	request: string
	setAiThinking: (aiThinking: boolean) => void
	groq: Groq,
	conversations: IConversation[]
	setConversations: React.Dispatch<SetStateAction<IConversation[]>>
	t: i18n['t']
}) => {
	setAiThinking(true)
	try {
		const {
			choices, service_tier, usage
		} = await groq.chat.completions.create({
			messages: [
				// eslint-disable-next-line @stylistic/max-len
				...conversations.map(({ role, content }) => ({ role, content })),
				{
					role: 'user',
					content: request
				}
			],
			model: defaultModel,
			// temperature: null,
			// search_settings: null,
			// reasoning_effort: null,
			// max_completion_tokens: null,
			// include_reasoning: null,
			// documents: null,
			// compound_custom: null,
			// tools: null,
			// user: null
		})
		const response = choices[0]?.message.content
		if (typeof response !== 'string') return toast.error(t('no_res'))

		setConversations(prev => [
			...prev.map(($, i, arr) => {
				if ($.role !== 'user') return $
				const isLast = arr.slice(i + 1).every(n => n.role !== 'user')
				if (!isLast) return $
				return { ...$, completion_tokens: usage?.prompt_tokens ?? 'failed!' } as IConversation
			}),
			{
				date: composeId(),
				role: 'assistant',
				content: response,
				service_tier,
				usage
			}
		])
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (err: any) {
		setConversations(prev => prev.slice(0, prev.length - 1))
		toast.error(err.error.error.message, {
			duration: 40_000
		})
		raise(err)
	} finally {
		setAiThinking(false)
	}
	return undefined
}
const send = ({
	message, setConversations, setMessage, t, setAiThinking, groq, conversations
}: {
	message: string
	setConversations: React.Dispatch<SetStateAction<IConversation[]>>
	setMessage: (message: string) => void
	t: i18n['t']
	setAiThinking: (aiThinking: boolean) => void
	groq: Groq
	conversations: IConversation[]
}) => {
	if (!message.trim()) {
		toast.info(t('not_yet'))
		return
	}
	setConversations(prev => [
		...prev,
		{
			date: composeId(),
			content: message,
			role: 'user',
			completion_tokens: 'calculating...'
		}
	])
	reply({
		request: message,
		setAiThinking,
		groq,
		conversations,
		setConversations,
		t
	}).catch(raise)
	setMessage('')
}

// eslint-disable-next-line max-lines-per-function, max-statements
export default function Page() {
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [message, setMessage] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [Key, setKey] = useState<string>('')
	const [keyDialog, setKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)

	const scrollRef = useRef<ScrollView>(null)

	const { width, height } = useWindowDimensions()
	const isPortrait = height > width
	const { t } = useTranslation()

	const groq = useMemo(
		() => new Groq({ apiKey: Key, dangerouslyAllowBrowser: true }),
		[Key]
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
		prefs.getKey('key').then(key => {
			if (key === null) setKeyDialog(true)
			else setKey(key)
		}).catch(raise)
	}, [])

	if (!Key.trim() || keyDialog) return (
		<Api
			{...{
				Key,
				setKey,
				keyDialog,
				setKeyDialog
			}}
		/>
	)

	return (
		<View items='center' width='100%' height='100%'>
			<View
				width={isPortrait ? '95%' : '50%'}
				height='100%'
				items='center'
				justify='flex-end'
				pb='$5'
				gap='$2'
			>
				<Conversation {...{ conversations, scrollRef, isPortrait }} />
				{/* <Progress
					value={0}
					maxW='95%'
					size='$1'
				>
					<Progress.Indicator transition='slowest' />
				</Progress> */}
				<View
					width='100%'
					bg='$color3'
					rounded='$8'
					pt='$3'
					px='$4'
					pb='$2'
					justify='center'
					border='1px solid $color6'
				>
					<View
						width='100%'
						flexDirection='row'
						justify='center'
						items='flex-end'
					>
						<Message
							{...{
								content: message,
								setContent: setMessage,
								send: () => send({ message, setConversations, setMessage, t, setAiThinking, groq, conversations }),
								aiThinking,
								key: Key,
								isMac,
							}}
						/>
					</View>
					<View
						flexDirection='row'
						justify='flex-end'
						gap='$2'
						items='center'
					>
						<Button
							chromeless
							size='$3'
							icon={SlidersHorizontal}
							onPress={() => {
								setSheetOpen(true)
							}}
							hoverStyle={{
								borderColor: '$color6',
								bg: '$background08'
							}}
						/>
						<Tasks />
						<Send {...{
							content: message,
							send: () => send({ message, setConversations, setMessage, t, setAiThinking, groq, conversations }),
							aiThinking,
							r_tPM: false
						}} />
					</View>
				</View>
				{!('ontouchstart' in window) && <Kdb {...{ isMac }} />}
			</View>
			<Preferences
				{...{
					open: sheetOpen,
					setOpen: setSheetOpen,
					groq,
					isPortrait
				}}
			/>
		</View>
	)
}
