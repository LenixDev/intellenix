import type {
	ChatCompletion,
	ChatCompletionCreateParamsBase,
	ChatCompletionCreateParamsNonStreaming,
} from "groq-sdk/resources/chat/completions.mjs";
import type { CompletionUsage, ModelListResponse } from "groq-sdk/resources";
import { PostgrestError } from "@supabase/supabase-js";

export type GetKey = string
export interface SupaKey {
	return: string
}
export type SupaPublic = string;
export type SupaProtect = string | { error: PostgrestError["message"] };
export type KeysQuota = Record<string, Quota>;
export type Model = string;
export type SupaKeyArgs =
	| { type: "usePublic" }
	| { type: "protect"; key: string }
	| { type: "update"; key: string; id: string }
	| { type: "public"; id: string | undefined | null };

export type Conversation =
	| {
		date: string;
		role: "assistant";
		content: string;
		service_tier?: ChatCompletion["service_tier"];
		usage?: {
			completion_tokens: CompletionUsage["completion_tokens"];
			prompt_tokens: CompletionUsage["prompt_tokens"];
			queue_time?: CompletionUsage["queue_time"];
			total_tokens: CompletionUsage["total_tokens"];
		};
	}
	| {
		date: string;
		role: "user";
		content: string;
		completion_tokens: string | CompletionUsage["completion_tokens"];
	};

export type Quota = Record<
	Model,
	{ rpd: string; tpm: string; r_limits: string; t_limits: string }
>;

export type Key =
	| "key"
	| "model"
	| "id"
	| "quota"
	| "auto-complete"
	| "auto-correct"
	| "message"
	| 'country'
	| 'reasoning'

export type Reasoning = ChatCompletionCreateParamsBase['reasoning_effort']

export interface SupaGroq {
	return: {
		data: ChatCompletion;
		rateLimits: {
			retry_after: string | null;
			limit_requests: string | null;
			limit_tokens: string | null;
			remaining_requests: string | null;
			remaining_tokens: string | null;
			reset_requests: string | null;
			reset_tokens: string | null;
		};
	}
	args: {
		key: string;
		params: ChatCompletionCreateParamsNonStreaming;
		id: string;
	};
}

export type S<T> = React.Dispatch<React.SetStateAction<T>>;

export interface SupaList {
	fn: ModelListResponse | { error: PostgrestError["message"] };
	args: { id: string };
}

export interface SupaPrompt {
	return: string | PostgrestError;
	args: { type: "get" } | { type: "update"; prompt: string };
}
