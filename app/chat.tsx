import {
    Button,
    Progress,
    type ScrollView,
    Sheet,
    Text,
    useWindowDimensions,
    View
} from 'tamagui';
import { Plus, SlidersHorizontal } from '@tamagui/lucide-icons-2';
import { useEffect, useMemo, useRef, useState } from 'react';
import Groq from 'groq-sdk';
import { raise } from 'lenix';
import { toast } from '@tamagui/toast/v2';
import { prefs } from '@/storage';
import { Conversation } from '@/components/chat/conversation';
import { Api } from '@/components/chat/api';
import { Message } from '@/components/chat/message';
import { Send } from '@/components/chat/send';
import { Kdb } from '@/components/chat/kdb';
import { Preferences } from '@/components/chat/preferences';
import { defaultModel } from '@/constants';
import { Tasks } from '@/components/chat/tasks';
import { useTranslation } from 'react-i18next';
import type {
    Conversation as IConversation,
    KeysQuota,
    Model,
    GroqFn,
    GroqParams,
    SupaProtect,
    SupaKeyArgs
} from '@/types';
import { supabase } from '@/supabase';
import { Hover } from '@/components/hover';
import { Quota } from '@/components/chat/quota';

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

export default function Page() {
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [message, setMessage] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [key, setKey] = useState<string>('')
	const [keyDialog, setKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [model, setModel] = useState<Model>(defaultModel)
	const [id, setId] = useState<string | null>()
	const [quotaDisplayed, setQuotaDisplayed] = useState<boolean>()
	const [quota, setQuota] = useState<KeysQuota>({})

	const scrollRef = useRef<ScrollView>(null)

	const { width, height } = useWindowDimensions()
	const isPortrait = height > width
	const { t } = useTranslation()

	const groq = useMemo(
		() => key ? new Groq({ apiKey: key, dangerouslyAllowBrowser: true }) : null,
		[key]
	)

	useEffect(() => {
		if (conversations.length === 0) return

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
			else setQuotaDisplayed(false)
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
		<View items='center' width='100%' height='100%'>
			<View
				width={isPortrait ? '95%' : '55%'}
				height='100%'
				items='center'
				justify='flex-end'
				pb='$5'
				gap='$2'>
				<Conversation {...{ conversations, scrollRef, isPortrait }} />
				<View
					width='100%'
					bg='$color3'
					rounded='$8'
					pt='$3'
					px='$2'
					pb='$2'
					justify='center'
					gap='$2'
					border='1px solid $color6'>
					<Message
						{...{
							content: message,
							setContent: setMessage,
							send,
							aiThinking,
							apiKey: key,
							isMac
						}}
					/>
					<View flexDirection='row' justify='space-between'>
						<Button
							chromeless
							circular
							size='$3'
							iconSize='$6'
							icon={Plus}
							onPress={() => toast.info(t('not_yet'))}
							hoverStyle={{
								borderColor: '$color6',
								bg: '$background08'
							}}
						/>
						<View
							flexDirection='row'
							justify='flex-end'
							gap='$2'
							items='center'>
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
				{!('ontouchstart' in window) && <Kdb {...{ isMac }} />}
			</View>
			<Sheet
				dismissOnSnapToBottom
				transition='superLazy'
				modal
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				snapPoints={[50, 10]}>
				<Sheet.Overlay transition='quick' bg='$color02' />
				<Sheet.Handle />
				<Sheet.Frame
					bg='$color1'
					items='center'
					justify='space-evenly'
					flexDirection={isPortrait ? 'column' : 'row'}>
					<Preferences
						{...{
							groq,
							apiKey: key,
							id,
							setId,
							setKey,
							setModel,
							quotaDisplayed,
							setQuotaDisplayed
						}}
					/>
				</Sheet.Frame>
			</Sheet>
		</View>
	)
}
