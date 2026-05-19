import { Api } from '@/elements/api'
import { Conversation } from '@/elements/conversation'
import { InputBar } from '@/elements/input-bar'
import { InputPreferences } from '@/elements/input-prefs'
import { Preferences } from '@/elements/preferences'
import { defaultModel, reasoningModels } from '@/constants'
import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import {
	SupaPrompt,
	type SupaGroq,
	type Conversation as IConversation,
	type KeysQuota,
	type Model,
	type SupaKeyArgs,
	type SupaProtect,
	Reasoning
} from '@/types'
import { toast } from '@tamagui/toast/v2'
import Groq from 'groq-sdk'
import { raise } from 'lenix'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Button,
	Image,
	Text,
	useThemeName,
	useWindowDimensions,
	View
} from 'tamagui'
import { Topic } from '../elements/topic'
import { ChatCompletion } from 'groq-sdk/resources/chat/completions.mjs'
import { CompletionUsage } from 'groq-sdk/resources'
import { FunctionsHttpError } from '@supabase/supabase-js'

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
	const [prompts, setPrompts] = useState<string>()
	const [attachs, setAttachs] = useState<Record<string, string>>({})
	const [country, setCountry] = useState('')
	const [reasoning, setReasoning] = useState<Reasoning>('default')

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
					{ body: { type: 'get' } satisfies SupaKeyArgs }
				)
				if (error instanceof Error || !data)
					return toast.error(t('err'), { description: error?.message })
				if (typeof data !== 'string' && 'error' in data)
					return toast.error(t('err'), { description: data.error })
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

			const country = await prefs.getKey('country')
			if (country) setCountry(country)

			const reasoning = await prefs.getKey('reasoning')
			if (reasoning) setReasoning(reasoning as Reasoning)

			const { error, data } = await supabase.functions.invoke<
				Extract<SupaPrompt['return'], string>
			>('prompt', { body: { type: 'get' } })
			if (error || !data)
				return toast.error(t('err'), { description: error.message })
			setPrompts(data)
		})()
	}, [])

	if (key === '' || keyDialog)
		return <Api {...{ apiKey: key, setKey, keyDialog, setKeyDialog }} />

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

	const memoAIReponse = (
		usage: CompletionUsage | undefined,
		response: string,
		service_tier: ChatCompletion['service_tier']
	) => {
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

	const abortSend = (request: string, err?: any) => {
		setConversations(prev => prev.slice(0, prev.length - 1))
		setMessage(request)
		if (err?.message !== 'Request was aborted.') {
			toast.error(t('conn_err'), {
				description: err?.error?.error?.message,
			})
			raise(err)
		}
	}

	const requestGroq = async (prompt: string, signal: AbortSignal) => {
		const params: SupaGroq['args']['params'] = {
			messages: [
				...conversations.map(({ role, content }) => ({ role, content })),
				{ role: 'user', content: prompt }
			],
			model,
			temperature: 0.5,
			max_completion_tokens: Number(quota[key]?.[model]?.tpm),
			search_settings: {
				country,
				include_domains: ['https://lenix.dev'],
				include_images: true
			},
			reasoning_effort: reasoningModels.includes(model) ? reasoning : null,
			include_reasoning: reasoningModels.includes(model) ? true : null,
			// documents: null,
			// compound_custom: null,
			// tools: null,
			// user: null,
			// stream: null
		}
		let result
		if (groq && !quotaDisplayed)
			result = await groq?.chat.completions
				.create(params, { signal }).withResponse()
		else {
			const { error, data } = await supabase.functions
				.invoke<SupaGroq['return']>('groq', {
					body: { params, id: id!, key } satisfies SupaGroq['args']
				})
	
			if (signal.aborted) return null
			if (error instanceof FunctionsHttpError || !data) {
				toast.error(t('err'), {
					description: (await error.context.json()).error.error.message
				})
				return null
			}
			result = data
		}
		return result
	}

	const send = async (request = message) => {
		if (!prompts)
			return toast.error(t('err'), {
				description: 'error loading the AI instructions'
			})
		const { signal } = (abortRef.current = new AbortController())
		const prompt = `{
			system: {
				instructions: "${prompts}",
			},
			user: {
				topic: ${topic},
				justStartedANewConversation: ${!started},
				request: ${request},
				attachments: ${JSON.stringify(attachs)},
			}
		}`
		if (request !== '') memoUserRequest(request)

		setAiThinking(true)
		try {
			setMessage('')
			const result = await requestGroq(prompt, signal)
			if (!result || signal.aborted) return abortSend(request)

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

			const { content/* , reasoning */ } = choices[0]?.message
			if (typeof content !== 'string') return toast.error(t('no_res'))

			memoAIReponse(usage, content, service_tier)
			setAttachs({})
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
			pb={isPortrait ? '$3' : '$5'}
		>
			<View
				width='100%'
				items={started ? 'center' : 'flex-start'}
				p='$3'
				bg='$color3'
			>
				{started ?
					<Text textTransform='capitalize'>{topic}</Text>
				:	<Button
						size='$3'
						theme='accent'
						onPress={() => toast.error(t('not_yet'))}
					>
						{t('continue_google')}
					</Button>
				}
			</View>
			<View
				width='100%'
				items='center'
				flex={1}
				justify={started ? 'flex-end' : 'center'}
			>
				{started ?
					<>
						<Conversation
							{...{
								conversations,
								isPortrait,
								aiThinking,
								send,
								setConversations,
								setAttachs
							}}
						/>
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
								abort: () => abortRef.current?.abort(),
								attachs,
								setAttachs,
								isPortrait
							}}
						/>
						<InputPreferences
							{...{
								isMac,
								quotaDisplayed,
								quota,
								apiKey: key,
								model,
								setSheetOpen,
							}}
						/>
					</>
				:	<Topic {...{ send, topic, setTopic, isPortrait }} />}
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
					setAutoCorrect,
					country,
					setCountry,
					reasoning,
					setReasoning
				}}
			/>
		</View>
	)
}
