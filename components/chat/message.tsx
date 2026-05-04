import { useTranslation } from 'react-i18next'
import { TextArea } from 'tamagui'

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
	const { t } = useTranslation()
	return (
		<TextArea
			style={{
				scrollbarWidth: 'none',
				resize: 'none',
				maxHeight: '33vh',
				borderRadius: '0.5rem',
				fontSize: 16
			}}
			onInput={event => {
				event.currentTarget.style.height = 'auto'
				event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
			}}
			focusStyle={{
				borderColor: 'transparent',
				outlineWidth: 0
			}}
			onBlur={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			outlineWidth={0}
			borderWidth={1}
			borderColor='transparent'
			hoverStyle={{
				borderColor: '$color5'
			}}
			rows={1}
			rounded={0}
			py={0}
			px='$2'
			flex={1}
			bg='transparent'
			autoComplete='on' /* TODO: add to config */
			autoCorrect /* TODO: add to config */
			placeholder={t('chat_intell')}
			value={content}
			onChangeText={setContent}
			readOnly={!apiKey}
			onKeyDown={event => {
				if (event.key !== 'Enter') return
				if (isMac ? !event.metaKey : !event.ctrlKey) return
				if (aiThinking) return
				send()
			}}
		/>
	)
}
