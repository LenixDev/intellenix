import { defaultModel, reasonings, recommendedModels } from '@/constants'
import { Check, Info } from '@tamagui/lucide-icons-2'
import type Groq from 'groq-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
	Button,
	Checkbox,
	Input,
	Label,
	Select,
	Sheet,
	Spinner,
	Text,
	View,
	XStack,
	YStack
} from 'tamagui'
import { Selection } from '../components/selection'
import { useTranslation } from 'react-i18next'
import {
	Model,
	Reasoning,
	S,
	SupaKey,
	SupaList,
	SupaProtect,
	SupaPublic
} from '@/types'
import { prefs } from '@/storage'
import { toast } from '@tamagui/toast/v2'
import type { Model as GroqModel } from 'groq-sdk/resources'
import { supabase } from '@/supabase'
import { Over } from '@/components/over'
import { supaError } from '@/lib'
import { FunctionsHttpError } from '@supabase/supabase-js'

export const Preferences = ({
	groq,
	id,
	setId,
	apiKey: key,
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
}: {
	groq: Groq | null
	id: string | undefined | null
	setId: S<string | undefined | null>
	apiKey: string
	setKey: S<string>
	setModel: S<Model>
	quotaDisplayed: boolean | undefined
	setQuotaDisplayed: S<boolean | undefined>
	isPortrait: boolean
	sheetOpen: boolean
	setSheetOpen: S<boolean>
	autoComplete: boolean | undefined
	setAutoComplete: S<boolean | undefined>
	autoCorrect: boolean | undefined
	setAutoCorrect: S<boolean | undefined>
	country: string
	setCountry: S<string>
	reasoning: Reasoning
	setReasoning: S<Reasoning>
}) => {
	const [items, setItems] = useState<GroqModel[]>([])
	const [item, setItemState] = useState<Model>(defaultModel)
	const [stateKey, setStateKey] = useState('')
	const [Protected, setProtected] = useState<string>()
	const [loading, setLoading] = useState({
		protection: false,
		key: false,
		public: false
	})

	const debounceRef = useRef<number>(undefined)

	const { t } = useTranslation()

	useEffect(() => {
		;(async () => {
			const key = await prefs.getKey('id')
			if (key) setProtected(key)

			const displayed = await prefs.getKey('quota')
			if (displayed === '1') setQuotaDisplayed(true)

			const model = await prefs.getKey('model')
			if (model) setItemState(model)
		})()
		;(async () => {
			if (items.length > 0) return
			if (!groq && !id) {
				toast.error(t('err'))
				return
			}
			const res =
				(await groq?.models.list())
				?? (await supabase.functions
					.invoke<
						SupaList['fn']
					>('list', { body: { id: id! } satisfies SupaList['args'] })
					.then(({ error, data }) => {
						if (error instanceof Error || !data) {
							toast.error(t('err'), { description: error.message })
							return
						}
						if ('error' in data) {
							toast.error(t('err'), { description: data.error })
							return
						}
						return data
					}))
			if (!res) return
			setItems(res.data)
		})()
	}, [])

	const renderedItems = useMemo(
		() =>
			items.map((item, iter) => (
				<Select.Item index={iter} key={item.id} value={item.id}>
					<View flex={1} overflow='hidden'>
						<Select.ItemText
							whiteSpace='normal'
							{...(recommendedModels.includes(item.id) ?
								{ color: 'cyan' }
							:	{})}
						>
							{item.id}{' '}
							{recommendedModels.includes(item.id) && `(${t('recommended')})`}
						</Select.ItemText>
						<View flexDirection='row'>
							<Select.ItemText
								color='$color7'
								fontSize='$2'
								whiteSpace='normal'
							>
								{t('by')} {item.owned_by}&nbsp;
							</Select.ItemText>
							<Select.ItemText
								color='$color7'
								fontSize='$2'
								whiteSpace='normal'
							>
								{t('on')}{' '}
								{new Date(item.created * 1000).toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'short'
								})}
							</Select.ItemText>
						</View>
					</View>
					<Select.ItemIndicator marginLeft='auto'>
						<Check size={16} />
					</Select.ItemIndicator>
				</Select.Item>
			)),
		[items]
	)

	const handleModel = async (model: Model) => {
		await prefs.setKey(model, 'model')
		setItemState(model)
		toast.success(t('model_success'))
		setModel(model)
	}

	const handleKey = async () => {
		setLoading(prev => ({ ...prev, key: true }))
		if (Protected) {
			const { error } = await supabase.functions.invoke('key', {
				body: {
					type: 'update',
					key: stateKey,
					id: id!
				} satisfies SupaKey['args']
			})
			if (error instanceof Error) {
				toast.error(t('err'), { description: error.message })
				setLoading(prev => ({ ...prev, key: false }))
				return
			}
			setLoading(prev => ({ ...prev, key: false }))
			return
		}
		await prefs.setKey(stateKey, 'key')
		toast.success(t('api_success'))
		setStateKey('')
		setKey(stateKey)
		setLoading(prev => ({ ...prev, key: false }))
	}

	const handlePublic = async () => {
		setLoading(prev => ({ ...prev, public: true }))
		const { error, data } = await supabase.functions.invoke<SupaPublic>('key', {
			body: { type: 'public', id } satisfies SupaKey['args']
		})
		if (error instanceof Error || !data) {
			toast.error(t('err'), { description: error.message })
			setLoading(prev => ({ ...prev, public: false }))
			return
		}

		if (!Protected) {
			await prefs.setKey(data, 'key')
			setKey(data)
		}
		setLoading(prev => ({ ...prev, public: false }))
	}

	const handleProtection = async (state: boolean) => {
		if (typeof state !== 'boolean') return
		setLoading(prev => ({ ...prev, protection: true }))

		const { error, data } = await supabase.functions.invoke<SupaProtect>(
			'key',
			{
				body:
					Protected ?
						({ type: 'getById', id: id! } satisfies SupaKey['args'])
					:	({ type: 'protect', key } satisfies SupaKey['args'])
			}
		)
		if (error instanceof FunctionsHttpError || !data) {
			const err = await error?.context?.json()
			toast.error(t('err'), {
				description: err === 'protection_err' ? t('protection_err') : err
			})
			setLoading(prev => ({ ...prev, protection: false }))
			return
		}
		if (typeof data !== 'string' && 'error' in data) {
			toast.error(data.error)
			setLoading(prev => ({ ...prev, protection: false }))
			return
		}

		await prefs.destroy(Protected ? 'id' : 'key')
		await prefs.setKey(data, Protected ? 'key' : 'id')
		setLoading(prev => ({ ...prev, protection: false }))
		setProtected(Protected ? undefined : data)
		!Protected && setId(data)
	}

	const handleQuota = async (state: boolean) => {
		if (typeof state !== 'boolean') return

		state ? await prefs.setKey('1', 'quota') : await prefs.destroy('quota')
		setQuotaDisplayed(state)
	}

	const handleAutoComplete = async (state: boolean) => {
		if (typeof state !== 'boolean') return

		state ?
			await prefs.setKey('0', 'auto-complete')
		:	await prefs.destroy('auto-complete')
		setAutoComplete(state ? true : undefined)
	}

	const handleAutoCorrect = async (state: boolean) => {
		if (typeof state !== 'boolean') return

		state ?
			await prefs.setKey('0', 'auto-correct')
		:	await prefs.destroy('auto-correct')
		setAutoCorrect(state ? true : undefined)
	}

	const handleCountry = async (country: string) => {
		setCountry(country)
		clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(async () => {
			await prefs.setKey(country, 'country')
			toast.success(t('country_success'))
		}, 1000)
	}

	const handleReasoning = async (reasoning: string) => {
		setReasoning(reasoning as Reasoning)
		await prefs.setKey(reasoning, 'reasoning')
		toast.success(t('reasoning_success'))
	}

	return (
		<Sheet
			dismissOnSnapToBottom
			transition='superLazy'
			modal
			open={sheetOpen}
			onOpenChange={setSheetOpen}
			snapPoints={isPortrait ? [95, 10] : [50, 10]}
		>
			<Sheet.Overlay transition='quick' bg='$color02' />
			<Sheet.Handle />
			<Sheet.Frame
				bg='$color1'
				items='center'
				justify='space-evenly'
				flexDirection={isPortrait ? 'column' : 'row'}
			>
				<View gap='$4'>
					<View>
						<Label htmlFor='key'>{t('api_key')}</Label>
						<Input
							id='key'
							value={stateKey}
							onChangeText={setStateKey}
							type='password'
							secureTextEntry
						/>
					</View>
					<Button disabled={stateKey === '' || loading.key} onPress={handleKey}>
						{loading.key ?
							<Spinner />
						:	t('save')}
					</Button>
					<Button disabled={loading.public} onPress={handlePublic}>
						{loading.public ?
							<Spinner />
						:	t('public_key')}
					</Button>
				</View>
				<YStack>
					<XStack gap='$2' items='center' justify='flex-start'>
						<Checkbox
							checked={quotaDisplayed}
							id='quota'
							onCheckedChange={handleQuota}
						>
							<Checkbox.Indicator>
								<Check />
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='quota'>{t('enable_quota')}</Label>
						<Over content={<Text>{t('quota_details')}</Text>}>
							<Button chromeless circular size='$2' icon={Info} />
						</Over>
					</XStack>
					<XStack gap='$2' items='center' justify='flex-start'>
						<Checkbox
							checked={autoComplete ? true : false}
							id='autoComplete'
							onCheckedChange={handleAutoComplete}
						>
							<Checkbox.Indicator>
								<Check />
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='autoComplete'>{t('auto_complete')}</Label>
					</XStack>
					<XStack gap='$2' items='center' justify='flex-start'>
						<Checkbox
							checked={autoCorrect ? true : false}
							id='autoCorrect'
							onCheckedChange={handleAutoCorrect}
						>
							<Checkbox.Indicator>
								<Check />
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='autoCorrect'>{t('auto_correct')}</Label>
					</XStack>
				</YStack>
				<YStack items='flex-start'>
					<XStack gap='$2' items='center' justify='center'>
						<Checkbox
							disabled={loading.protection}
							checked={!!Protected || loading.protection}
							id='protection'
							onCheckedChange={handleProtection}
						>
							<Checkbox.Indicator>
								{loading.protection ?
									<Spinner />
								:	<Check />}
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='protection'>{t('protect_key')}</Label>
						<Over
							content={
								<Text>
									{Protected ?
										t('unprotection_details')
									:	t('protection_details')}
								</Text>
							}
						>
							<Button chromeless circular size='$2' icon={Info} />
						</Over>
					</XStack>
					<View>
						<Label htmlFor='model'>{t('models')}</Label>
						<Selection
							id='model'
							renderer={value =>
								items.find(item => item.id === value)?.id ?? value
							}
							listLabel={t('models')}
							{...{ item, setItem: (item: Model) => handleModel(item) }}
						>
							{renderedItems}
						</Selection>
					</View>
					<View>
						<Label htmlFor='reasoning'>{t('reasoning_effort')}</Label>
						<Selection
							id='reasoning'
							renderer={value =>
								reasonings.find(item => item === value) ?? value
							}
							listLabel={t('reasoning_effort')}
							{...{ item: reasoning ?? 'default', setItem: handleReasoning }}
						>
							{reasonings.map((item, iter) => (
								<Select.Item index={iter} key={item} value={item ?? 'default'}>
									<View flex={1} overflow='hidden'>
										<Select.ItemText whiteSpace='normal'>
											{item}
										</Select.ItemText>
									</View>
									<Select.ItemIndicator marginLeft='auto'>
										<Check size={16} />
									</Select.ItemIndicator>
								</Select.Item>
							))}
						</Selection>
					</View>
					<View>
						<XStack items='center'>
							<Label htmlFor='country'>{t('country')}</Label>
							<Over content={<Text>{t('country_priortize')}</Text>}>
								<Button chromeless circular size='$2' icon={Info} />
							</Over>
						</XStack>
						<Input
							id='country'
							placeholder={t('country_name')}
							value={country}
							onChangeText={handleCountry}
						/>
					</View>
				</YStack>
			</Sheet.Frame>
		</Sheet>
	)
}
