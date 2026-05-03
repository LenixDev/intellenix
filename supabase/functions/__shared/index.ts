import { createClient } from 'jsr:@supabase/supabase-js@2'

export const init = (
	req: Request
): [false, Response] | [true, Record<string, string>] => {
	if (req.method === 'OPTIONS')
		return [
			false,
			new Response('ok', {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*'
				}
			})
		]
	return [
		true,
		{
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*',
			'Content-Type': 'application/json'
		}
	]
}

export const supabase = createClient(
	Deno.env.get('SUPABASE_URL')!,
	Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
