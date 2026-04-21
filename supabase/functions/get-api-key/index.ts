import '@supabase/functions-js/edge-runtime.d.ts'
import type { GetApiKey } from '@types'

Deno.serve(async () => {
	const key = Deno.env.get('API_KEY')
	if (typeof key !== 'string') return new Response('missing key', { status: 500 })

	return new Response(
		JSON.stringify({ key } satisfies GetApiKey),
		{ headers: { 'Content-Type': 'application/json' } }
	)
})