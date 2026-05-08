import { defaultModel } from '@/constants';
import { Check, Info } from '@tamagui/lucide-icons-2';
import type Groq from 'groq-sdk';
import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, Sheet, Spinner, Text, View, XStack, YStack } from 'tamagui';
import { Selection } from '../selection';
import { useTranslation } from 'react-i18next';
import { GetKey, Model, SupaKeyArgs, SupaList, SupaProtect, SupaPublic } from '@/types';
import { prefs } from '@/storage';
import { toast } from '@tamagui/toast/v2';
import { i18n } from 'i18next';
import type { Model as GroqModel } from 'groq-sdk/resources';
import { supabase } from '@/supabase';
import { Over } from '@/components/over';

const setItem = async (
	model: Model,
	setItemState: (model: Model) => void,
	t: i18n['t'],
	setModel: (model: Model) => void
) => {
	await prefs.setKey(model, 'model')
	setItemState(model)
	toast.success(t('model_success'))
	setModel(model)
}

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
	setAutoComplete
}: {
	groq: Groq | null
	id: string | undefined | null
	setId: (id: string | undefined | null) => void
	apiKey: string
	setKey: (key: string) => void
	setModel: (model: Model) => void
	quotaDisplayed: boolean | undefined
	setQuotaDisplayed: (quotaDisplayed: boolean | undefined) => void
	isPortrait: boolean
	sheetOpen: boolean
	setSheetOpen: (sheetOpen: boolean) => void
	autoComplete: boolean | undefined
	setAutoComplete: (autoComplete: boolean | undefined) => void
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

	const { t } = useTranslation()

	useEffect(() => {
		(async () => {
			const key = await prefs.getKey('id')
			if (key) setProtected(key)

			const displayed = await prefs.getKey('quota')
			if (displayed === '1') setQuotaDisplayed(true)

		})()
		;(async () => {
			if (items.length > 0) return
			if (!groq && !id) {
				toast.error(t('err'))
				return
			}
			const res = await groq?.models.list() ?? await supabase.functions.invoke<SupaList['fn']>('list', {
				body: {
					id: id!
				} satisfies SupaList['args']
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
					return data
				})
			if (!res) return
			setItems(res.data)
		})()
	}, [])

	const renderedItems = useMemo(
		() =>
			items.map((item, iter) => (
				<Select.Item index={iter} key={item.id} value={item.id}>
					<View>
						<Select.ItemText>{item.id}</Select.ItemText>
						<View flexDirection='row'>
							<Select.ItemText color='$color7' fontSize='$2'>
								{t('by')} {item.owned_by}&nbsp;
							</Select.ItemText>
							<Select.ItemText color='$color7' fontSize='$2'>
								{t('on')}{' '}
								{new Date(item.created * 1000).toLocaleDateString(
									undefined,
									{
										year: 'numeric',
										month: 'short'
									}
								)}
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

	const handleKey = async () => {
		setLoading(prev => ({ ...prev, key: true }))
		if (Protected) {
			const { error } = await supabase.functions.invoke('key', {
			body: {
				type: 'update',
				key: stateKey,
				id: id!
			} satisfies SupaKeyArgs})
			if (error instanceof Error) {
				toast.error(t('err'), {
					description: error.message
				})
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
			body: {
				type: 'public',
				id
			} satisfies SupaKeyArgs
		})
		if (error instanceof Error || !data) {
			toast.error(t('err'), {
				description: error.message
			})
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

		const { error, data } = await supabase.functions.invoke<SupaProtect>('key', {
			body: Protected ? {
				type: 'get',
				id: id!,
			} satisfies SupaKeyArgs : {
				type: 'protect',
				key,
			} satisfies SupaKeyArgs
		})
		if (error instanceof Error || !data) {
			toast.error(t('err'), {
				description: error.message
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

		state ? await prefs.setKey('1', 'auto-complete') : await prefs.destroy('auto-complete')
		setAutoComplete(state ? true : undefined)
	}

	return (
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
					<Button
						disabled={stateKey === '' || loading.key}
						onPress={handleKey}>
						{loading.key ? <Spinner /> : t('save')}
					</Button>
					<Button
						disabled={loading.public}
						onPress={handlePublic}
					>{loading.public ? <Spinner /> : t('public_key')}</Button>
				</View>
				<YStack>
					<XStack gap='$2' items="center" justify='center'>
						<Checkbox
							disabled={loading.protection}
							checked={!!Protected || loading.protection}
							id='protection'
							onCheckedChange={handleProtection}>
							<Checkbox.Indicator>
								{loading.protection ? <Spinner /> : <Check />}
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='protection'>{t('protect_key')}</Label>
						<Over content={
							<Text>{Protected ? (t('unprotection_details')) : t('protection_details')}</Text>
						}>
							<Button chromeless circular size='$2' icon={Info} />
						</Over>
					</XStack>
					<XStack gap='$2' items='center' justify='flex-start'>
						<Checkbox
							checked={quotaDisplayed}
							id='quota'
							onCheckedChange={handleQuota}>
							<Checkbox.Indicator>
								<Check />
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='quota'>{t('enable_quota')}</Label>
						<Over content={
							<Text>{t('quota_details')}</Text>
						}>
							<Button chromeless circular size='$2' icon={Info} />
						</Over>
					</XStack>
					<XStack gap='$2' items='center' justify='flex-start'>
						<Checkbox
							checked={autoComplete}
							id='autoComplete'
							onCheckedChange={handleAutoComplete}>
							<Checkbox.Indicator>
								<Check />
							</Checkbox.Indicator>
						</Checkbox>
						<Label htmlFor='autoComplete'>{t('auto_complete')}</Label>
					</XStack>
				</YStack>
				<View>
					<Label>{t('models')}</Label>
					<Selection
						renderer={value => items.find(item => item.id === value)?.id}
						listLabel={t('models')}
						{...{
							item,
							setItem: (item: Model) => setItem(item, setItemState, t, setModel)
						}}>
						{renderedItems}
					</Selection>
				</View>
			</Sheet.Frame>
		</Sheet>
	)
}
