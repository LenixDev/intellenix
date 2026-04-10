import { prefs } from '@/storage'
import { raise } from 'lenix'
import { Button, Dialog, Input, View } from 'tamagui'

export const Api = ({
	apiKey,
	setApiKey,
	apiKeyDialog,
	setApiKeyDialog
}: {
	apiKey: string
	setApiKey: (apiKey: string) => void
	apiKeyDialog: boolean
	setApiKeyDialog: (apiKeyDialog: boolean) => void
}) => (
	<Dialog open={apiKeyDialog} onOpenChange={setApiKeyDialog}>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content gap='$6'>
				<View>
					<Dialog.Title>Enter your AI API Key</Dialog.Title>
					<Dialog.Description>
						Please fill in your AI API Key.
					</Dialog.Description>
				</View>
				<Input
					type='password'
					secureTextEntry
					value={apiKey}
					onChangeText={setApiKey}
				/>
				<Button
					disabled={apiKey.length === 0}
					onPress={() => {
						if (typeof apiKey === 'string' && apiKey.length === 0) return
						const set = prefs.setKey(apiKey)
						if (set instanceof Promise) set.
							then(() => {
								setApiKeyDialog(false)
							}).
							catch(raise)
						setApiKeyDialog(false)
					}}
				>
					Submit
				</Button>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog>
)
