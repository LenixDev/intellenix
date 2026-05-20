import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Text, View, type ViewProps } from 'tamagui'
import type { Components } from 'react-markdown'

const components: Components = {
	p: ({ children }) => <Text fontWeight='300'>{children}</Text>,
	strong: ({ children }) => <Text fontWeight='bold'>{children}</Text>,
	em: ({ children }) => <Text fontStyle='italic'>{children}</Text>,
	del: ({ children }) => (
		<Text textDecorationLine='line-through'>{children}</Text>
	),
	h1: ({ children }) => (
		<Text fontSize='$7' fontWeight='bold'>
			{children}
		</Text>
	),
	h2: ({ children }) => (
		<Text fontSize='$6' fontWeight='bold'>
			{children}
		</Text>
	),
	h3: ({ children }) => (
		<Text fontSize='$5' fontWeight='bold'>
			{children}
		</Text>
	),
	code: ({ children }) => (
		<Text bg='$color3' px='$1' rounded='$2'>
			{children}
		</Text>
	),
	li: ({ children }) => (
		<View flexDirection='row' gap='$2'>
			<Text>•</Text>
			<Text fontWeight='200'>{children}</Text>
		</View>
	),
	blockquote: ({ children }) => (
		<View borderLeftWidth={3} borderLeftColor='$color6' pl='$3'>
			{children}
		</View>
	)
}

export const RichText = ({
	children,
	...props
}: { children: string } & ViewProps) => (
	<View {...props}>
		<ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
			{children}
		</ReactMarkdown>
	</View>
)
