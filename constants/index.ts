/* eslint-disable @stylistic/max-len */
import type { Model } from '@/types'

export const defaultModel = 'llama-3.3-70b-versatile' as const satisfies Model

export const LIMITS = {
	'allam-2-7b': {
		rpm: 30,
		rpd: 7_000,
		tpm: 6_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'canopylabs/orpheus-arabic-saudi': {
		rpm: 10,
		rpd: 100,
		tpm: 1_200,
		tpd: 3_600,
		ash: 0,
		asd: 0,
	},
	'canopylabs/orpheus-v1-english': {
		rpm: 10,
		rpd: 100,
		tpm: 1_200,
		tpd: 3_600,
		ash: 0,
		asd: 0,
	},
	'groq/compound': {
		rpm: 30,
		rpd: 250,
		tpm: 70_000,
		tpd: Infinity,
		ash: 0,
		asd: 0
	},
	'groq/compound-mini': {
		rpm: 30,
		rpd: 250,
		tpm: 70_000,
		tpd: 0,
		ash: 0,
		asd: 0,
	},
	'llama-3.1-8b-instant': {
		rpm: 30,
		rpd: 14_400,
		tpm: 6_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'llama-3.3-70b-versatile': {
		rpm: 30,
		rpd: 1_000,
		tpm: 12_000,
		tpd: 100_000,
		ash: 0,
		asd: 0,
	},
	'meta-llama/llama-4-scout-17b-16e-instruct': {
		rpm: 30,
		rpd: 1_000,
		tpm: 30_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'meta-llama/llama-prompt-guard-2-22m': {
		rpm: 30,
		rpd: 14_400,
		tpm: 15_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'meta-llama/llama-prompt-guard-2-86m': {
		rpm: 30,
		rpd: 14_400,
		tpm: 15_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'openai/gpt-oss-120b': {
		rpm: 30,
		rpd: 1_000,
		tpm: 8_000,
		tpd: 200_000,
		ash: 0,
		asd: 0,
	},
	'openai/gpt-oss-20b': {
		rpm: 30,
		rpd: 1_000,
		tpm: 8_000,
		tpd: 200_000,
		ash: 0,
		asd: 0,
	},
	'openai/gpt-oss-safeguard-20b': {
		rpm: 30,
		rpd: 1_000,
		tpm: 8_000,
		tpd: 200_000,
		ash: 0,
		asd: 0,
	},
	'qwen/qwen3-32b': {
		rpm: 60,
		rpd: 1_000,
		tpm: 6_000,
		tpd: 500_000,
		ash: 0,
		asd: 0,
	},
	'whisper-large-v3': {
		rpm: 20,
		rpd: 2_000,
		tpm: 0,
		tpd: 0,
		ash: 7_200,
		asd: 28_800,
	},
	'whisper-large-v3-turbo': {
		rpm: 20,
		rpd: 2_000,
		tpm: 0,
		tpd: 0,
		ash: 7_200,
		asd: 28_800,
	},
} as const satisfies Record<
	string,
	{
		rpm: number
		rpd: number
		tpm: number
		tpd: number
		ash: number
		asd: number
	}
>
