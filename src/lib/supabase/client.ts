import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from './config';

export const createClient = () => {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
};
