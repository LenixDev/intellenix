import { Check } from "@tamagui/lucide-icons-2";
import { useMemo } from "react";
import { Select } from "tamagui";
import { Selection } from "../selection";

const tasks = [
	'programming',
	'healthcare'
] as const

export const Tasks = () => (
	<Selection
		renderer={value => tasks.find(task => task === value) ?? 'ERR'}
		defaultValue={tasks[1]}
		listLabel='Tasks'
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
				<Select.Item
					index={iter}
					key={item}
					value={item}
				>
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