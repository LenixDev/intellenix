import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import type { GetApiKey } from '@/types'
import { toast } from '@tamagui/toast/v2'
import { raise } from 'lenix'
import { useState } from 'react'
import { Button, Dialog, Input, Separator, View, Text, XStack, Spinner } from 'tamagui'

// eslint-disable-next-line max-lines-per-function
export const Api = ({
	apiKey,
	setApiKey,
	apiKeyDialog,
	setApiKeyDialog,
}: {
	apiKey: string
	setApiKey: (apiKey: string) => void
	apiKeyDialog: boolean
	setApiKeyDialog: (apiKeyDialog: boolean) => void
}) => {
	const [loading, setLoading] = useState(false)
	return (
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
						onChangeText={setApiKey} />
					<Button
						disabled={apiKey.length === 0}
						onPress={() => {
							if (typeof apiKey === 'string' && apiKey.length === 0) return
							const set = prefs.setKey(apiKey)
							if (set instanceof Promise) set.then(() => {
								setApiKeyDialog(false)
								window.location.reload()
							}).catch(raise)
							else {
								setApiKeyDialog(false)
								window.location.reload()
							}
						}}
					>
						Submit
					</Button>
					<XStack items='center' gap='$4'>
						<Separator />
						<Text color='$color06' fontSize='$1'>Or</Text>
						<Separator />
					</XStack>
					<Button
						theme='surface1'
						disabled={loading}
						onPress={() => {
							setLoading(true)
							// eslint-disable-next-line @stylistic/max-len
							supabase.functions.invoke<GetApiKey>('get-api-key').then(({ data, error }) => {
								if (error instanceof Error || !data) {
									toast.error('Could not retrieve API Key from the server')
									setLoading(false)
									return
								}
								const set = prefs.setKey(data.key)
								if (set instanceof Promise) set.then(() => {
									setApiKeyDialog(false)
									setLoading(false)
								}).catch(raise)
								else {
									setApiKeyDialog(false)
									setLoading(false)
								}
								window.location.reload()
							})
								.catch(raise)
						}}
					>
						{loading ? <Spinner /> : 'Use a free limited API Key'}
					</Button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	)
}
