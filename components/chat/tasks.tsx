import { Check } from '@tamagui/lucide-icons-2'
import { useMemo } from 'react'
import { Select } from 'tamagui'
import { Selection } from '../selection'
import { useTranslation } from 'react-i18next'

const TASK_KEYS = ['programming', 'health'] as const

export const Tasks = () => {
	const { t } = useTranslation()
	const tasks = useMemo(() => TASK_KEYS.map($ => t($)), [t])

	return (
		<Selection
			renderer={value => tasks.find(task => task === value) ?? 'ERR'}
			defaultValue={tasks[1]}
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
				() => tasks.map((item, iter) => (
					<Select.Item index={iter} key={item} value={item}>
						<Select.ItemText>{item}</Select.ItemText>
						<Select.ItemIndicator marginLeft='auto'>
							<Check size={16} />
						</Select.ItemIndicator>
					</Select.Item>
				)),
				[tasks]
			)}
		</Selection>
	)
}