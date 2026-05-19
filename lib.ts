import { FunctionsHttpError } from "@supabase/supabase-js";

export const supaError = async (error: FunctionsHttpError) => (await error.context.json()).error.error.message