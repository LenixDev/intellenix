import { PostgrestError } from "@supabase/supabase-js";
import { ModelListResponse } from "groq-sdk/resources";
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions.mjs";

export interface SupaKey {
	return: string
	args:
		| { type: 'getById'; id: string }
		| { type: 'usePublic' }
		| { type: 'protect'; key: string }
		| { type: 'update'; key: string; id: string }
		| { type: 'public'; id: string | undefined | null }
}

export interface SupaGroq {
	return: {
		data: ChatCompletion
		rateLimits: {
			retry_after: string | null
			limit_requests: string | null
			limit_tokens: string | null
			remaining_requests: string | null
			remaining_tokens: string | null
			reset_requests: string | null
			reset_tokens: string | null
		}
	}
	args: {
		key: string
		params: ChatCompletionCreateParamsNonStreaming
		id: string
	}
}

export interface SupaList {
	return: ModelListResponse
	args: { id: string }
}

export interface SupaPrompt {
	return: string
	args: { type: 'get' } | { type: 'update'; prompt: string }
}
