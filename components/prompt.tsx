import { Dialog, DialogProps } from 'tamagui'

export const Prompt = ({
	open,
	onOpenChange,
	children,
	...props
}: {
	open: DialogProps['open']
	onOpenChange: DialogProps['onOpenChange']
	children: React.ReactNode
} & DialogProps
	& React.ComponentProps<typeof Dialog.Content>) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content {...props}>{children}</Dialog.Content>
		</Dialog.Portal>
	</Dialog>
)
