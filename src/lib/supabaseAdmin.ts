// Admin client for server-side operations that require elevated privileges
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for admin client')
}

// Create admin client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-admin-client'
    }
  }
})
