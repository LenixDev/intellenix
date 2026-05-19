import { BaseStyleProps } from '@tamagui/core'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TextArea, TextAreaProps, View } from 'tamagui'
import { prefs } from '@/storage'

export const Message = ({
	message,
	setMessage,
	send,
	aiThinking,
	apiKey,
	isMac,
	isMultiLine,
	setIsMultiLine,
	quotaDisplayed,
	keyId: id,
	...props
}: {
	message: string
	setMessage: (message: string) => void
	send: () => void
	aiThinking: boolean
	apiKey: string
	isMac: boolean
	isMultiLine: boolean
	setIsMultiLine: (isMultiLine: boolean) => void
	quotaDisplayed: boolean | undefined
	keyId: string | undefined | null
} & TextAreaProps) => {
	const { t } = useTranslation()
	const narrowWidth = useRef<number>(0)

	useEffect(() => {
		const el = document.querySelector('textarea') as HTMLTextAreaElement
		if (!el) return
		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}, [isMultiLine])

	useEffect(() => {
		setTimeout(() => {
			const el = document.querySelector('textarea') as HTMLTextAreaElement
			if (el) narrowWidth.current = el.offsetWidth - 2
		}, 100)
	}, [quotaDisplayed])

	useEffect(() => {
		prefs.setKey(message, 'message')
		if (message !== '') return
		const element = document.querySelector('textarea')
		if (!element) return
		requestAnimationFrame(() => {
			element.style.height = 'auto'
		})
	}, [message])

	return (
		<View flexDirection='row' style={{ flex: 1 }}>
			<TextArea
				onInput={event => {
					const el = event.currentTarget as unknown as HTMLTextAreaElement
					const ctx = document.createElement('canvas').getContext('2d')!

					ctx.font = getComputedStyle(el).font

					const textWidth = Number(ctx.measureText(el.value).width.toFixed(0))
					const overflows =
						textWidth > narrowWidth.current || el.value.includes('\n')

					el.style.height = 'auto'
					el.style.height = `${el.scrollHeight}px`
					setIsMultiLine(overflows)
				}}
				onBlur={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				placeholder={t('chat_intell')}
				value={message}
				onChangeText={setMessage}
				readOnly={apiKey === '' && !id}
				onKeyDown={event => {
					if (event.key !== 'Enter') return
					if (isMac ? !event.metaKey : !event.ctrlKey) return
					if (aiThinking) return
					send()
					setIsMultiLine(false)
				}}
				{...props}
				style={{
					scrollbarWidth: 'none',
					resize: 'none',
					maxHeight: '33vh',
					fontSize: 16
				}}
				focusStyle={{ borderColor: 'transparent', outlineWidth: 0 }}
				borderColor='transparent'
				hoverStyle={{ borderColor: 'transparent' }}
				rows={1}
				rounded={0}
				py={0}
				px={isMultiLine ? '$2' : 0}
				flex={1}
				bg='transparent'
			/>
		</View>
	)
}
