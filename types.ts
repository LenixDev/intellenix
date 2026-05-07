import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'groq-sdk/resources/chat/completions.mjs'
import type { CompletionUsage, ModelListResponse } from 'groq-sdk/resources'
import type { LIMITS } from './constants'
import { PostgrestError } from '@supabase/supabase-js'
import { APIPromise } from 'groq-sdk';

export type GetKey = string | { error: PostgrestError['message'] }

export type SupaKeyArgs = {
	type: 'get'
} | {
	type: 'protect'
	key: string
}

export interface SupaList {
	fn: ModelListResponse | { error: PostgrestError['message'] }
	args: {
		id: string
	}
}

export type SupaProtect = string | { error: PostgrestError['message'] }

export type Conversation =
	| {
		date: string
		role: 'assistant'
		content: string
		service_tier?: ChatCompletion['service_tier']
		usage?: {
			completion_tokens: CompletionUsage['completion_tokens']
			prompt_tokens: CompletionUsage['prompt_tokens']
			queue_time?: CompletionUsage['queue_time']
			total_tokens: CompletionUsage['total_tokens']
		}
	}
	| {
		date: string
		role: 'user'
		content: string
		completion_tokens: string | CompletionUsage['completion_tokens']
	}

export type Model = keyof typeof LIMITS

export type Quota = Record<Model, DailyQuota>

export type KeysQuota = Record<string, Partial<Quota>>

export type Key = 'key' | 'model' | 'id' | 'quota'
export type Task = 'programming' | 'health'

export type DailyQuotaFunction =
	| DailyQuota
	| {
		error: PostgrestError['message']
	}

export interface DailyQuota {
	rpd: number
	tpd: number
}

interface QuotaBaseFunction {
	key: string
	model: Model
}

export type QuotaFunction =
	| ({
		type: 'get'
	} & QuotaBaseFunction)
	| ({
		type: 'consume'
		tokens: number
	} & QuotaBaseFunction)

export type GroqFn = {
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
} | { error: PostgrestError['message'] }

export interface GroqParams {
	params: ChatCompletionCreateParamsNonStreaming
	id: string
	key?: string
}
