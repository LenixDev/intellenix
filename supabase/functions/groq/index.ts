import "@supabase/functions-js/edge-runtime.d.ts";
import { init, supabase } from "../__shared/index.ts";
import type { SupaGroq } from "../../../types.ts";
import Groq from "groq-sdk";

Deno.serve(async (req) => {
  const [success, res] = init(req);
  if (!success) return res;

  const { key, id, params } = (await req.json()) as SupaGroq['args'];

  let apiKey = key;
  if (!key) {
    const { error, data } = await supabase
      .from("quota")
      .select("api_key")
      .eq("id", id)
      .limit(1)
      .single<{ api_key: string }>();
    if (error) {
      return new Response(
        JSON.stringify(error),
        {
					headers: res,
					status: 400
				},
      );
    }

    apiKey = data.api_key;
  }

  try {
    const { response: { headers }, ...result } = await new Groq({ apiKey }).chat
      .completions
      .create(params)
      .withResponse();

    const rateLimits = {
      retry_after: headers.get("retry-after"),
      limit_requests: headers.get("x-ratelimit-limit-requests"),
      limit_tokens: headers.get("x-ratelimit-limit-tokens"),
      remaining_requests: headers.get("x-ratelimit-remaining-requests"),
      remaining_tokens: headers.get("x-ratelimit-remaining-tokens"),
      reset_requests: headers.get("x-ratelimit-reset-requests"),
      reset_tokens: headers.get("x-ratelimit-reset-tokens"),
    };

    return new Response(
      JSON.stringify({ data: result.data, rateLimits } satisfies SupaGroq['return']),
      { headers: res },
    );
  } catch (err) {
    return new Response(
      JSON.stringify(err),
      {
        headers: res,
        status: 400,
      },
    );
  }
});
