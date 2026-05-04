import { toast } from '@tamagui/toast/v2'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import {
	Button,
	Image,
	Paragraph,
	Separator,
	Text,
	View,
	XStack
} from 'tamagui'

export default function Page() {
	const { t } = useTranslation()
	return (
		<View
			width='100%'
			height='100%'
			bg='$background'
			justify='center'
			items='center'>
			<View width='$20' height='50%' justify='space-evenly' items='stretch'>
				<Paragraph width='100%' text='center' marginBlock='$2' size='$13'>
					{t('signin')}
				</Paragraph>
				<View>
					<Button
						theme='accent'
						width='100%'
						onPress={() => {
							toast.error(t('not_yet'))
						}}>
						{t('continue_google')}
					</Button>
					<XStack width='100%' items='center' marginBlock='$4'>
						<Separator flex={1} borderColor='$color' />
						<Text marginInline='$3'>{t('or')}</Text>
						<Separator flex={1} borderColor='$color' />
					</XStack>
					<Button
						width='100%'
						onPress={() => {
							router.replace('/chat')
						}}>
						{t('continue_guest')}
					</Button>
				</View>
			</View>
			<Image
				height='$4'
				src='https://console.groq.com/powered-by-groq-dark.svg'
				alt='Powered by Groq for fast inference.'
			/>
		</View>
	)
}
