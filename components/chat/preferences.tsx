import { defaultModel } from '@/constants'
import { prefs } from '@/storage'
import { Check } from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import type Groq from 'groq-sdk'
import type { Model } from 'groq-sdk/resources'
import { raise } from 'lenix'
import { useEffect, useMemo, useState } from 'react'
import { Button, Input, Label, Select, Sheet, View } from 'tamagui'
import { Selection } from '../selection'
import { useTranslation } from 'react-i18next'

const ApiInput = () => {
	const [key, setKey] = useState('')
	const { t } = useTranslation()
	return (
		<View gap='$4'>
			<View>
				<Label htmlFor='key'>{t('api_key')}</Label>
				<Input
					id='key'
					value={key}
					onChangeText={setKey}
					type='password'
					secureTextEntry
				/>
			</View>
			<Button
				disabled={key.length === 0}
				onPress={() => {
					const pref = prefs.setKey(key)
					if (pref instanceof Promise) pref.
						then(() => {
							toast.success('api_success')
							setKey('')
						}).
						catch(raise)
					else {
						toast.success('api_success')
						setKey('')
					}
				}}
			>
				{t('update')}
			</Button>
		</View>
	)
}

// eslint-disable-next-line max-lines-per-function
export const Preferences = ({
	open,
	setOpen,
	groq,
	isPortrait
}: {
	open: boolean
	setOpen: (open: boolean) => void
	groq: Groq
	isPortrait: boolean
}) => {
	const [items, setItems] = useState<Model[]>([])
	const { t } = useTranslation()

	useEffect(() => {
		if (items.length > 0) return
		groq.models.
			list().
			then(({ data }) => {
				setItems(data)
			}).
			catch(raise)
	}, [])

	return (
		<Sheet open={open} onOpenChange={setOpen} snapPoints={[50, 10]}>
			<Sheet.Overlay />
			<Sheet.Handle />
			<Sheet.Frame
				bg='$color6'
				items='center'
				justify='space-evenly'
				flexDirection={isPortrait ? 'column' : 'row'}
			>
				<ApiInput />
				<View>
					<Label>{t('models')}</Label>
					<Selection
						renderer={value => items.find(item => item.id === value)?.id}
						defaultValue={defaultModel}
						listLabel={t('models')}
					>
						{useMemo(
							() => items.map((item, iter) => (
								<Select.Item index={iter} key={item.id} value={item.id}>
									<View>
										<Select.ItemText>{item.id}</Select.ItemText>
										<View flexDirection='row'>
											<Select.ItemText color='$color7' fontSize='$2'>
												{item.owned_by}&nbsp;
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
						)}
					</Selection>
				</View>
			</Sheet.Frame>
		</Sheet>
	)
}
