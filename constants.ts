import { Reasoning } from "./types"

export const defaultModel = 'llama-3.3-70b-versatile' as const

export const recommendedModels = [
	'llama-3.1-8b-instant',
	'llama-3.3-70b-versatile',
	'openai/gpt-oss-120b',
	'openai/gpt-oss-20b',
	'whisper-large-v3',
	'whisper-large-v3-turbo',
	'groq/compound',
	'groq/compound-mini'
]

export const reasonings: readonly Reasoning[] = [
	'none',
	'low',
	'medium',
	'high',
	'default'
]
