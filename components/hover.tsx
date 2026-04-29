import { Tooltip } from 'tamagui';

export const Hover = ({
	children, content
}: {
	children: React.ReactNode
	content: () => React.ReactNode
}) => (
	<Tooltip placement='top'>
		<Tooltip.Trigger asChild>
			{children}
		</Tooltip.Trigger>
		<Tooltip.Content
			enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
			exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
			scale={1}
			x={0}
			y={0}
			opacity={1}
			py='$2'
			px='$3'
			bg='$color9'
			transition={[
				'quick',
				{
					opacity: {
						overshootClamping: true,
					},
				},
			]}
		>
			<Tooltip.Arrow bg='$color9' />
			{content()}
		</Tooltip.Content>
	</Tooltip>
)