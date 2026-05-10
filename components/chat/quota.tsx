import { t } from "i18next";
import { Progress, Text } from "tamagui";
import { Hover } from "../hover";
import { KeysQuota, Model } from "@/types";

const getConsumption = (value: number | string, limit: number | string) => {
  const val = Number(value)
  const lim = Number(limit)
	if (val === 0) return 0
	
  const ratio = lim === 0 ? 0 : val / lim
  return Number(Number((100 - ratio * 100).toFixed(2)))
}

export const Quota = ({
	quota,
	apiKey: key,
	model
}: {
	quota: KeysQuota
	apiKey: string
	model: Model
}) => {
	const rpd = quota[key]?.[model]?.rpd ?? '0'
	const tpm = quota[key]?.[model]?.tpm ?? '0'
	const r_limits = quota[key]?.[model]?.r_limits ?? '0'
	const t_limits = quota[key]?.[model]?.t_limits ?? '0'

	return <>
		<Hover
			placement='bottom-end'
			content={() => <Text color='$color4'>{rpd === '0' ? t('messages_missing') : `${t('requests_consumed')} (${getConsumption(rpd, r_limits)}%)`}</Text>}>
			<Progress
				value={getConsumption(rpd, r_limits)}
				bg='$color4'
				minW='$2'
				maxW='$2'
				ml='$2'
				size='$1'>
				<Progress.Indicator transition='slowest' />
			</Progress>
		</Hover>
		<Hover
			placement='bottom-start'
			content={() => <Text color='$color4'>{tpm === '0' ? t('messages_missing') : `${t('tokens_consumed')} (${getConsumption(tpm, t_limits)}%)`}</Text>}>
			<Progress
				value={getConsumption(tpm, t_limits)}
				bg='$color4'
				minW='$2'
				maxW='$2'
				ml='$2'
				size='$1'>
				<Progress.Indicator transition='slowest' />
			</Progress>
		</Hover>
	</>
}