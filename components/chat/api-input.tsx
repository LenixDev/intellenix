import { prefs } from "@/storage"
import { toast } from "@tamagui/toast/v2"
import { raise } from "lenix"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Label, Input, Button, View } from "tamagui"

export const ApiInput = () => {
	const [key, setKey] = useState('')
	const { t } = useTranslation()
	return (
		<View gap='$4'>
			<View>
				<Label htmlFor='key'>{t('api_key')}</Label>
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
					const pref = prefs.setKey(key, 'api-key')
					if (pref instanceof Promise) pref.
						then(() => {
							toast.success(t('api_success'))
							setKey('')
						}).
						catch(raise)
					else {
						toast.success(t('api_success'))
						setKey('')
					}
				}}
			>
				{t('save')}
			</Button>
		</View>
	)
}