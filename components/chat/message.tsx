import { BaseStyleProps } from '@tamagui/core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextArea, TextAreaProps, View } from 'tamagui';

export const Message = ({
	message,
	setMessage,
	send,
	aiThinking,
	apiKey,
	isMac,
	style,
	setIsMultiLine,
	...props
}: {
	message: string
	setMessage: (message: string) => void
	send: () => void
	aiThinking: boolean
	apiKey: string
	isMac: boolean
	setIsMultiLine: (isMultiLine: boolean) => void
} & TextAreaProps & BaseStyleProps) => {
	const { t } = useTranslation()
	const [previousWidth, setPreviousWidth] = useState<number>()

	useEffect(() => {
		if (message !== '') return
		const element = document.querySelector('textarea')
		if (!element) return
		requestAnimationFrame(() => {
			element.style.height = 'auto'
		})
	}, [message])

	return (
		<View flexDirection='row' {...{ style }}>
			<TextArea
				onInput={event => {
					const element = event.currentTarget
					const ctx = document.createElement('canvas').getContext('2d')

					element.style.height = 'auto'
					element.style.height = `${element.scrollHeight}px`
					ctx.font = getComputedStyle(element).font

					const currentElementWidth = element.scrollWidth
					const currentTextWidth = ctx.measureText(element.value).width

					if (!previousWidth) setPreviousWidth(currentElementWidth)
					if (currentTextWidth > currentElementWidth && currentTextWidth > (previousWidth ?? currentElementWidth) || message.includes('\n')) {
						setIsMultiLine(true)
						setPreviousWidth(currentElementWidth)
					} else if (currentTextWidth < previousWidth) {
						setIsMultiLine(false)
						setPreviousWidth(currentElementWidth)
					}
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
					fontSize: 16
				}}
				focusStyle={{
					borderColor: 'transparent',
					outlineWidth: 0
				}}
				borderColor='transparent'
				hoverStyle={{
					borderColor: 'transparent'
				}}
				rows={1}
				rounded={0}
				py={0}
				px={0}
				flex={1}
				bg='transparent'
			/>
		</View>
	)
}
