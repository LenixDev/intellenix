import { supabase } from '@/supabase'
import { SupaPrompt } from '@/types/supa'
import { toast } from '@tamagui/toast/v2'
import { useEffect, useState } from 'react'
import { Button, TextArea, View } from 'tamagui'

export default function Page() {
	const [prompt, setPrompt] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		;(async () => {
			const { error, data } = await supabase.functions.invoke<
				Extract<SupaPrompt['return'], string>
			>('prompt', { body: { type: 'get' } satisfies SupaPrompt['args'] })
			if (error || !data)
				return toast.error('Error', { description: error.message })
			setPrompt(data)
		})()
	}, [])

	return (
		<View>
			<TextArea
				value={prompt}
				onChangeText={setPrompt}
				height='80vh'
				fontSize={16}
			/>
			<Button
				disabled={!prompt}
				onPress={async () => {
					setLoading(true)
					const { error, data } = await supabase.functions.invoke('prompt', {
						body: { type: 'update', prompt } satisfies SupaPrompt['args']
					})
					setLoading(false)
					if (error || !data)
						return toast.error('Error', { description: error.message })
					toast.success('Updated')
				}}
			>
				{loading ? 'Updating...' : 'Update'}
			</Button>
		</View>
	)
}
