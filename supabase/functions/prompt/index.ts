import "@supabase/functions-js/edge-runtime.d.ts"
import { init, supabase } from "../__shared/index.ts"
import type { SupaPrompt } from "../../../types.ts"

Deno.serve(async req => {
  const [success, res] = init(req)
	if (!success) return res

	const { error, data } = await supabase.from('prompt').select('prompt').limit(1).single()
	if (error) return new Response(
		JSON.stringify(error satisfies SupaPrompt['return']),
		{
			headers: res,
			status: 400
		}
	)

  return new Response(
    JSON.stringify(data.prompt satisfies SupaPrompt['return']),
    { headers: res },
  )
})