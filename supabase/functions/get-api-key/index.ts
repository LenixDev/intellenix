import '@supabase/functions-js/edge-runtime.d.ts'
import type { GetApiKey } from '@types'

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*'
}

Deno.serve(req => {
	if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
	const key = Deno.env.get('API_KEY')
	if (typeof key !== 'string') return new Response('missing key', { status: 500 })

	return new Response(
		JSON.stringify({ key } satisfies GetApiKey),
		{ headers: { ...CORS, 'Content-Type': 'application/json' } }
	)
})
