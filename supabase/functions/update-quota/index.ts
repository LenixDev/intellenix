import '@supabase/functions-js/edge-runtime.d.ts'
import type { UpdateReplyQuota, UsersQuota } from '@types'

const users: UsersQuota = {}

Deno.serve(async req => {
	const { apiKey, model, tokens } = await req.json() as UpdateReplyQuota

	users[apiKey] ??= {}
	const user = users[apiKey]
	user[model] = {
		rpd: (user[model]?.rpd ?? 0) + 1,
		tpd: (user[model]?.tpd ?? 0) + tokens
	}

	return new Response(
		JSON.stringify(users[apiKey]),
		{ headers: { "Content-Type": "application/json" } },
	)
})
