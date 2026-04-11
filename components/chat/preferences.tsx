import { prefs } from '@/storage'
import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import Groq from 'groq-sdk'
import { Model } from 'groq-sdk/resources'
import { raise } from 'lenix'
import { useEffect, useMemo, useState } from 'react'
import {
	Button,
	getFontSize,
	Input,
	Label,
	Select,
	Sheet,
	View,
	YStack,
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

const ApiInput = () => {
	const [key, setKey] = useState('')
	return (
		<View gap='$4'>
			<View>
				<Label htmlFor='key'>API Key</Label>
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
					if (pref instanceof Promise)
						pref
							.then(() => {
								toast.success('API Key updated')
								setKey('')
							})
							.catch(raise)
					else {
						toast.success('API Key updated')
						setKey('')
					}
				}}
			>
				Update
			</Button>
		</View>
	)
}

// eslint-disable-next-line max-lines-per-function
export const Preferences = ({
	open,
	setOpen,
	groq,
}: {
	open: boolean
	setOpen: (open: boolean) => void
	groq: Groq
}) => {
	const [item, setItem] = useState<Model['id']>('llama-3.3-70b-versatile')
	const [items, setItems] = useState<Model[]>([])

	const labelMap = new Map(items.map(item => [item.id.toLowerCase(), item.id]))
	const getItemLabel = (value: string) => labelMap.get(value)

	useEffect(() => {
		groq.models
			.list()
			.then(({ data }) => {
				setItems(data)
			})
			.catch(raise)
	}, [])

	return (
		<Sheet open={open} onOpenChange={setOpen} snapPoints={[50, 10]}>
			<Sheet.Overlay />
			<Sheet.Handle />
			<Sheet.Frame
				bg='$color6'
				items='center'
				justify='space-evenly'
				flexDirection='row'
			>
				<ApiInput />
				<View>
					<Label>Model</Label>
					<Select
						value={item}
						onValueChange={setItem}
						disablePreventBodyScroll
						renderValue={getItemLabel}
					>
						<Select.Trigger
							iconAfter={ChevronDown}
							borderRadius='$4'
							backgroundColor='$background'
						>
							<Select.Value placeholder='Something' />
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
									<Select.Label fontWeight='100'>Models</Select.Label>
									{useMemo(
										() =>
											items.map((item, iter) => (
												<Select.Item
													index={iter}
													key={item.id}
													value={item.id.toLowerCase()}
												>
													<View>
														<Select.ItemText>{item.id}</Select.ItemText>
														<View flexDirection='row'>
															<Select.ItemText color='$color7' fontSize='$2'>
																{item.owned_by}&nbsp;
															</Select.ItemText>
															<Select.ItemText color='$color7' fontSize='$2'>
																on{' '}
																{new Date(
																	item.created * 1000,
																).toLocaleDateString(undefined, {
																	year: 'numeric',
																	month: 'short',
																})}
															</Select.ItemText>
														</View>
													</View>
													<Select.ItemIndicator marginLeft='auto'>
														<Check size={16} />
													</Select.ItemIndicator>
												</Select.Item>
											)),
										[items],
									)}
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
				</View>
			</Sheet.Frame>
		</Sheet>
	)
}
