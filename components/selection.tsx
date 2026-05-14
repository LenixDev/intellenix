import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2'
import {
	type SelectProps,
	Select,
	YStack,
	getFontSize,
	type SelectTriggerProps
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

export const Selection = <T extends string>({
	renderer,
	listLabel,
	children,
	item,
	setItem,
	...props
}: {
	renderer: SelectProps['renderValue']
	listLabel: string
	children: React.ReactNode
	item: T
	setItem: (item: T) => void
} & SelectTriggerProps) => (
	<Select
		value={item}
		onValueChange={setItem}
		disablePreventBodyScroll
		renderValue={renderer}>
		<Select.Trigger
			iconAfter={ChevronDown}
			borderRadius='$3'
			width='auto'
			size='$3'
			{...props}>
			<Select.Value color='$color10' />
		</Select.Trigger>
		<Select.Content>
			<Select.ScrollUpButton
				items='center'
				justify='center'
				position='relative'
				width='100%'
				height='$3'>
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
				maxW='20%'>
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
					pointerEvents='none'>
					<ChevronDown size={getFontSize('$true')} />
				</YStack>
			</Select.Viewport>
			<Select.ScrollDownButton
				items='center'
				justify='center'
				position='relative'
				width='100%'
				height='$3'>
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
