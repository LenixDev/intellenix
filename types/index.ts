import type {
	ChatCompletion,
	ChatCompletionCreateParamsBase,
} from 'groq-sdk/resources/chat/completions.mjs'
import type { CompletionUsage } from 'groq-sdk/resources'

export type S<T> = React.Dispatch<React.SetStateAction<T>>

export type Key =
	| 'key'
	| 'model'
	| 'id'
	| 'quota'
	| 'auto-complete'
	| 'auto-correct'
	| 'message'
	| 'country'
	| 'reasoning'
	| 'randomness'

export type Model = string
export type Reasoning = ChatCompletionCreateParamsBase['reasoning_effort']

export type KeysQuota = Record<
	string,
	Record<
		Model,
		{ rpd: string; tpm: string; r_limits: string; t_limits: string }
	>
>

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
