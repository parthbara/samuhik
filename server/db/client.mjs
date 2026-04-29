import { createClient } from '@supabase/supabase-js';
import { config } from '../config.mjs';

// Service role client — bypasses RLS. Never expose this key to the browser.
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false },
});
