import { Reasoning } from "./types";

export const defaultModel = "openai/gpt-oss-120b";

export const recommendedModels = [
	"llama-3.1-8b-instant",
	"llama-3.3-70b-versatile",
	"openai/gpt-oss-120b",
	"openai/gpt-oss-20b",
	"whisper-large-v3",
	"whisper-large-v3-turbo",
	"groq/compound",
	"groq/compound-mini",
];

export const reasonings: Reasoning[] = [
	"low",
	"medium",
	"high",
]

export const reasoningModels = [
	"openai/gpt-oss-120b",
	"openai/gpt-oss-20b",
] satisfies typeof recommendedModels;
