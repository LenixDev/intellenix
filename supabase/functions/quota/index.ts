import "@supabase/functions-js/edge-runtime.d.ts"
import type { GetQuota, DailyQuotaFunction } from "@types"
import { init } from "init"
import { createClient } from "jsr:@supabase/supabase-js@2"

const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

  const { key, model } = await req.json() as GetQuota
	const { error, data } = await supabase.from('quota')
	.select('tokens, requests')
	.eq('api_key', key)
	.eq('model', model)
	.single<DailyQuotaFunction>()

	if (error?.code === 'PGRST116') {
		const { error } = await supabase.from('quota')
		.insert({ api_key: key, model, tokens: 0, requests: 0 })

		if (error) return new Response(
			JSON.stringify({ error: error.message } satisfies DailyQuotaFunction),
			{ headers: res },
		)
		return new Response(
			JSON.stringify({
				rpd: 0,
				tpd: 0
			} satisfies DailyQuotaFunction),
		 { headers: res },
		)
	}

	if (error) return new Response(
		JSON.stringify({ error: error.message } satisfies DailyQuotaFunction),
		{ headers: res },
	)
	
  return new Response(
    JSON.stringify(data satisfies DailyQuotaFunction),
    { headers: res },
  )
})
