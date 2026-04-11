import { prefs } from '@/storage'
import { toast } from '@tamagui/toast/v2'
import { raise } from 'lenix'
import { useState } from 'react'
import { Button, Input, Label, Sheet, View } from 'tamagui'

export const Preferences = ({
	open,
	setOpen
}: {
	open: boolean
	setOpen: (open: boolean) => void
}) => {
	const [key, setKey] = useState('')
	return (
		<Sheet open={open} onOpenChange={setOpen} snapPoints={[50, 10]}>
			<Sheet.Overlay />
			<Sheet.Handle />
			<Sheet.Frame
				bg='$color6'
				items='center'
				justify='center'
			>
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
							if (pref instanceof Promise) pref.then(() => {
								toast.success('API Key updated')
								setKey('')
							}).catch(raise)
							else {
								toast.success('API Key updated')
								setKey('')
							}
						}}
					>Update</Button>
				</View>
			</Sheet.Frame>
		</Sheet>
	)
}
