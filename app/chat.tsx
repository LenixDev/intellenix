import {
	Button,
	Progress,
	type ScrollView,
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
	Model
} from '@/types'
import { i18n } from 'i18next'
import { supabase } from '@/supabase'
import { Hover } from '@/components/hover'

const isMac = navigator.userAgent.includes('Mac')
const composeId = () => {
	const $ = new Date()
	return `${$.getFullYear()}-${String($.getMonth() + 1).padStart(2, '0')}-${String($.getDate()).padStart(2, '0')} ${String($.getHours()).padStart(2, '0')}:${String($.getMinutes()).padStart(2, '0')}:${String($.getSeconds()).padStart(2, '0')}.${String($.getMilliseconds()).padStart(3, '0')}`
}

const sendMessage = async ({
	message,
	setConversations,
	setMessage,
	t,
	setAiThinking,
	groq,
	conversations,
	key,
	model
}: {
	message: string
	setConversations: React.Dispatch<SetStateAction<IConversation[]>>
	setMessage: (message: string) => void
	t: i18n['t']
	setAiThinking: (aiThinking: boolean) => void
	groq: Groq
	conversations: IConversation[]
	key: string
	model: Model
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
	setAiThinking(true)
	try {
		setMessage('')
		const { choices, service_tier, usage } = await groq.chat.completions.create(
			{
				messages: [
					// eslint-disable-next-line @stylistic/max-len
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
		)
		const response = choices[0]?.message.content
		if (typeof response !== 'string') return toast.error(t('no_res'))

		setConversations(prev => [
			...prev.map(($, i, arr) => {
				if ($.role !== 'user') return $
				const isLast = arr.slice(i + 1).every(n => n.role !== 'user')
				if (!isLast) return $
				return {
					...$,
					completion_tokens: usage?.prompt_tokens ?? 'failed!'
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
		if (!usage?.total_tokens) {
			toast.error(t('quota_update_err'), {
				description: t('total_tokens_undefined')
			})
			return
		}
		supabase.functions
			.invoke<DailyQuotaFunction>('quota', {
				body: {
					type: 'consume',
					key,
					model,
					tokens: usage.total_tokens
				} satisfies QuotaFunction
			})
			.then(({ error, data }) => {
				if (error instanceof Error || !data) {
					toast.error(t('err'), {
						description: error.message
					})
					return
				}
				if ('error' in data) {
					toast.error(t('err'), {
						description: data.error
					})
					return
				}
			})
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
	return undefined
}

// eslint-disable-next-line max-lines-per-function, max-statements
export default function Page() {
	const [conversations, setConversations] = useState<IConversation[]>([])
	const [message, setMessage] = useState('')
	const [aiThinking, setAiThinking] = useState(false)
	const [key, setKey] = useState<string>('')
	const [keyDialog, setKeyDialog] = useState(false)
	const [sheetOpen, setSheetOpen] = useState(false)
	const [model, setModel] = useState<Model>(defaultModel)
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
		() => new Groq({ apiKey: key, dangerouslyAllowBrowser: true }),
		[key]
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
		prefs
			.getKey('model')
			.then(model => {
				if (model) setModel(model as Model)
			})
			.catch(raise)
	}, [model])

	useEffect(() => {
		if (key.length !== 0) return
		prefs
			.getKey('key')
			.then(key => {
				if (!key) return setKeyDialog(true)
				setKey(key)
				supabase.functions
					.invoke<DailyQuotaFunction>('quota', {
						body: {
							type: 'get',
							key,
							model
						} satisfies QuotaFunction
					})
					.then(({ error, data }) => {
						if (error instanceof Error || !data) {
							toast.error(t('err'), {
								description: error?.message
							})
							return
						}
						if ('error' in data) {
							toast.error(t('err'), {
								description: data.error
							})
							return
						}
						setQuota({ [key]: { [model]: data } })
					})
			})
			.catch(raise)
	}, [key, model])
	
	useEffect(() => {
		const channel = supabase
			.channel('quota')
			.on('postgres_changes', {
				event: 'UPDATE', schema: 'public', table: 'quota'
			}, ({ new: { rpd, tpd } }: { new: { rpd: number; tpd: number } }) => {
				console.debug({ rpd, tpd })
				setQuota({[key]: { [model]: {
					rpd: (rpd * 100) / LIMITS[model].rpd,
					tpd: (tpd * 100) / LIMITS[model].tpd,
				}}})
			})
			.subscribe()
	
		return () => { supabase.removeChannel(channel) }
	}, [key, model])
	
	if (!key.trim() || keyDialog)
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

	const send = () =>
		sendMessage({
			message,
			setConversations,
			setMessage,
			t,
			setAiThinking,
			groq,
			conversations,
			key,
			model
		})

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
								content={() => (
									<Text color='$color4'>
										{t('used_rpd')}({rpd?.toFixed(2) ?? 'ERR'}%)
									</Text>
								)}>
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
								content={() => (
									<Text color='$color4'>
										{t('used_tpd')}({tpd?.toFixed(2) ?? 'ERR'}%)
									</Text>
								)}>
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
								onPress={() => {
									setSheetOpen(true)
								}}
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
			<Preferences
				{...{
					open: sheetOpen,
					setOpen: setSheetOpen,
					groq,
					isPortrait,
					setKey,
					setModel
				}}
			/>
		</View>
	)
}
