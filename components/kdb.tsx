import { Text, View } from "tamagui";

export const Kbd = ({ children }: { children: React.ReactNode | string }) => (
	<View
		bg="$color4"
		p="$2"
		rounded="$3"
		borderWidth={1}
		height='$2.5'
		borderColor="$borderColor"
		justify='center'
	>
		<Text color='$color06' lineHeight={0}>{children}</Text>
	</View>
)
