import { Command, SlidersHorizontal } from '@tamagui/lucide-icons-2'
import { View, Button, Separator, Progress, Select, XStack } from 'tamagui'
import { KeysQuota, Model, S } from '@/types'
import { Hover } from '../components/hover'
import { Text } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { Kbd } from '../components/kdb'

const getConsumption = (value: number | string, limit: number | string) => {
	const val = Number(value)
	const lim = Number(limit)
	if (val === 0) return 0

	const ratio = lim === 0 ? 0 : val / lim
	return Number(Number((100 - ratio * 100).toFixed(2)))
}

export const InputPreferences = ({
	isMac,
	quotaDisplayed,
	quota,
	apiKey: key,
	model,
	setSheetOpen
}: {
	isMac: boolean
	quotaDisplayed: boolean | undefined
	quota: KeysQuota
	apiKey: string
	model: Model
	setSheetOpen: S<boolean>
}) => {
	const { t } = useTranslation()

	const rpd = quota[key]?.[model]?.rpd ?? '0'
	const tpm = quota[key]?.[model]?.tpm ?? '0'
	const r_limits = quota[key]?.[model]?.r_limits ?? '0'
	const t_limits = quota[key]?.[model]?.t_limits ?? '0'

	return (
		<View flexDirection='row' items='center' gap='$2' mt='$2'>
			{!('ontouchstart' in window) && (
				<>
					<XStack flexDirection='row' items='center' gap='$2'>
						<View flexDirection='row' items='center' gap='$1'>
							<Text color='$color06' fontSize='$1'>
								{t('press')}
							</Text>
							<Kbd size={10}>Tab</Kbd>
							<Text color='$color06' fontSize='$1'>
								{t('to_focus')}
							</Text>
						</View>
						<Separator vertical height={12} borderColor='$color02' />
						<View flexDirection='row' gap='$1' items='center'>
							<Text color='$color06' fontSize='$1'>
								{t('press')}
							</Text>
							<View flexDirection='row' items='center'>
								<Kbd size={10}>
									{isMac ?
										<Command color='$color06' size={10} />
									:	'Ctrl'}
								</Kbd>
								<Text> + </Text>
								<Kbd size={10}>Enter</Kbd>
							</View>
							<Text color='$color06' fontSize='$1'>
								{t('to_send')}
							</Text>
						</View>
					</XStack>
					<Separator vertical height={12} borderColor='$color02' />
				</>
			)}
			{quotaDisplayed && (
				<>
					<Hover
						placement='bottom-end'
						content={() => (
							<Text color='$color4'>
								{rpd === '0' ?
									t('messages_missing')
								:	`${t('requests_consumed')} (${getConsumption(rpd, r_limits)}%)`
								}
							</Text>
						)}
					>
						<Progress
							value={getConsumption(rpd, r_limits)}
							bg='$color4'
							minW='$2'
							maxW='$2'
							size='$1'
						>
							<Progress.Indicator transition='slowest' />
						</Progress>
					</Hover>
					<Hover
						placement='bottom-start'
						content={() => (
							<Text color='$color4'>
								{tpm === '0' ?
									t('messages_missing')
								:	`${t('tokens_consumed')} (${getConsumption(tpm, t_limits)}%)`}
							</Text>
						)}
					>
						<Progress
							value={getConsumption(tpm, t_limits)}
							bg='$color4'
							minW='$2'
							maxW='$2'
							size='$1'
						>
							<Progress.Indicator transition='slowest' />
						</Progress>
					</Hover>
					<Separator vertical height={12} borderColor='$color02' />
				</>
			)}
			<Button
				chromeless
				size='$3'
				icon={SlidersHorizontal}
				onPress={() => setSheetOpen(true)}
				hoverStyle={{ borderColor: '$color6', bg: '$background08' }}
			/>
		</View>
	)
}
