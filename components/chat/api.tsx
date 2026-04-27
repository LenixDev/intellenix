import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import type { GetKey } from '@/types'
import { toast } from '@tamagui/toast/v2'
import { raise } from 'lenix'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Dialog, Input, Separator, View, Text, XStack, Spinner } from 'tamagui'

// eslint-disable-next-line max-lines-per-function
export const Api = ({
	apiKey,
	setKey,
	keyDialog,
	setKeyDialog,
}: {
	apiKey: string
	setKey: (key: string) => void
	keyDialog: boolean
	setKeyDialog: (keyDialog: boolean) => void
}) => {
	const [loading, setLoading] = useState(false)
	const { t } = useTranslation()
	return (
		<Dialog open={keyDialog} onOpenChange={setKeyDialog}>
			<Dialog.Portal>
				<Dialog.Overlay />
				<Dialog.Content gap='$6'>
					<View>
						<Dialog.Title>{t('enter_key')}</Dialog.Title>
						<Dialog.Description>
							{t('fill_key')}
						</Dialog.Description>
					</View>
					<Input
						type='password'
						secureTextEntry
						value={apiKey}
						onChangeText={setKey} />
					<Button
						disabled={apiKey.length === 0}
						onPress={() => {
							if (typeof apiKey === 'string' && apiKey.length === 0) return
							const set = prefs.setKey(apiKey, 'key')
							if (set instanceof Promise) set.then(() => {
								setKeyDialog(false)
								window.location.reload()
							}).catch(raise)
							else {
								setKeyDialog(false)
								window.location.reload()
							}
						}}
					>
						{t('submit')}
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
							supabase.functions.invoke<GetKey>('get-key').then(({ data, error }) => {
								if (error instanceof Error || !data) {
									toast.error(t('key_err'))
									setLoading(false)
									return
								}
								const set = prefs.setKey(data.key, 'key')
								if (set instanceof Promise) set.then(() => {
									setKeyDialog(false)
									setLoading(false)
									window.location.reload()
								}).catch(raise)
								else {
									setKeyDialog(false)
									setLoading(false)
									window.location.reload()
								}
							})
								.catch(raise)
						}}
					>
						{loading ? <Spinner /> : t('pub_key')}
					</Button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog>
	)
}
