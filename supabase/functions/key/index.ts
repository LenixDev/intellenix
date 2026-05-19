import '@supabase/functions-js/edge-runtime.d.ts'
import type {
	SupaKey,
	SupaProtect,
	SupaPublic
} from '../../../types.ts'
import { init, supabase } from '../__shared/index.ts'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const Data = (await req.json()) as SupaKey['args']
	const key = Deno.env.get('API_KEY')

	if (Data.type === 'getById') {
		const { error, data } = await supabase.from('quota')
			.select('api_key')
			.eq('id', Data.id)
			.limit(1)
			.single<{ api_key: string }>()

		if (error) return new Response(
			JSON.stringify(error),
			{
				headers: res,
				status: 400
			}
		)

		return new Response(
			JSON.stringify(data.api_key satisfies SupaKey['return']),
			{ headers: res }
		)
	}

	if (Data.type === 'usePublic') {
		if (typeof key !== 'string')
			return new Response(
				JSON.stringify('missing key'),
				{
					headers: res,
					status: 500
				}
			)

		const { error, data } = await supabase.from('quota')
			.insert({ api_key: key })
			.select('id')
			.limit(1)
			.single<{ id: string }>()

		if (error) return new Response(
			JSON.stringify(error),
			{
				headers: res,
				status: 400
			}
		)

		return new Response(
			JSON.stringify(data.id satisfies SupaKey['return']),
			{ headers: res }
		)
	}

	if (Data.type === 'update') {
		const { error } = await supabase
			.from('quota')
			.update({ api_key: Data.key })
			.eq('id', Data.id)

		if (error)
			return new Response(JSON.stringify({ error: error.message }), {
				headers: res,
				status: 400
			})

		return new Response(JSON.stringify('ok'), { headers: res })
	}

	if (Data.type === 'public') {
		if (Data.id) {
			const { error } = await supabase
				.from('quota')
				.update({ api_key: key })
				.eq('id', Data.id)

			if (error)
				return new Response(JSON.stringify({ error: error.message }), {
					headers: res,
					status: 400
				})
		}

		if (typeof key !== 'string')
			return new Response(JSON.stringify({ error: 'missing key' }), {
				headers: res,
				status: 400
			})
		return new Response(JSON.stringify(key satisfies SupaPublic), {
			headers: res
		})
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
				.insert({ api_key: Data.key })
				.select('id')
				.single<{ id: string }>()

			if (error)
				return new Response(
					JSON.stringify({ error: error.message } satisfies SupaProtect),
					{ headers: res }
				)

			return new Response(JSON.stringify(data.id satisfies SupaProtect), {
				headers: res
			})
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
