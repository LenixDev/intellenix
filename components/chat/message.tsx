import { TextArea } from 'tamagui'

// eslint-disable-next-line max-lines-per-function
export const Message = ({
	content,
	setContent,
	send,
	aiThinking,
	apiKey,
	isMac
}: {
	content: string
	setContent: (content: string) => void
	send: () => void
	aiThinking: boolean
	apiKey: string
	isMac: boolean
}) => {
	const placeholderRows =
		content.split('\n').length === 1
			? 1
			: content.split('\n').length + 1

	return (
		<TextArea
			style={{
				scrollbarWidth: 'none',
				resize: 'none',
				maxHeight: '50vh'
			}}
			focusStyle={{
				borderWidth: 0,
				outlineWidth: 0
			}}
			rounded={0}
			p={0}
			flex={1}
			bg='transparent'
			borderWidth={0}
			rows={placeholderRows}
			autoComplete='on'
			autoCorrect
			placeholder='Chat with Intellenix...'
			value={content}
			onChangeText={setContent}
			readOnly={!apiKey}
			onKeyDown={e => {
				if (e.key !== 'Enter') return
				if (isMac
					? !e.metaKey
					: !e.ctrlKey) return
				if (aiThinking) return
				send()
			}}
		/>
	)
}
