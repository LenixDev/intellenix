import { Button, Progress, type ScrollView, useWindowDimensions, View } from 'tamagui'
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
import { defaultModel, LIMITS } from '@/constants'
import { Tasks } from '@/components/chat/tasks'
import { useTranslation } from 'react-i18next'
import type { Conversation as IConversation } from '@/types'

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

// eslint-disable-next-line max-lines-per-function, max-statements
export default function Page() {
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [message, setMessage] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [apiKey, setApiKey] = useState<string>('')
	const [apiKeyDialog, setApiKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [limits, setLimits] = useState({
		rpm: 0, rpd: 0, tpm: 0, tpd: 0
	})

	const scrollRef = useRef<ScrollView>(null)

	const { width, height } = useWindowDimensions()
	const isPortrait = height > width
	const { t } = useTranslation()

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
		prefs.getKey().then(key => {
			if (key === null) setApiKeyDialog(true)
			else setApiKey(key)
		}).catch(raise)
	}, [])

	useEffect(() => {
		const minute = setInterval(() => {
			setLimits(prev => ({ ...prev, rpm: 0, tpm: 0 }))
		}, 60_000)

		const day = setInterval(() => {
			setLimits(prev => ({ ...prev, rpd: 0, tpd: 0 }))
		}, 86_400_000)

		return () => {
			clearInterval(minute)
			clearInterval(day)
		}
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

	// eslint-disable-next-line max-lines-per-function, max-statements
	const chat = async (request: string) => {
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
				...prev,
				{
					date: composeId(),
					role: 'assistant',
					content: response,
					service_tier,
					usage
				}
			])
			setConversations(prev => {
				const updated = [...prev]
				const lastUser = [...updated].reverse().find($ => $.role === 'user')
				if (lastUser) lastUser.completion_tokens = usage?.prompt_tokens ?? 'failed!'
				return updated
			})
			setLimits(prev => ({
				...prev,
				tpm: prev.tpm + (usage?.total_tokens ?? 0),
				tpd: prev.tpd + (usage?.total_tokens ?? 0),
			}))
		} catch(err) {
			toast.error(t('conn_err'))
			raise(err)
		} finally {
			setAiThinking(false)
		}
		return undefined
	}
	const send = () => {
		if (!message.trim()) {
			toast.info(t('not_yet'))
			return
		}
		if (limits.rpm >= LIMITS[defaultModel].rpm || limits.tpm >= LIMITS[defaultModel].tpm) {
			toast.info(t('limit'))
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
		chat(message).catch(raise)
		setMessage('')
		setLimits(prev => ({
			...prev,
			rpm: prev.rpm + 1,
			rpd: prev.rpd + 1,
		}))
	}

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
				<Progress
					value={(limits.tpd * 100) / LIMITS[defaultModel].tpd}
					maxW='95%'
					size='$1'
				>
					<Progress.Indicator transition='slowest' />
				</Progress>
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
						<Send {...{ content: message, send, aiThinking }} />
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
