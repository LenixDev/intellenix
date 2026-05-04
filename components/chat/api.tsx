import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import type { GetKey, SupaKeyArgs } from '@/types'
import { toast } from '@tamagui/toast/v2'
import { raise } from 'lenix'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Button,
	Dialog,
	Input,
	Separator,
	View,
	Text,
	XStack,
	Spinner
} from 'tamagui'
import { Prompt } from '../prompt'

// eslint-disable-next-line max-lines-per-function
export const Api = ({
	apiKey,
	setKey,
	keyDialog,
	setKeyDialog
}: {
	apiKey: string
	setKey: (key: string) => void
	keyDialog: boolean
	setKeyDialog: (keyDialog: boolean) => void
}) => {
	const [loading, setLoading] = useState(false)
	const { t } = useTranslation()
	return (
		<Prompt
		open={keyDialog}
		onOpenChange={open => {
			if (!open) return
			setKeyDialog(open)
		}}
		gap='$6'>
			<View>
				<Dialog.Title>{t('enter_key')}</Dialog.Title>
				<Dialog.Description>{t('fill_key')}</Dialog.Description>
			</View>
			<Input
				type='password'
				secureTextEntry
				value={apiKey}
				onChangeText={setKey}
			/>
			<Button
				disabled={apiKey.length === 0}
				onPress={() => {
					if (typeof apiKey === 'string' && apiKey.length === 0) return
					prefs
						.setKey(apiKey, 'key')
						.then(() => {
							setKeyDialog(false)
							window.location.reload()
						})
						.catch(raise)
				}}>
				{t('submit')}
			</Button>
			<XStack items='center' gap='$4'>
				<Separator />
				<Text color='$color06' fontSize='$1'>
					{t('or')}
				</Text>
				<Separator />
			</XStack>
			<Button
				theme='surface1'
				disabled={loading}
				onPress={() => {
					setLoading(true)
					// eslint-disable-next-line @stylistic/max-len
					supabase.functions
						.invoke<GetKey>('get-key', { body: {
							type: 'get'
						} satisfies SupaKeyArgs})
						.then(({ data, error }) => {
							if (error instanceof Error || !data || typeof data !== 'string' && 'error' in data) {
								toast.error(t('key_err'))
								setLoading(false)
								return
							}
							prefs
								.setKey(data, 'key')
								.then(() => {
									setKeyDialog(false)
									setLoading(false)
									window.location.reload()
								})
								.catch(raise)
						})
						.catch(raise)
				}}>
				{loading ?
					<Spinner />
					: t('pub_key')}
			</Button>
		</Prompt>
	)
}
