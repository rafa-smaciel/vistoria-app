import { createClient } from '@supabase/supabase-js';

export const VISTORIA_SUPABASE_URL = 'https://cxlzhmelcvjubebvfchf.supabase.co';
export const VISTORIA_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHpobWVsY3ZqdWJlYnZmY2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODkzNTcsImV4cCI6MjA5MDA2NTM1N30.nlIsM-pMzMYq7s3XdF894AAdGUU3zs86hrCrudtcUBA';

export const supabase = createClient(VISTORIA_SUPABASE_URL, VISTORIA_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: typeof window !== 'undefined',
    detectSessionInUrl: typeof window !== 'undefined',
    storageKey: 'vistoria-demo-auth',
  },
});

export default supabase;
