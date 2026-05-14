import { Plus, AudioLines, Send, Mic, Square } from "@tamagui/lucide-icons-2"
import { toast } from "@tamagui/toast/v2"
import { t } from "i18next"
import { View, Button } from "tamagui"
import { Message } from "./message"
import { S } from "@/types"

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
	abort
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
}) => {
	return (
		<View flexDirection='row' items='center' width='100%'>
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
				<View
					flexDirection={isMultiLine ? 'column' : 'row'}
					{...(isMultiLine ?
						{
							gap: '$2'
						}
					:	{
							justify: 'space-between',
							items: 'center'
						})}
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
							quotaDisplayed
						}}
					/>
					<View
						flexDirection='row'
						justify='space-between'
						items='center'
						{...(isMultiLine ? {} : { style: { display: 'contents' } })}>
						<Button
							chromeless
							circular
							size='$3'
							iconSize='$6'
							icon={Plus}
							onPress={() => toast.info(t('not_yet'))}
							style={{ order: -1 }}
							hoverStyle={{
								borderColor: '$color6',
								bg: '$background08'
							}}
							mr='$1'
						/>
						<View
							flexDirection='row'
							justify='flex-end'
							gap='$1'
							items='center'>
							<Button
								chromeless
								circular
								size='$3'
								icon={AudioLines}
								onPress={() => toast.info(t('not_yet'))}
								hoverStyle={{
									borderColor: '$color6',
									bg: '$background08'
								}}
							/>
							<Button
								circular
								chromeless
								icon={aiThinking ? Square : message !== '' ? Send : Mic}
								disabled={r_tPM}
								onPress={() => aiThinking ? abort() : send()}
								size='$3'
							/>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}