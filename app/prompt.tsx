import { supabase } from "@/supabase";
import { SupaPrompt } from "@/types";
import { toast } from "@tamagui/toast/v2";
import { useEffect, useState } from "react";
import { Button, TextArea, View } from "tamagui";

export default function Page() {
	const [prompt, setPrompt] = useState<string>()
	const [loading, setLoading] = useState(false)
	
	useEffect(() => {
		(async () => {
			const { error, data } = await supabase.functions.invoke<Extract<SupaPrompt['return'], string>>('prompt', {
				body: {
					type: 'get'
				}
			})
			if (error || !data) return toast.error('Error', {
				description: error.message
			})
			setPrompt(data)
		})()
	}, [])

	return (
		<View>
			<TextArea
				value={prompt}
				onChangeText={setPrompt}
				height='80vh'
			/>
			<Button
				disabled={!prompt}
				onPress={async () => {
					setLoading(true)
					const { error, data } = await supabase.functions.invoke('prompt', {
						body: {
							type: 'update',
							prompt
						}
					})
					setLoading(false)
					if (error || !data) return toast.error('Error', {
						description: error.message
					})
					toast.success('Updated')
				}}
			>{loading ? 'Updating...' : 'Update'}</Button>
		</View>
	)
}
