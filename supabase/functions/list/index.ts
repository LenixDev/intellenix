import '@supabase/functions-js/edge-runtime.d.ts'
import { init, supabase } from '../__shared/index.ts'
import type { SupaList } from '../../../types.ts'
import Groq from 'groq-sdk'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const { id } = (await req.json()) as SupaList['args']

	const { error, data } = await supabase
		.from('quota')
		.select('api_key')
		.eq('id', id)
		.limit(1)
		.single<{ api_key: string }>()
	if (error)
		return new Response(
			JSON.stringify({ error: error.message } satisfies SupaList['fn']),
			{ headers: res }
		)

	const groq = new Groq({ apiKey: data.api_key })
	const list = await groq.models.list()

	return new Response(JSON.stringify(list satisfies SupaList['fn']), {
		headers: res
	})
})
