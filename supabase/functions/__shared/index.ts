const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': '*'
}

export const init = (req: Request): [false, Response] | [true, typeof CORS] => {
	if (req.method === 'OPTIONS') return [false, new Response(null, { headers: CORS })]
	return [true, CORS]
}
