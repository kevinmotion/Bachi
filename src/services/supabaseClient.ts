import { createClient } from '@supabase/supabase-js';

// WARNING: This client should only be used on the server to avoid exposing keys.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
