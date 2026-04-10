import { Sheet } from 'tamagui'

export const Preferences = () => (
	<Sheet open={true} snapPoints={[50, 10]}>
		<Sheet.Overlay />
		<Sheet.Handle />
		<Sheet.Frame bg='$color6'>Hi</Sheet.Frame>
	</Sheet>
)
