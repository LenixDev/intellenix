import { prefs } from '@/storage'
import { supabase } from '@/supabase'
import { toast } from '@tamagui/toast/v2'
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
import { Prompt } from '../components/prompt'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supaError } from '@/lib'
import { SupaKey } from '@/types/supa'

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
			gap='$6'
			open={keyDialog}
			onOpenChange={open => {
				if (!open) return
				setKeyDialog(open)
			}}
		>
			<View>
				<Dialog.Title>{t('enter_key')}</Dialog.Title>
				<Dialog.Description>
					{t('get_key')}:{' '}
					<a target='_blank' href='https://console.groq.com/keys'>
						https://console.groq.com/keys
					</a>
				</Dialog.Description>
			</View>
			<Input
				type='password'
				secureTextEntry
				value={apiKey}
				onChangeText={setKey}
			/>
			<Button
				disabled={apiKey.length === 0}
				onPress={async () => {
					if (typeof apiKey === 'string' && apiKey.length === 0) return
					await prefs.setKey(apiKey, 'key')
					setKeyDialog(false)
					window.location.reload()
				}}
			>
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
				onPress={async () => {
					setLoading(true)

					const { error, data } = await supabase.functions.invoke<
						SupaKey['return']
					>('key', { body: { type: 'usePublic' } satisfies SupaKey['args'] })

					if (error instanceof FunctionsHttpError || !data) {
						toast.error(t('key_err'), { description: supaError(error) })
						setLoading(false)
						return
					}

					await prefs.setKey(data, 'id')
					setKeyDialog(false)
					setLoading(false)
					window.location.reload()
				}}
			>
				{loading ?
					<Spinner />
				:	t('pub_key')}
			</Button>
		</Prompt>
	)
}
