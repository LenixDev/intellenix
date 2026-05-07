import '@supabase/functions-js/edge-runtime.d.ts'
import type { GetKey, SupaKeyArgs, SupaProtect } from '../../../types.ts'
import { init, supabase } from '../__shared/index.ts'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const Data = await req.json() as SupaKeyArgs
	if (Data.type === 'get') {
		const key = Deno.env.get('API_KEY')
		if (typeof key !== 'string') return new Response(JSON.stringify({ error: 'missing key'} satisfies GetKey), {
			headers: res
		})

		return new Response(JSON.stringify(key satisfies GetKey), {
			headers: res
		})
	}

	if (Data.type === 'new') {
		const { error, data } = await supabase.from('quota')
			.insert({
				api_key: Data.key,
				model: Data.model
			})
			.select('id')
			.single<{ id: string }>()
			
		if (error) return new Response(
			JSON.stringify({ error: error.message } satisfies GetKey),
			{ headers: res }
		)

		return new Response(
			JSON.stringify(data.id satisfies GetKey),
			{ headers: res }
		)
	}
	
	const { error, data } = await supabase
		.from('quota')
		.select('id')
		.eq('api_key', Data.key)
		.limit(1)
		.single<{ id: string }>()
	if (error) return new Response(
		JSON.stringify({ error: error.message } satisfies SupaProtect),
		{ headers: res }
	)

	return new Response(JSON.stringify(data.id satisfies SupaProtect), {
		headers: res
	})
})
