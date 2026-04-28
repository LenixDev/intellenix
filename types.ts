import type { ChatCompletion } from 'groq-sdk/resources/chat/completions.mjs'
import type { CompletionUsage } from 'groq-sdk/resources'
import type { LIMITS } from './constants'

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

export interface UpdateReplyQuota<T = CompletionUsage['total_tokens']> {
	tokens: CompletionUsage['total_tokens'] | T
	key: string
	model: Model
	type: 'update' | 'get'
}

export type Quota = Record<Model, {
	rpd: number
	tpd: number
}>

export type UpdateQuota = Partial<Quota>

export type KeysQuota = Record<string, UpdateQuota>

export type Key = 'key' | 'model'
export type Task = 'programming' | 'health'
