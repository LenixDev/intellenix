import { prefs } from "@/storage"
import { toast } from "@tamagui/toast/v2"
import { raise } from "lenix"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Label, Input, Button, View } from "tamagui"

export const ApiInput = ({
	setKey
}: {
	setKey: (key: string) => void
}) => {
	const [key, setStateKey] = useState('')
	const { t } = useTranslation()
	return (
		<View gap='$4'>
			<View>
				<Label htmlFor='key'>{t('api_key')}</Label>
				<Input
					id='key'
					value={key}
					onChangeText={setStateKey}
					type='password'
					secureTextEntry
				/>
			</View>
			<Button
				disabled={key.length === 0}
				onPress={() => {
					prefs.setKey(key, 'key').then(() => {
						toast.success(t('api_success'))
						setStateKey('')
						setKey(key)
					}).
					catch(raise)
				}}
			>
				{t('save')}
			</Button>
		</View>
	)
}