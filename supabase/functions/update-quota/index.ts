import '@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import type { UpdateReplyQuota, UpdateQuota, Models } from '@types'
import { init } from 'init'

const supabase = createClient(
	Deno.env.get('SUPABASE_URL')!,
	Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const { apiKey, model, tokens, type } = await req.json() as UpdateReplyQuota

	if (type === 'get') {
		const { data } = await supabase
			.from('quota')
			.select('model, tokens')
			.eq('api_key', apiKey)
			.gte('created_at', new Date(Date.now() - 86_400_000).toISOString())

		const result = (data ?? []).reduce<Partial<UpdateQuota>>((acc, row) => {
			const $ = row.model as Models
			acc[$] ??= { rpd: 0, tpd: 0 }
			acc[$]!.rpd += 1
			acc[$]!.tpd += row.tokens
			return acc
		}, {})

		console.log(result)
		return new Response(
			JSON.stringify(result),
			{ headers: { ...res, 'Content-Type': 'application/json' } }
		)
	}

	await supabase.from('quota').insert({ api_key: apiKey, model, tokens })

	return new Response(
		JSON.stringify(null),
		{ headers: { ...res, 'Content-Type': 'application/json' } }
	)
})