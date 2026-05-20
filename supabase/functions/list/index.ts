import '@supabase/functions-js/edge-runtime.d.ts'
import { init, supabase } from '../__shared/index.ts'
import type { SupaList } from '../../../types/supa.ts'
import Groq from 'groq-sdk'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const { id } = (await req.json()) as SupaList['args']

	const { error, data } = await supabase
		.from('users')
		.select('api_key')
		.eq('id', id)
		.limit(1)
		.single<{ api_key: string }>()
	if (error)
		return new Response(
			JSON.stringify(error),
			{
				headers: res,
				status: 400
			}
		)

	const groq = new Groq({ apiKey: data.api_key })
	const list = await groq.models.list()

	return new Response(JSON.stringify(list satisfies SupaList['return']), {
		headers: res
	})
})
