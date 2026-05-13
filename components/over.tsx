import { Popover } from 'tamagui'

export const Over = ({
	children,
	content
}: {
	children: React.ReactNode
	content: React.ReactNode
}) => (
	<Popover offset={15} placement='top'>
		<Popover.Trigger asChild>{children}</Popover.Trigger>
		<Popover.Content
			borderWidth={1}
			borderColor='$borderColor'
			enterStyle={{ y: 10, opacity: 0 }}
			exitStyle={{ y: 10, opacity: 0 }}
			boxShadow='0px 4px 8px rgba(0,0,0,0.1), 0px 12px 32px rgba(0,0,0,0.08)'
			transition={[
				'quick',
				{
					opacity: {
						overshootClamping: true
					}
				}
			]}>
			{content}
		</Popover.Content>
	</Popover>
)
