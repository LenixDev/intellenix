import "@supabase/functions-js/edge-runtime.d.ts"
import { init, supabase } from "../__shared/index.ts"
import type { GroqFn, GroqParams } from "../../../types.ts"
import Groq from 'groq-sdk'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const arg = await req.json() as GroqParams

	const { error, data } = await supabase
		.from('quota')
		.select('api_key')
		.eq('id', arg.password)
	if (error) return new Response(
		JSON.stringify({ error: error.message } satisfies GroqFn),
		{ headers: res }
	)

	const groq = new Groq({ apiKey: data[0].api_key })
	const { response, ...result } = await groq.chat.completions.create(arg.params).withResponse()

	const get = response.headers.get
	const rateLimits = {
		retry_after: get('retry-after'),
		limit_requests: get('x-ratelimit-limit-requests'),
		limit_tokens: get('x-ratelimit-limit-tokens'),
		remaining_requests: get('x-ratelimit-remaining-requests'),
		remaining_tokens: get('x-ratelimit-remaining-tokens'),
		reset_requests: get('x-ratelimit-reset-requests'),
		reset_tokens: get('x-ratelimit-reset-tokens'),
	}

	return new Response(
    JSON.stringify({ data: result.data, rateLimits } satisfies GroqFn),
    { headers: res },
  )
})
