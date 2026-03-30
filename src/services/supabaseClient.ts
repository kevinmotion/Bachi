import { createClient } from '@supabase/supabase-js';

// Helper to get env vars safely
const getEnv = (key: string) => {
  // Vite (browser)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`];
  }
  // Node (server)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return null;
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Dummy client to prevent crashes if keys are missing
const dummyClient = {
  from: () => ({
    select: () => ({ 
      eq: () => ({ data: null, error: new Error('Supabase not configured') }), 
      order: () => ({ data: null, error: new Error('Supabase not configured') }) 
    }),
    insert: () => ({ select: () => ({ data: null, error: new Error('Supabase not configured') }) }),
    update: () => ({ eq: () => ({ select: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
    delete: () => ({ eq: () => ({ error: new Error('Supabase not configured') }) }),
  }),
  auth: {
    getSession: () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
    signOut: () => ({ error: new Error('Supabase not configured') }),
    signInWithPassword: () => ({ error: new Error('Supabase not configured') }),
    signUp: () => ({ error: new Error('Supabase not configured') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getUser: () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
    updateUser: () => ({ error: new Error('Supabase not configured') }),
  }
};

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : dummyClient;
