import type { Conversation as IConversation } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View, Button, Spinner } from 'tamagui'
import { Copy } from './copy'
import { toast } from '@tamagui/toast/v2'
import { Pencil, Reply } from '@tamagui/lucide-icons-2'
import { createPortal } from 'react-dom'

export const Conversation = ({
  conversations,
  isPortrait,
	aiThinking
}: {
  conversations: IConversation[]
  isPortrait: boolean
	aiThinking: boolean
}) => {
  const [shown, setShown] = useState<Record<string, boolean>>({})
  const [hover, setHover] = useState<Record<string, boolean>>({})
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
  const { t } = useTranslation()
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection()
      const text = sel?.toString().trim()
      if (!text) return setSelection(null)

      const rect = sel!.getRangeAt(0).getBoundingClientRect()
      setSelection({ text, x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 30 })
    }
		const onScroll = () => setSelection(null)

    document.addEventListener('mouseup', handler)
		document.addEventListener('scroll', onScroll, true)

    return () => {
			document.removeEventListener('mouseup', handler)
			document.removeEventListener('scroll', onScroll, true)
		}
  }, [])

  return (
    <>
      <ScrollView
        ref={scrollRef}
        width='100%'
        py='$10'
				px={isPortrait ? '$2' : '$5'}
        flex={1}
        onContentSizeChange={() => {
          scrollRef.current?.scrollToEnd({ animated: true })
        }}
				// @ts-ignore
        scrollbarWidth='none'>
        {conversations.map($ => {
          if ($.role === 'user') return (
            <View
              key={$.date}
              items='flex-end'
              gap='$4'
              mb='$5'
              bg={shown[$.date] || hover[$.date] ? '$color001' : undefined}
              rounded={shown[$.date] || hover[$.date] ? '$2' : undefined}
              onClick={() => setShown({ [$.date]: !shown[$.date] })}
              onMouseEnter={() => setHover({ [$.date]: true })}
              onMouseLeave={() => setHover({ [$.date]: false })}>
              <View flexDirection='row' items='center' gap='$3'>
                <Button
                  opacity={hover[$.date] ? 1 : 0}
                  chromeless
                  circular
                  icon={Pencil}
                  size='$2'
                  onPress={event => {
                    toast.info(t('not_yet'))
                    event.stopPropagation()
                  }}
                />
                <Copy text={$.content} opacity={hover[$.date] ? 1 : 0} />
                <Text
                  py='$2'
                  px='$3'
                  maxW='100%'
                  color='$colorFocus'
                  bg='$color1'
                  rounded='$5'
                  onPress={event => event.stopPropagation()}>
                  {$.content}
                </Text>
              </View>
              <View gap={0} items='flex-end' opacity={shown[$.date] ? 1 : 0}>
                <Text color='$color04' fontSize='$1'>{$.date}</Text>
                <Text color='$color04' fontStyle='italic' fontSize='$1'>
                  {t('tokens_used')} {($ as any).completion_tokens}
                </Text>
              </View>
            </View>
          ); return (
            <View
              key={$.date}
              gap='$4'
              bg={shown[$.date] || hover[$.date] ? '$color001' : undefined}
              onClick={() => setShown({ [$.date]: !shown[$.date] })}
              onMouseEnter={() => setHover({ [$.date]: true })}
              onMouseLeave={() => setHover({ [$.date]: false })}>
              <View flexDirection='row' gap='$3' rounded={shown[$.date] || hover[$.date] ? '$2' : undefined}>
                <Text
                  bg='$background'
                  maxW='90%'
                  self='flex-start'
                  color='$color'
                  onPress={event => event.stopPropagation()}>
                  {$.content}
                </Text>
                <Copy text={$.content} opacity={hover[$.date] ? 1 : 0} />
              </View>
              <View gap={0} opacity={shown[$.date] ? 1 : 0}>
                <Text color='$color04' fontSize='$1'>{$.date}</Text>
                <Text color='$color04' fontStyle='italic' fontSize='$1'>
                  {t('took')} {$.usage?.queue_time?.toFixed(2)}
                  {t('s')} | {t('tokens_used')} {$.usage?.completion_tokens} |{' '}
                  {t('service_tier')} {$.service_tier}
                </Text>
              </View>
            </View>
          )
        })}
				<View items='flex-start'>
					{aiThinking && <Spinner />}
				</View>
      </ScrollView>
      {selection && createPortal(
        <View
          position='absolute'
          style={{ left: selection.x, top: selection.y, transform: 'translateX(-50%)', zIndex: 9999 }}>
          <Button
						icon={Reply}
						size='$2'
						onPress={() => toast.info(t('not_yet'))}
					/>
        </View>,
        document.body
      )}
    </>
  )
}