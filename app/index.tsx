import { Api } from '@/components/chat/api'
import { Conversation } from '@/components/chat/conversation'
import { InputBar } from '@/components/chat/input-bar'
import { InputPreferences } from '@/components/chat/input-prefs'
import { Preferences } from '@/components/chat/preferences'
import { defaultModel } from '@/constants'
import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import type {
	GroqFn,
	GroqParams,
	Conversation as IConversation,
	KeysQuota,
	Model,
	SupaKeyArgs,
	SupaProtect
} from '@/types'
import { ArrowRight } from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import Groq from 'groq-sdk'
import { raise } from 'lenix'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Button,
	Image,
	Input,
	Label,
	Text,
	useThemeName,
	useWindowDimensions,
	View,
	XStack,
	YStack
} from 'tamagui'
import { Topic } from '../components/chat/topic'
import { ChatCompletion } from 'groq-sdk/resources/chat/completions.mjs'
import { CompletionUsage } from 'groq-sdk/resources'

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

export default function Page() {
	const [id, setId] = useState<string | null>()
	const [model, setModel] = useState<Model>(defaultModel)
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [quota, setQuota] = useState<KeysQuota>({})
	const [message, setMessage] = useState('')
	const [key, setKey] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [keyDialog, setKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [isMultiLine, setIsMultiLine] = useState(false)
	const [quotaDisplayed, setQuotaDisplayed] = useState<boolean>()
	const [autoComplete, setAutoComplete] = useState<boolean>()
	const [autoCorrect, setAutoCorrect] = useState<boolean>()
	const [topic, setTopic] = useState('')

	const abortRef = useRef<AbortController | null>(null)

	const { t } = useTranslation()
	const theme = useThemeName()
	const { width, height } = useWindowDimensions()
	const isPortrait = height > width
	const started = conversations.length > 0

	const groq = useMemo(
		() =>
			key ? new Groq({ apiKey: key, dangerouslyAllowBrowser: true }) : null,
		[key]
	)

	useEffect(() => {
		if (!started && message === '') return

		const handler = (event: BeforeUnloadEvent) => event.preventDefault()

		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [conversations])

	useEffect(() => {
		;(async () => {
			const model = await prefs.getKey('model')
			if (model) setModel(model as Model)
		})()
	}, [model])

	useEffect(() => {
		if (key !== '' || id === undefined) return
		;(async () => {
			let key = await prefs.getKey('key')
			if (!key && !id) return setKeyDialog(true)
			if (!key) {
				const { error, data } = await supabase.functions.invoke<SupaProtect>(
					'key',
					{
						body: {
							type: 'get'
						} satisfies SupaKeyArgs
					}
				)
				if (error instanceof Error || !data)
					return toast.error(t('err'), {
						description: error?.message
					})
				if (typeof data !== 'string' && 'error' in data)
					return toast.error(t('err'), {
						description: data.error
					})
				key = data
			}
			setKey(key)
		})()
	}, [key, model, id])

	useEffect(() => {
		;(async () => {
			const message = await prefs.getKey('message')
			if (message) setMessage(message)

			const id = await prefs.getKey('id')
			if (id) setId(id)
			else setId(null)

			const quota = await prefs.getKey('quota')
			if (quota === '1') setQuotaDisplayed(true)

			const autoComplete = await prefs.getKey('auto-complete')
			if (autoComplete === '0') setAutoComplete(false)
			else setAutoComplete(true)

			const autoCorrect = await prefs.getKey('auto-correct')
			if (autoCorrect === '0') setAutoCorrect(false)
			else setAutoCorrect(true)
		})()
	}, [])

	if (key === '' || keyDialog)
		return (
			<Api
				{...{
					apiKey: key,
					setKey,
					keyDialog,
					setKeyDialog
				}}
			/>
		)

	const memoUserRequest = (request: string) => {
		setConversations(prev => [
			...prev,
			{
				date: composeId(),
				content: request,
				role: 'user',
				completion_tokens: t('calc')
			}
		])
	}

	const memoAIReponse = (usage: CompletionUsage | undefined, response: string, service_tier: ChatCompletion['service_tier']) => {
		setConversations(prev => [
			...prev.map(($, i, arr) => {
				if ($.role !== 'user') return $
				const isLast = arr.slice(i + 1).every(n => n.role !== 'user')
				if (!isLast) return $
				return {
					...$,
					completion_tokens: usage?.prompt_tokens ?? t('failed')
				} as IConversation
			}),
			{
				date: composeId(),
				role: 'assistant',
				content: response,
				service_tier,
				usage
			}
		])
	}

	const abortSend = (request: string, err: any) => {
		setConversations(prev => prev.slice(0, prev.length - 1))
		setMessage(request)
		if (err?.message !== 'Request was aborted.') {
			toast.error(t('conn_err'), {
				description: err?.error?.error?.message,
				duration: 40_000
			})
			raise(err)
		}
	}

	const fireGroq = async (prompt: string, signal: AbortSignal) => {
		const params: GroqParams['params'] = {
			messages: [
				...conversations.map(({ role, content }) => ({ role, content })),
				{
					role: 'user',
					content: prompt
				}
			],
			model
			// temperature: null,
			// search_settings: null,
			// reasoning_effort: null,
			// max_completion_tokens: null,
			// include_reasoning: null,
			// documents: null,
			// compound_custom: null,
			// tools: null,
			// user: null
		}
		let result
		if (groq && !quotaDisplayed)
			result = await groq?.chat.completions.create(params, { signal }).withResponse()
		else
			result = await supabase.functions
			.invoke<GroqFn>('groq', {
				body: {
					params,
					id: id!,
					key
				} satisfies GroqParams
			})
			.then(({ error, data }) => {
				if (signal.aborted) return null
				if (error instanceof Error || !data) {
					toast.error(t('err'), {
						description: error.message
					})
					return null
				}
				if ('error' in data) {
					toast.error(data.error)
					return null
				}
				return data
			})
		return result
	}

	const send = async (request = message) => {
		const { signal } = abortRef.current = new AbortController()
		const prompt =
		`
		system: {
			userJustStartedANewConversation: ${!started}
			topic: ${topic}
			instructions: [
				you are in the production mode,
				if userJustStartedANewConversation is true, be ready to have a conversation with the user the next request from him,
				if userJustStartedANewConversation is true, make sure to intial the conversation regarding the entered topic without thinking outloud
			]
		}
		user: {
			request: ${request}
		}
		`
		if (request !== '') memoUserRequest(request)

		setAiThinking(true)
		try {
			setMessage('')
			const result = await fireGroq(prompt, signal)
			if (!result || signal.aborted) return
			const { choices, service_tier, usage } = result.data
			if ('rateLimits' in result)
				setQuota({
					[key]: {
						[model]: {
							rpd: result.rateLimits.remaining_requests ?? '0',
							tpm: result.rateLimits.remaining_tokens ?? '0',
							r_limits: result.rateLimits.limit_requests ?? '0',
							t_limits: result.rateLimits.limit_tokens ?? '0'
						}
					}
				})

			const response = choices[0]?.message.content
			if (typeof response !== 'string') return toast.error(t('no_res'))

			memoAIReponse(usage, response, service_tier)
		} catch (err: any) {
			abortSend(request, err)
		} finally {
			setAiThinking(false)
		}
	}

	return (
		<View
			items='center'
			width='100%'
			height='100%'
			pb={isPortrait ? '$3' : '$5'}>
			<View
				width='100%'
				items={started ? 'center' : 'flex-start'}
				p='$3'
				bg='$color3'>
				{started ? (
					<Text>{topic}</Text>
				) : (
					<Button
						size='$3'
						theme='accent'
						onPress={() => toast.error(t('not_yet'))}>
						{t('continue_google')}
					</Button>
				)}
			</View>
			<View
				width={isPortrait ? '95%' : '55%'}
				items='center'
				flex={1}
				justify={started ? 'flex-end' : 'center'}>
				{started ? (
					<>
						<Conversation {...{ conversations, isPortrait, aiThinking, send, setConversations }} />
						<InputBar
						{...{
							autoComplete,
							autoCorrect,
							message,
							setMessage,
							send,
							aiThinking,
							apiKey: key,
							isMac,
							isMultiLine,
							setIsMultiLine,
							quotaDisplayed,
							r_tPM: false,
							abort: () => abortRef.current?.abort()
						}}
					/>
					<InputPreferences
						{...{
							isMac,
							quotaDisplayed,
							quota,
							apiKey: key,
							model,
							setSheetOpen
						}}
					/>
				</>) : (
					<Topic
						{...{
							send,
							topic,
							setTopic
						}}
					/>
				)}
			</View>
			{!started && (
				<Image
					height='$4'
					src={`https://console.groq.com/powered-by-groq-${theme}.svg`}
					alt='Powered by Groq for fast inference.'
				/>
			)}
			<Preferences
				{...{
					groq,
					apiKey: key,
					id,
					setId,
					setKey,
					setModel,
					quotaDisplayed,
					setQuotaDisplayed,
					isPortrait,
					sheetOpen,
					setSheetOpen,
					autoComplete,
					setAutoComplete,
					autoCorrect,
					setAutoCorrect
				}}
			/>
		</View>
	)
}
