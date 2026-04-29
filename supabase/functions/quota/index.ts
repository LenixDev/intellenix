import "@supabase/functions-js/edge-runtime.d.ts"
import type { QuotaFunction, DailyQuotaFunction, DailyQuota } from "~types"
import { init } from "~init"
import { LIMITS } from "~constants"
import { createClient } from "jsr:@supabase/supabase-js@2"

const supabase = createClient(
	Deno.env.get("SUPABASE_URL")!,
	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

Deno.serve(async req => {
	const [success, res] = init(req)
	if (!success) return res

  const Data = await req.json() as QuotaFunction
	const { type, key, model } = Data
	if (type === 'consume') {
		const { tokens } = Data

		/* TODO: Use rpc instead, RACE CONDITION */
		const { error, data } = await supabase.from('quota')
			.select('rpd, tpd')
			.eq('api_key', key)
			.eq('model', model)
			.single<DailyQuota>()

		if (error) return new Response(
			JSON.stringify({ error: error.message } satisfies DailyQuotaFunction),
			{ headers: res },
		)

		const tpd = data.tpd + tokens, rpd = data.rpd + 1

		const { error: error$ } = await supabase.from('quota')
			.update({ rpd, tpd })
			.eq('api_key', key)
			.eq('model', model)

		if (error$) return new Response(
			JSON.stringify({ error: error$.message } satisfies DailyQuotaFunction),
			{ headers: res },
		)
		
		return new Response(
			JSON.stringify({
				rpd: (rpd * 100) / LIMITS[model].rpd,
				tpd: (tpd * 100) / LIMITS[model].tpd
			} satisfies DailyQuotaFunction),
		 { headers: res },
		)
	}

	const { error, data } = await supabase.from('quota')
		.select('rpd, tpd')
		.eq('api_key', key)
		.eq('model', model)
		.single<DailyQuota>()

	if (error?.code === 'PGRST116') {
		const { error } = await supabase.from('quota').insert({ api_key: key, model, rpd: 0, tpd: 0 })
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
    JSON.stringify({
			rpd: (data.rpd * 100) / LIMITS[model].rpd,
			tpd: (data.tpd * 100) / LIMITS[model].tpd
		} satisfies DailyQuotaFunction),
    { headers: res },
  )
})
