import '@supabase/functions-js/edge-runtime.d.ts'
import type { GetApiKey } from '@types'
import { init } from 'init'


Deno.serve(req => {
	const [success, res] = init(req)
	if (!success) return res
	
	const key = Deno.env.get('API_KEY')
	if (typeof key !== 'string') return new Response('missing key', { status: 500 })

	return new Response(
		JSON.stringify({ key } satisfies GetApiKey),
		{ headers: { ...res, 'Content-Type': 'application/json' } }
	)
})
