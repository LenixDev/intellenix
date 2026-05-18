import '@supabase/functions-js/edge-runtime.d.ts'
import { init, supabase } from '../__shared/index.ts'
import type { SupaPrompt } from '../../../types.ts'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const Data = (await req.json()) as SupaPrompt['args']
	if (Data.type === 'get') {
		const { error, data } = await supabase
			.from('prompt')
			.select('prompt')
			.limit(1)
			.single()
		if (error)
			return new Response(
				JSON.stringify(error satisfies SupaPrompt['return']),
				{ headers: res, status: 400 }
			)

		return new Response(
			JSON.stringify(data.prompt satisfies SupaPrompt['return']),
			{ headers: res }
		)
	}

	if (Data.type === 'update') {
		const { error } = await supabase
			.from('prompt')
			.update({ prompt: Data.prompt })
			.eq('id', 1)
		if (error)
			return new Response(
				JSON.stringify(error satisfies SupaPrompt['return']),
				{ headers: res, status: 400 }
			)
	}

	return new Response(JSON.stringify('ok'), { headers: res })
})
