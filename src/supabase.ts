import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABSE_URL ?? "";
const supabaseAnonKey = process.env.SUPABSE_ANON_KEY ?? "";

export const database = createClient(supabaseUrl, supabaseAnonKey);
