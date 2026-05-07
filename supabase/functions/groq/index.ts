import "@supabase/functions-js/edge-runtime.d.ts"
import { init, supabase } from "../__shared/index.ts"
import type { GroqFn, GroqParams } from "../../../types.ts"
import Groq from 'groq-sdk'

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

	const { key, id, params} = await req.json() as GroqParams

	let apiKey = key
	if (!key) {
		const { error, data } = await supabase
			.from('quota')
			.select('api_key')
			.eq('id', id)
			.limit(1)
			.single<{ api_key: string }>()
		if (error) return new Response(
			JSON.stringify({ error: error.message } satisfies GroqFn),
			{ headers: res }
		)

		apiKey = data.api_key
	}

	const groq = new Groq({ apiKey })
	const { response, ...result } = await groq.chat.completions.create(params).withResponse()

	const rateLimits = {
		retry_after: response.headers.get('retry-after'),
		limit_requests: response.headers.get('x-ratelimit-limit-requests'),
		limit_tokens: response.headers.get('x-ratelimit-limit-tokens'),
		remaining_requests: response.headers.get('x-ratelimit-remaining-requests'),
		remaining_tokens: response.headers.get('x-ratelimit-remaining-tokens'),
		reset_requests: response.headers.get('x-ratelimit-reset-requests'),
		reset_tokens: response.headers.get('x-ratelimit-reset-tokens'),
	}

	return new Response(
    JSON.stringify({ data: result.data, rateLimits } satisfies GroqFn),
    { headers: res },
  )
})
