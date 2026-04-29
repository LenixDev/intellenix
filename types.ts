import type { ChatCompletion } from 'groq-sdk/resources/chat/completions.mjs'
import type { CompletionUsage } from 'groq-sdk/resources'
import type { LIMITS } from './constants'
import { PostgrestError } from '@supabase/supabase-js'

export interface GetKey {
	key: string
}

export type Conversation = {
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
} | {
	date: string
	role: 'user'
	content: string
	completion_tokens:
		| 'calculating...'
		| CompletionUsage['completion_tokens']
		| 'failed!'
}

export type Model = keyof typeof LIMITS

export type Quota = Record<Model, DailyQuota>

export type KeysQuota = Record<string, Partial<Quota>>

export type Key = 'key' | 'model'
export type Task = 'programming' | 'health'

export type DailyQuotaFunction = DailyQuota | {
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

export type QuotaFunction = {
	type: 'get'
} & QuotaBaseFunction | {
	type: 'consume'
	tokens: number
} & QuotaBaseFunction
