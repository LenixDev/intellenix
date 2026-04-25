import '@supabase/functions-js/edge-runtime.d.ts'
import type { UpdateReplyQuota, ApiKeysQuota } from '@types'
import { init } from "init";

const users: ApiKeysQuota = {}

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const { apiKey, model, tokens, type } = await req.json() as UpdateReplyQuota
	if (type === 'get') return new Response(
		JSON.stringify(users[apiKey]),
		{ headers: { ...res, 'Content-Type': 'application/json' } }
	)

	users[apiKey] ??= {}
	const user = users[apiKey]
	user[model] = {
		rpd: (user[model]?.rpd ?? 0) + 1,
		tpd: (user[model]?.tpd ?? 0) + tokens
	}

	return new Response(
		JSON.stringify(users[apiKey]),
		{ headers: { ...res, 'Content-Type': 'application/json' } }
	)
})
