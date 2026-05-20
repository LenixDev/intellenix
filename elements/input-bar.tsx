import {
	Plus,
	AudioLines,
	Send,
	Mic,
	Square,
	X,
	File
} from '@tamagui/lucide-icons-2'
import { toast } from '@tamagui/toast/v2'
import { t } from 'i18next'
import { View, Button, Card, Paragraph, XStack } from 'tamagui'
import { Message } from './message'
import { S } from '@/types'

export const InputBar = ({
	autoComplete,
	autoCorrect,
	message,
	setMessage,
	send,
	aiThinking,
	apiKey: key,
	isMac,
	isMultiLine,
	setIsMultiLine,
	quotaDisplayed,
	r_tPM,
	abort,
	attachs,
	setAttachs,
	isPortrait,
	keyId: id
}: {
	autoComplete: boolean | undefined
	autoCorrect: boolean | undefined
	message: string
	setMessage: S<string>
	send: () => void
	aiThinking: boolean
	apiKey: string
	isMac: boolean
	isMultiLine: boolean
	setIsMultiLine: S<boolean>
	quotaDisplayed: boolean | undefined
	r_tPM: boolean
	abort: () => void
	attachs: Record<string, string>
	setAttachs: S<Record<string, string>>
	isPortrait: boolean
	keyId: string | undefined | null
}) => {
	return (
		<View flexDirection='row' items='center' width={isPortrait ? '95%' : '50%'}>
			<View
				flex={1}
				bg='$color3'
				rounded='$8'
				px='$2'
				py='$2'
				{...(isMultiLine ? { pt: '$3' } : {})}
				justify='center'
				border='1px solid $color6'
			>
				<XStack
					overflowX='scroll'
					//@ts-ignore
					scrollbarWidth='none'
				>
					{Object.entries(attachs).map(([key], i) => (
						<Card
							key={i}
							group
							rounded='$6'
							borderWidth={1}
							borderColor='$color02'
							transition='quick'
							width={isPortrait ? '30%' : '20%'}
							scale={0.9}
							hoverStyle={{ scale: 0.925 }}
							pressStyle={{ scale: 0.875 }}
							overflow='hidden'
						>
							<Card.Header p='$2' items='flex-end'>
								<Button
									opacity={0}
									$group-hover={{ opacity: 1 }}
									rounded='$2'
									size='$2'
									icon={X}
									onPress={() => setAttachs(({ [key]: _, ...rest }) => rest)}
								/>
							</Card.Header>
							<Card.Footer p='$3'>
								<Paragraph color='$color04' lineHeight='$1'>
									{key}
								</Paragraph>
							</Card.Footer>
							<Card.Background items='center' justify='center'>
								<File size='$10' color='$color01' />
							</Card.Background>
						</Card>
					))}
				</XStack>
				<View
					flexDirection={isMultiLine ? 'column' : 'row'}
					{...(isMultiLine ?
						{ gap: '$2' }
					:	{ justify: 'space-between', items: 'center' })}
				>
					<Message
						autoComplete={autoComplete ? 'on' : 'off'}
						autoCorrect={autoCorrect ? 'on' : 'off'}
						{...{
							message,
							setMessage,
							send,
							aiThinking,
							apiKey: key,
							isMac,
							isMultiLine,
							setIsMultiLine,
							quotaDisplayed,
							keyId: id
						}}
					/>
					<View
						flexDirection='row'
						justify='space-between'
						items='center'
						{...(isMultiLine ? {} : { style: { display: 'contents' } })}
					>
						<Button
							chromeless
							circular
							size='$3'
							iconSize='$6'
							icon={Plus}
							onPress={() => toast.info(t('not_yet'))}
							style={{ order: -1 }}
							hoverStyle={{ borderColor: '$color6', bg: '$background08' }}
							mr='$1'
						/>
						<View
							flexDirection='row'
							justify='flex-end'
							gap='$1'
							items='center'
						>
							<Button
								chromeless
								circular
								size='$3'
								icon={AudioLines}
								onPress={() => toast.info(t('not_yet'))}
								hoverStyle={{ borderColor: '$color6', bg: '$background08' }}
							/>
							<Button
								circular
								chromeless
								icon={
									aiThinking ? Square
									: message !== '' ?
										Send
									:	Mic
								}
								disabled={r_tPM}
								onPress={() =>
									aiThinking ? abort()
									: message === '' ? toast.info(t('not_yet'))
									: send()
								}
								size='$3'
							/>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}
