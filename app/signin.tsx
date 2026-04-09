import { toast } from '@tamagui/toast/v2'
import { router } from 'expo-router'
import { Button, Paragraph, Separator, Text, View, XStack } from 'tamagui'

export default function Page() {
	return (
		<View
			width='100%'
			height='100%'
			bg='$background'
			justify='center'
			items='center'
		>
			<View width='$20' height='50%' justify='space-evenly' items='stretch'>
				<Paragraph width='100%' text='center' marginBlock='$2' size='$13'>
					Sign in
				</Paragraph>
				<View>
					<Button
						theme='accent'
						width='100%'
						onPress={() => {
							toast.error('Not implemented yet')
						}}
					>
						Continue with Google
					</Button>
					<XStack width='100%' items='center' marginBlock='$4'>
						<Separator flex={1} borderColor='$color' />
						<Text marginInline='$3'>Or</Text>
						<Separator flex={1} borderColor='$color' />
					</XStack>
					<Button
						width='100%'
						onPress={() => {
							router.replace('/chat')
						}}
					>
						Continue as Guest
					</Button>
				</View>
			</View>
		</View>
	)
}
