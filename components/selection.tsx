import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2'
import { useState } from 'react'
import {
	type SelectProps,
	Select,
	YStack,
	getFontSize,
	type SelectTriggerProps
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

// eslint-disable-next-line max-lines-per-function
export const Selection = ({
	renderer,
	defaultValue,
	listLabel,
	children,
	...props
}: {
	renderer: SelectProps['renderValue']
	defaultValue: string
	listLabel: string
	children: React.ReactNode
} & SelectTriggerProps) => {
	const [item, setItem] = useState<typeof defaultValue>(defaultValue)

	return (
		<Select
			value={item}
			onValueChange={setItem}
			disablePreventBodyScroll
			renderValue={renderer}
		>
			<Select.Trigger
				iconAfter={ChevronDown}
				borderRadius='$4'
				width='auto'
				{...props}
			>
				<Select.Value />
			</Select.Trigger>
			<Select.Content>
				<Select.ScrollUpButton
					items='center'
					justify='center'
					position='relative'
					width='100%'
					height='$3'
				>
					<YStack z={10}>
						<ChevronUp size={20} />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={['$background', 'transparent']}
						rounded='$4'
					/>
				</Select.ScrollUpButton>
				<Select.Viewport
					bg='$background'
					rounded='$4'
					borderWidth={1}
					borderColor='$borderColor'
				>
					<Select.Group>
						<Select.Label fontWeight='100'>{listLabel}</Select.Label>
						{children}
					</Select.Group>
					<YStack
						position='absolute'
						r={0}
						t={16}
						items='center'
						justify='center'
						width='$4'
						pointerEvents='none'
					>
						<ChevronDown size={getFontSize('$true')} />
					</YStack>
				</Select.Viewport>
				<Select.ScrollDownButton
					items='center'
					justify='center'
					position='relative'
					width='100%'
					height='$3'
				>
					<YStack z={10}>
						<ChevronDown size={20} />
					</YStack>
					<LinearGradient
						start={[0, 0]}
						end={[0, 1]}
						fullscreen
						colors={['transparent', '$background']}
						rounded='$4'
					/>
				</Select.ScrollDownButton>
			</Select.Content>
		</Select>
	)
}
