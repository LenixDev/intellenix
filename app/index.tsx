import { Api } from '@/components/chat/api';
import { Conversation } from '@/components/chat/conversation';
import { Kdb } from '@/components/chat/kdb';
import { Message } from '@/components/chat/message';
import { Preferences } from '@/components/chat/preferences';
import { Quota } from '@/components/chat/quota';
import { Send } from '@/components/chat/send';
import { Tasks } from '@/components/chat/tasks';
import { defaultModel } from '@/constants';
import { prefs } from '@/storage';
import { supabase } from '@/supabase';
import type {
	GroqFn,
	GroqParams,
	Conversation as IConversation,
	KeysQuota,
	Model,
	SupaKeyArgs,
	SupaProtect
} from '@/types';
import { AudioLines, Plus, SlidersHorizontal } from '@tamagui/lucide-icons-2';
import { toast } from '@tamagui/toast/v2';
import Groq from 'groq-sdk';
import { raise } from 'lenix';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Image,
	TamaguiElement,
	useThemeName,
	useWindowDimensions,
	View
} from 'tamagui';

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

	const shouldScroll = useRef(false)

	const { t } = useTranslation()
	const theme = useThemeName()
	const { width, height } = useWindowDimensions()
	const isPortrait = height > width

	const groq = useMemo(
		() => key ? new Groq({ apiKey: key, dangerouslyAllowBrowser: true }) : null,
		[key]
	)

	useEffect(() => {
		if (conversations.length === 0 && message === '') return

		const handler = (event: BeforeUnloadEvent) => event.preventDefault()

		window.addEventListener('beforeunload', handler)
		return () => window.removeEventListener('beforeunload', handler)
	}, [conversations])

	useEffect(() => {
		(async () => {
			const model = await prefs.getKey('model')
			if (model) setModel(model as Model)
		})()
	}, [model])

	useEffect(() => {
		if (key.length !== 0 || id === undefined) return
		(async () => {
			let key = await prefs.getKey('key')
			if (!key && !id) return setKeyDialog(true)
			if (!key) {
				const { error, data } = await supabase.functions.invoke<SupaProtect>('key', {
					body: {
						type: 'get'
					} satisfies SupaKeyArgs
				})
				if (error instanceof Error || !data) return toast.error(t('err'), {
					description: error?.message
				})
				if (typeof data !== 'string' && 'error' in data) return toast.error(t('err'), {
					description: data.error
				})
				key = data
			}
			setKey(key)
		})()
	}, [key, model, id])

	useEffect(() => {
		(async () => {
			const id = await prefs.getKey('id')
			if (id) setId(id)
			else setId(null)

			const quota = await prefs.getKey('quota')
			if (quota === '1') setQuotaDisplayed(true)

			const autoComplete = await prefs.getKey('auto-complete')
			if (autoComplete === '1') setAutoComplete(true)

			const autoCorrect = await prefs.getKey('auto-correct')
			if (autoCorrect === '1') setAutoCorrect(true)
		})()
	}, [])

	if (key.length === 0 || keyDialog) return <Api
		{...{
			apiKey: key,
			setKey,
			keyDialog,
			setKeyDialog
		}}
	/>

	const send = async () => {
		if (!message.trim()) return toast.info(t('not_yet'))
		shouldScroll.current = true
		setConversations(prev => [
			...prev,
			{
				date: composeId(),
				content: message,
				role: 'user',
				completion_tokens: t('calc')
			}
		])
		setAiThinking(true)
		try {
			setMessage('')
			const params: GroqParams['params'] = {
				messages: [
					...conversations.map(({ role, content }) => ({ role, content })),
					{
						role: 'user',
						content: message
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
			if (groq && !quotaDisplayed) result = await groq?.chat.completions.create(params).withResponse()
			else result = await supabase.functions.invoke<GroqFn>('groq', {
				body: {
					params,
					id: id!,
					key
				} satisfies GroqParams
			}).then(({ error, data }) => {
				if (error instanceof Error || !data) {
					toast.error(t('err'), {
						description: error.message,
					})
					return null
				}
				if ('error' in data) {
					toast.error(data.error)
					return null
				}
				return data
			})
			if (!result) return
			const { choices, service_tier, usage } = result.data
			if ('rateLimits' in result) setQuota({
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
		} catch (err: any) {
			setConversations(prev => prev.slice(0, prev.length - 1))
			toast.error(t('conn_err'), {
				description: err?.error?.error?.message,
				duration: 40_000
			})
			setMessage(message)
			raise(err)
		} finally {
			setAiThinking(false)
		}
	}

	return (
		<View items='center' width='100%' height='100%' pb={isPortrait ? '$3' : '$5'} >
			<View width='100%' items='flex-end' p='$2'>
				<Button
					size='$3'
					theme='accent'
					onPress={() => toast.error(t('not_yet'))}>
					{t('continue_google')}
				</Button>
			</View>
			<View
				width={isPortrait ? '95%' : '55%'}
				items='center'
				flex={1}
				justify={conversations.length === 0 ? 'center' : 'flex-end'}
				gap='$2'>
				{conversations.length > 0 && <Conversation {...{ conversations, shouldScroll, isPortrait }} />}
				<View
					width='100%'
					bg='$color3'
					rounded='$8'
					px='$2'
					py='$2'
					{...(isMultiLine ? { pt: '$3'} : {}) }
					justify='center'
					border='1px solid $color6'
				>
					<View
						flexDirection={isMultiLine ? 'column' : 'row'}
						{...(isMultiLine ? {
							gap: '$2'
						} : {
							justify: 'space-between',
							items: 'center'
						})}
					>
						<Message
							autoComplete={autoComplete ? 'on' : 'off'}
							autoCorrect={autoCorrect ? 'on' : 'off'}
							style={{ flex: 1 }}
							{...{
								message,
								setMessage,
								send,
								aiThinking,
								apiKey: key,
								isMac,
								isMultiLine,
								setIsMultiLine,
								quotaDisplayed
							}}
						/>
						<View
							flexDirection='row'
							justify='space-between'
							items='center'
							{...(isMultiLine ? {} : { style: { display: 'contents' } }) }
						>
							<Button
								chromeless
								circular
								size='$3'
								iconSize='$6'
								icon={Plus}
								onPress={() => toast.info(t('not_yet'))}
								style={{ order: -1 }}
								hoverStyle={{
									borderColor: '$color6',
									bg: '$background08'
								}}
								mr='$1'
							/>
							<View
								flexDirection='row'
								justify='flex-end'
								gap='$1'
								items='center'
							>
								{quotaDisplayed && <Quota {...{ quota, apiKey: key, model }} />}
								<Button
									chromeless
									size='$3'
									icon={SlidersHorizontal}
									onPress={() => setSheetOpen(true)}
									hoverStyle={{
										borderColor: '$color6',
										bg: '$background08'
									}}
								/>
								<Tasks />
								<Button
									chromeless
									circular
									// ml='$3'
									size='$3'
									icon={AudioLines}
									onPress={() => toast.info(t('not_yet'))}
									hoverStyle={{
										borderColor: '$color6',
										bg: '$background08'
									}}
								/>
								<Send
									{...{
										content: message,
										send,
										aiThinking,
										r_tPM: false /* TODO: block when quota exceeded */
									}}
								/>
							</View>
						</View>
					</View>
				</View>
				{!('ontouchstart' in window) && <Kdb {...{ isMac }} />}
			</View>
			{conversations.length === 0 && <Image
				height='$4'
				src={`https://console.groq.com/powered-by-groq-${theme}.svg`}
				alt='Powered by Groq for fast inference.'
			/>}
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
