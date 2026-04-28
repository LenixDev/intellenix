import { defaultModel, LIMITS } from '@/constants'
import { Check } from '@tamagui/lucide-icons-2'
import type Groq from 'groq-sdk'
import { raise } from 'lenix'
import { useEffect, useMemo, useState } from 'react'
import { Label, Select, Sheet, View } from 'tamagui'
import { Selection } from '../selection'
import { useTranslation } from 'react-i18next'
import { ApiInput } from './api-input'
import { Model } from '@/types'
import { prefs } from '@/storage'
import { toast } from '@tamagui/toast/v2'
import { i18n } from 'i18next'
import type { Model as GroqModel } from 'groq-sdk/resources'

const setItem = (
	model: Model,
	setItemState: React.Dispatch<React.SetStateAction<Model>>,
	t: i18n['t']
) => prefs.setKey(model, 'model').then(() => {
	setItemState(model)
	toast.success(t('model_success'))
}).catch(raise)

// eslint-disable-next-line max-lines-per-function
export const Preferences = ({
	open,
	setOpen,
	groq,
	isPortrait,
	setKey
}: {
	open: boolean
	setOpen: (open: boolean) => void
	groq: Groq
	isPortrait: boolean
	setKey: (key: string) => void
}) => {
	const [items, setItems] = useState<GroqModel[]>([])
	const [item, setItemState] = useState<typeof defaultModel>(defaultModel)

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
		<Sheet
			dismissOnSnapToBottom
			transition='superLazy'
			modal
			open={open}
			onOpenChange={setOpen}
			snapPoints={[50, 10]}
		>
			<Sheet.Overlay
				transition='quick'
				bg='$color02'
			/>
			<Sheet.Handle />
			<Sheet.Frame
				bg='$color2'
				items='center'
				justify='space-evenly'
				flexDirection={isPortrait ? 'column' : 'row'}
			>
				<ApiInput {...{ setKey }} />
				<View>
					<Label>{t('models')}</Label>
					<Selection
						renderer={value => items.find(item => item.id === value)?.id}
						listLabel={t('models')}
						{...{ item, setItem: (item: Model) => setItem(item, setItemState, t) }}
					>
						{useMemo(
							() => items.map((item, iter) => (
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
						)}
					</Selection>
				</View>
			</Sheet.Frame>
		</Sheet>
	)
}
