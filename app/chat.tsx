import {
	Button,
	Progress,
	type ScrollView,
	Sheet,
	Text,
	useWindowDimensions,
	View
} from 'tamagui'
import { Plus, SlidersHorizontal } from '@tamagui/lucide-icons-2'
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
import { defaultModel, LIMITS } from '@/constants'
import { Tasks } from '@/components/chat/tasks'
import { useTranslation } from 'react-i18next'
import type {
	DailyQuotaFunction,
	QuotaFunction,
	Conversation as IConversation,
	KeysQuota,
	Model,
	GroqFn,
	GroqParams,
	SupaProtect,
	SupaKeyArgs
} from '@/types'
import { supabase } from '@/supabase'
import { Hover } from '@/components/hover'

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
	const [protection, setProtection] = useState<boolean | null>(null)
	const [id, setId] = useState<string>()
	const [quota, setQuota] = useState<KeysQuota>({
		[key]: {
			[defaultModel]: {
				rpd: 0,
				tpd: 0
			}
		}
	})
	const rpd = quota[key]?.[model]?.rpd
	const tpd = quota[key]?.[model]?.tpd

	const scrollRef = useRef<ScrollView>(null)

	const { width, height } = useWindowDimensions()
	const isPortrait = height > width
	const { t } = useTranslation()

	const groq = useMemo(
		() => protection !== null && !protection ? new Groq({ apiKey: key, dangerouslyAllowBrowser: true }) : null,
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
		if (key.length !== 0) return
		(async () => {
			let key = await prefs.getKey('key')
			if (!key && !protection) return setKeyDialog(true)
			if (!key) {
				const { error, data } = await supabase.functions.invoke<SupaProtect>('get-key', {
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
			const { error, data } = await supabase.functions.invoke<DailyQuotaFunction>('quota', {
				body: {
					type: 'get',
					key,
					model
				} satisfies QuotaFunction
			})
			if (error instanceof Error || !data) return toast.error(t('err'), {
				description: error?.message
			})
			if ('error' in data) return toast.error(t('err'), {
				description: data.error
			})
			setQuota({ [key]: { [model]: data } })
		})()
	}, [key, model, protection])

	useEffect(() => {
		const channel = supabase
			.channel('quota')
			.on('postgres_changes', {
				event: 'UPDATE', schema: 'public', table: 'quota'
			}, ({ new: { rpd, tpd } }: { new: { rpd: number; tpd: number } }) => {
				console.debug('quota updated')
				setQuota({
					[key]: {
						[model]: {
							rpd: (rpd * 100) / LIMITS[model].rpd,
							tpd: (tpd * 100) / LIMITS[model].tpd,
						}
					}
				})
			})
			.subscribe()

		return () => { supabase.removeChannel(channel) }
	}, [key, model])

	useEffect(() => {
		(async () => {
			const protection = await prefs.getKey('protection')
			if (protection) {
				setProtection(true)
				setId(protection)
			}
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
			const result = await groq?.chat.completions.create(params).withResponse() ?? await supabase.functions.invoke<GroqFn>('groq', {
				body: { params, password: '947f6037-fb5d-455c-8f41-38925b6c1725' } satisfies GroqParams
			}).then(({ error, data }) => {
				if (error instanceof Error || !data) {
					toast.error(t('err'), {
						description: error.message,
					})
					return
				}
				if ('error' in data) {
					toast.error(data.error)
					return null
				}
				return data
			})
			if (!result) return
			const { choices, service_tier, usage } = result.data

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

			if (!usage?.total_tokens) return toast.error(t('quota_update_err'), {
				description: t('total_tokens_undefined')
			})

			const { error, data } = await supabase.functions.invoke<DailyQuotaFunction>('quota', {
				body: {
					type: 'consume',
					key,
					model,
					tokens: usage.total_tokens
				} satisfies QuotaFunction
			})
			if (error instanceof Error || !data) return toast.error(t('err'), {
				description: error.message
			})
			if ('error' in data) return toast.error(t('err'), {
				description: data.error
			})
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
					<View
						width='100%'
						flexDirection='row'
						justify='center'
						px='$2'
						items='flex-end'>
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
					</View>
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
							<Hover
								placement='bottom-end'
								content={() => <Text color='$color4'>{t('used_rpd')}({rpd?.toFixed(2) ?? 'ERR'}%)</Text>}>
								<Progress
									value={rpd ?? 0}
									bg='$color4'
									minW={0}
									maxW='$2'
									size='$1'>
									<Progress.Indicator transition='slowest' />
								</Progress>
							</Hover>
							<Hover
								placement='bottom-start'
								content={() => <Text color='$color4'>{t('used_tpd')}({tpd?.toFixed(2) ?? 'ERR'}%)</Text>}>
								<Progress
									value={tpd ?? 0}
									bg='$color4'
									minW={0}
									maxW='$2'
									size='$1'>
									<Progress.Indicator transition='slowest' />
								</Progress>
							</Hover>
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
					bg='$color2'
					items='center'
					justify='space-evenly'
					flexDirection={isPortrait ? 'column' : 'row'}>
					<Preferences
						{...{
							groq,
							apiKey: key,
							id,
							setKey,
							setModel
						}}
					/>
				</Sheet.Frame>
			</Sheet>
		</View>
	)
}
