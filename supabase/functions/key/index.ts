import '@supabase/functions-js/edge-runtime.d.ts'
import type { GetKey, SupaKeyArgs, SupaProtect, SupaPublic } from '../../../types.ts'
import { init, supabase } from '../__shared/index.ts'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const Data = await req.json() as SupaKeyArgs
	const key = Deno.env.get('API_KEY')

	if (Data.type === 'get') {
		if (typeof key !== 'string') return new Response(
			JSON.stringify({ error: 'missing key'} satisfies GetKey),
			{ headers: res }
		)

		return new Response(JSON.stringify(key satisfies GetKey), {
			headers: res
		})
	}

	if (Data.type === 'new') {
		const { error, data } = await supabase
			.from('quota')
			.select('api_key')
			.eq('id', Data.id)
			.limit(1)
			.single<{ api_key: string }>()
		if (error) return new Response(
			JSON.stringify({ error: error.message } satisfies GetKey),
			{ headers: res }
		)

		if (data.api_key !== key) {
			const { error } = await supabase
				.from('quota')
				.delete()
				.eq('api_key', data.api_key)
			if (error) return new Response(
				JSON.stringify({ error: error.message } satisfies GetKey),
				{ headers: res }
			)
		}

		const { error: error$, data: data$ } = await supabase
			.from('quota')
			.insert({
				api_key: Data.key,
				model: Data.model
			})
			.select('id')
			.single<{ id: string }>()

		if (error$) return new Response(
			JSON.stringify({ error: error$.message } satisfies GetKey),
			{ headers: res }
		)

		return new Response(
			JSON.stringify(data$.id satisfies GetKey),
			{ headers: res }
		)
	}

	if (Data.type === 'public') {
		if (Data.id) {
			const { error } = await supabase
				.from('quota')
				.update({
					api_key: key
				})
				.eq('id', Data.id)

			if (error) return new Response(
				JSON.stringify({ error: error.message } satisfies SupaPublic),
				{ headers: res }
			)
		}

		if (typeof key !== 'string') return new Response(
			JSON.stringify({ error: 'missing key'} satisfies SupaPublic),
			{ headers: res }
		)
		return new Response(
			JSON.stringify(key satisfies SupaPublic),
			{ headers: res }
		)
	}
	
	const { error, data } = await supabase
		.from('quota')
		.select('id')
		.eq('api_key', Data.key)
		.limit(1)
		.single<{ id: string }>()
	
	if (error) {
		if (error.code === 'PGRST116') {
			const { error, data } = await supabase
				.from('quota')
				.insert({
					api_key: Data.key,
					model: Data.model
				})
				.select('id')
				.single<{ id: string }>()

			if (error) return new Response(
				JSON.stringify({ error: error.message } satisfies SupaProtect),
				{ headers: res }
			)

			return new Response(
				JSON.stringify(data.id satisfies SupaProtect),
				{ headers: res }
			)
		}
		return new Response(
			JSON.stringify({ error: error.message } satisfies SupaProtect),
			{ headers: res }
		)
	}

	return new Response(JSON.stringify(data.id satisfies SupaProtect), {
		headers: res
	})
})
