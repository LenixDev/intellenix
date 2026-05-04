import { defaultModel, LIMITS } from '@/constants'
import { Check } from '@tamagui/lucide-icons-2'
import type Groq from 'groq-sdk'
import { raise } from 'lenix'
import { useEffect, useMemo, useState } from 'react'
import { Button, Dialog, Input, Label, Select, Sheet, Spinner, Text, View } from 'tamagui'
import { Selection } from '../selection'
import { useTranslation } from 'react-i18next'
import { Model, SupaKeyArgs, SupaProtect } from '@/types'
import { prefs } from '@/storage'
import { toast } from '@tamagui/toast/v2'
import { i18n } from 'i18next'
import type { Model as GroqModel } from 'groq-sdk/resources'
import { Prompt } from '../prompt'
import { supabase } from '@/supabase'

const setItem = (
	model: Model,
	setItemState: (model: Model) => void,
	t: i18n['t'],
	setModel: (model: Model) => void
) =>
	prefs
		.setKey(model, 'model')
		.then(() => {
			setItemState(model)
			toast.success(t('model_success'))
			setModel(model)
		})
		.catch(raise)

// eslint-disable-next-line max-lines-per-function
export const Preferences = ({
	groq,
	apiKey: key,
	setKey,
	setModel
}: {
	groq: Groq
	apiKey: string
	setKey: (key: string) => void
	setModel: (model: Model) => void
}) => {
	const [items, setItems] = useState<GroqModel[]>([])
	const [item, setItemState] = useState<Model>(defaultModel)
	const [stateKey, setStateKey] = useState(key)
	const [Protected, setProtected] = useState(false)
	const [protectionDialog, setProtectionDialog] = useState(false)
	const [loading, setLoading] = useState(false)

	const { t } = useTranslation()

	useEffect(() => {
		prefs.getKey('protection').then(key => {
			if (key) setProtected(true)
		})
		if (items.length > 0) return
		groq.models
			.list()
			.then(({ data }) => {
				setItems(data)
			})
			.catch(raise)
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
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('rpm')}: {LIMITS[item.id as Model].rpm}
						</Select.ItemText>
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('tpm')}: {LIMITS[item.id as Model].tpm}
						</Select.ItemText>
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('rpd')}: {LIMITS[item.id as Model].rpd}
						</Select.ItemText>
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('tpd')}: {LIMITS[item.id as Model].tpd}
						</Select.ItemText>
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('ash')}: {LIMITS[item.id as Model].ash}
						</Select.ItemText>
						<Select.ItemText color='$color7' fontSize='$2'>
							{t('asd')}: {LIMITS[item.id as Model].asd}
						</Select.ItemText>
					</View>
					<Select.ItemIndicator marginLeft='auto'>
						<Check size={16} />
					</Select.ItemIndicator>
				</Select.Item>
			)),
		[items]
	)

	if (protectionDialog) return (
		<Prompt
			open={protectionDialog}
			onOpenChange={setProtectionDialog}
			width='25%'
			gap='$5'
		>
			<Dialog.Title>{t('key_protection')}</Dialog.Title>
			<Text>{Protected ? (t('unprotection_details')) : t('protection_details')}</Text>
			<Button onPress={async () => {
				setLoading(true)
				const body: { body: SupaKeyArgs } = {
					body: Protected ? {
						type: 'get',
					} : {
						type: 'protect',
						key
					}
				}
				const { error, data } = await supabase.functions.invoke<SupaProtect>('get-key', body)
				if (error instanceof Error || !data) {
					toast.error(t('err'), {
						description: error.message
					})
					setLoading(false)
					return
				}
				if (typeof data !== 'string' && 'error' in data) {
					toast.error(data.error)
					setLoading(false)
					return
				}

				await prefs.destroy(Protected ? 'protection' : 'key')
				await prefs.setKey(data, Protected ? 'key' : 'protection')
				setLoading(false)
				setProtectionDialog(false)
				setProtected(!Protected)
			}}>{loading ? <Spinner /> : Protected ? t('disable') : t('enable')}</Button>
		</Prompt>
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
					onPress={() => {
						prefs
							.setKey(stateKey, 'key')
							.then(() => {
								toast.success(t('api_success'))
								setStateKey('')
								setKey(stateKey)
							})
							.catch(raise)
					}}>
					{t('save')}
				</Button>
				<Button
					onPress={() => {
						setProtectionDialog(true)
					}}>
					{Protected ? t('unprotect_key') : t('protect_key')}
				</Button>
			</View>
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
