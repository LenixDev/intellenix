import { defaultModel } from '@/constants';
import { Check, Info } from '@tamagui/lucide-icons-2';
import type Groq from 'groq-sdk';
import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Input, Label, Select, Spinner, Text, View, XStack, YStack } from 'tamagui';
import { Selection } from '../selection';
import { useTranslation } from 'react-i18next';
import { GetKey, Model, SupaKeyArgs, SupaList, SupaProtect } from '@/types';
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
	setQuotaDisplayed
}: {
	groq: Groq | null
	id: string | undefined | null
	setId: (id: string | undefined | null) => void
	apiKey: string
	setKey: (key: string) => void
	setModel: (model: Model) => void
	quotaDisplayed: boolean | undefined
	setQuotaDisplayed: (quotaDisplayed: boolean | undefined) => void
}) => {
	const [items, setItems] = useState<GroqModel[]>([])
	const [item, setItemState] = useState<Model>(defaultModel)
	const [stateKey, setStateKey] = useState('')
	const [Protected, setProtected] = useState(false)
	const [loading, setLoading] = useState({
		protection: false,
		quota: false
	})

	const { t } = useTranslation()

	useEffect(() => {
		(async () => {
			const key = await prefs.getKey('id')
			if (key) setProtected(true)

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

	return (
		<>
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
					disabled={stateKey === ''}
					onPress={async () => {
						if (Protected) {
							const { error, data } = await supabase.functions.invoke<GetKey>('key', {
							body: {
								type: 'new',
								key: stateKey,
								model: item
							} satisfies SupaKeyArgs})
							if (error instanceof Error || !data) {
								toast.error(t('err'), {
									description: error.message
								})
								return
							}
							if (typeof data !== 'string' && 'error' in data) {
								toast.error(t('err'), {
									description: data.error
								})
								return
							}
							await prefs.setKey(data, 'id')
							setId(data)
							return
						}
						await prefs.setKey(stateKey, 'key')
						toast.success(t('api_success'))
						setStateKey('')
						setKey(stateKey)
					}}>
					{t('save')}
				</Button>
			</View>
			<YStack>
				<XStack gap='$2' items="center" justify='center'>
					<Checkbox checked={Protected || loading.protection} id='protection' onCheckedChange={async bool => {
						if (typeof bool !== 'boolean') return
						setLoading(prev => ({ ...prev, protection: true }))

						const { error, data } = await supabase.functions.invoke<SupaProtect>('key', {
							body: Protected ? {
								type: 'get',
							} : {
								type: 'protect',
								key
							}
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
						setProtected(!Protected)
					}}>
						<Checkbox.Indicator>
							{loading.protection ? <Spinner /> : <Check />}
						</Checkbox.Indicator>
					</Checkbox>
					<Label htmlFor='protection'>{t('protect_key')}</Label>
					<Over content={
						<Text>{Protected ? (t('unprotection_details')) : t('protection_details')}</Text>
					}>
						<Button
							chromeless
							circular
							size='$2'
							icon={Info}
						/>
					</Over>
				</XStack>
				<XStack gap='$2' items='center' justify='flex-start'>
					<Checkbox checked={quotaDisplayed || loading.quota} id='quota' onCheckedChange={async bool => {
						if (typeof bool !== 'boolean') return
						
						setLoading(prev => ({ ...prev, quota: true }))
						await prefs.setKey(bool ? '1' : '0', 'quota')

						setLoading(prev => ({ ...prev, quota: false }))
						setQuotaDisplayed(bool)

					}}>
						<Checkbox.Indicator>
							{loading.quota ? <Spinner /> : <Check />}
						</Checkbox.Indicator>
					</Checkbox>
					<Label htmlFor='quota'>{t('enable_quota')}</Label>
					<Over content={
						<Text>{t('quota_details')}</Text>
					}>
						<Button
							chromeless
							circular
							size='$2'
							icon={Info}
						/>
					</Over>
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
		</>
	)
}
