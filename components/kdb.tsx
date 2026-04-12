import { type GetThemeValueForKey, Text, View } from 'tamagui'

export const Kbd = ({
	size,
	children
}: {
	size: number | GetThemeValueForKey<'fontSize'>
	children: React.ReactNode | string
}) => (
	<View
		bg='$color4'
		px='$1.5'
		rounded='$3'
		borderWidth={1}
		height={typeof size === 'number' ? size + size / 2 : '$1'}
		borderColor='$borderColor'
		justify='center'
	>
		<Text fontSize={size} color='$color06' lineHeight={0}>
			{children}
		</Text>
	</View>
)
