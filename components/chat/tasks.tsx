import { Check } from '@tamagui/lucide-icons-2'
import { useMemo, useState } from 'react'
import { Select } from 'tamagui'
import { Selection } from '../selection'
import { useTranslation } from 'react-i18next'
import type { Task } from '@/types'

const TASK_KEYS = ['programming', 'health'] as const satisfies readonly Task[]

export const Tasks = () => {
	const { t } = useTranslation()
	const [item, setItem] = useState<Task>(TASK_KEYS[0])

	return (
		<Selection
			item={item}
			setItem={setItem}
			renderer={$ => t($)}
			listLabel={t('tasks')}
			bg='transparent'
			borderColor='transparent'
			hoverStyle={{
				background: '$backgroundHover',
				cursor: 'pointer',
				borderColor: '$color6'
			}}
		>
			{useMemo(
				() => TASK_KEYS.map((key, iter) => (
					<Select.Item index={iter} key={key} value={key}>
						<Select.ItemText>{t(key)}</Select.ItemText>
						<Select.ItemIndicator marginLeft='$4'>
							<Check size={16} />
						</Select.ItemIndicator>
					</Select.Item>
				)),
				[t]
			)}
		</Selection>
	)
}