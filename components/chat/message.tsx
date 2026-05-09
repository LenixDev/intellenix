import { forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TamaguiElement, TextArea, TextAreaProps, View } from 'tamagui';

export const Message = forwardRef<TamaguiElement, {
	message: string
	setMessage: (message: string) => void
	send: () => void
	aiThinking: boolean
	apiKey: string
	isMac: boolean
	isMultiline: boolean
	setIsMultiline: (state: boolean) => void
} & TextAreaProps>(({
	message,
	setMessage,
	send,
	aiThinking,
	apiKey,
	isMac,
	isMultiline,
	setIsMultiline,
	...props
}, ref) => {
	const { t } = useTranslation()

	useEffect(() => {
		if (message !== '') return
		setIsMultiline(false)
		const element = document.querySelector('textarea')
		if (!element) return
		requestAnimationFrame(() => {
			element.style.height = 'auto'
		})
	}, [message])

	return (
		<View flexDirection='row' {...(isMultiline ? {} : { flex: 1 } )} >
			<TextArea
				ref={ref}
				onInput={event => {
					event.currentTarget.style.height = 'auto'
					event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`
					setIsMultiline(event.currentTarget.scrollHeight > 40 || (event.currentTarget as unknown as HTMLTextAreaElement).value.includes('\n'))
				}}
				onBlur={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				placeholder={t('chat_intell')}
				value={message}
				onChangeText={setMessage}
				readOnly={!apiKey}
				onKeyDown={event => {
					if (event.key !== 'Enter') return
					if (isMac ? !event.metaKey : !event.ctrlKey) return
					if (aiThinking) return
					send()
				}}
				{...props}
				mx='$2'
				style={{
					scrollbarWidth: 'none',
					resize: 'none',
					maxHeight: '33vh',
					borderRadius: '0.5rem',
					fontSize: 16
				}}
				focusStyle={{
					borderColor: 'transparent',
					outlineWidth: 0
				}}
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
			/>
		</View>
	)
})
