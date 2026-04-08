import { Text, View } from "tamagui";

export const Kbd = ({ children }: { children: React.ReactNode | string }) => (
	<View
		bg="$color4"
		p="$1"
		rounded="$3"
		borderWidth={1}
		height='$1.5'
		borderColor="$borderColor"
		justify='center'
	>
		<Text fontSize='$1' color='$color06' lineHeight={0}>{children}</Text>
	</View>
)
