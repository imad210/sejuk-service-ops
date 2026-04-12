import { createClient } from "@supabase/supabase-js";

const isTest = import.meta.env.MODE === "test";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? (isTest ? "https://example.supabase.co" : undefined);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? (isTest ? "test-anon-key" : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
