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
import { defaultModel } from '@/constants'
import { Tasks } from '@/components/chat/tasks'
import { useTranslation } from 'react-i18next'
import type { Conversation as IConversation, UpdateReplyQuota, UpdateSendQuota } from '@/types'
import { supabase } from '@/supabase'
import type { i18n } from 'i18next'

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

const updateQuota = (body: Omit<UpdateSendQuota, 'apiKey'> | UpdateReplyQuota<undefined>, t: i18n['t']) => {
	prefs.getKey().then(key => {
		if (
			key === null ||
			(body.type === 'reply' && body.tokens === undefined)
		) toast.error(t('quota_update_err'))
		else supabase.functions.invoke('update-quota', {
			body: {
				...body,
				apiKey: key
			}
		}).catch(raise)
	}).catch(raise)
}

// eslint-disable-next-line max-lines-per-function, max-statements
export default function Page() {
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [message, setMessage] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [apiKey, setApiKey] = useState<string>('')
	const [apiKeyDialog, setApiKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)

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
	const reply = async (request: string) => {
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
			updateQuota({
				type: 'reply',
				tokens: usage?.total_tokens
			}, t)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			setConversations(prev => prev.slice(0, prev.length - 1))
			toast.error(t('conn_err'), {
				description: err.error.error.message,
				duration: 40_000
			})
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
		setConversations(prev => [
			...prev,
			{
				date: composeId(),
				content: message,
				role: 'user',
				completion_tokens: 'calculating...'
			}
		])
		reply(message).catch(raise)
		setMessage('')
		updateQuota({
			type: 'send',
			model: defaultModel
		}, t)
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
					value={0}
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
							send,
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
