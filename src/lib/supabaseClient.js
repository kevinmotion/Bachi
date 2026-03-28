import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined';

if (!isConfigured) {
  console.warn('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

// Dummy client to satisfy TypeScript and prevent crashes when not configured
const dummyClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'Supabase no configurado' } }),
    signUp: () => Promise.resolve({ data: {}, error: { message: 'Supabase no configurado' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
        order: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
      }),
      order: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
    }),
    upsert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
        }),
      }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: { message: 'Supabase no configurado', code: 'DUMMY' } }),
    }),
  }),
};

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : dummyClient;
