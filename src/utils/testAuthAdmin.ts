// Test script to verify Supabase Admin client configuration
import { supabaseAdmin } from '../lib/supabaseAdmin'

export const testAuthAdmin = async () => {
  console.log('🔍 Testing Supabase Admin client configuration...')
  
  // Check if service role key is configured
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is not configured')
    return false
  }
  
  console.log('✅ Service role key is configured')
  
  try {
    // Test admin client by trying to list users (this requires admin privileges)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Admin client test failed:', error.message)
      return false
    }
    
    console.log('✅ Admin client is working correctly')
    console.log(`📊 Found ${data.users.length} users in auth.users table`)
    return true
  } catch (err) {
    console.error('❌ Admin client test failed:', err)
    return false
  }
}

// Test function to create a test user
export const testCreateUser = async (email: string, firstName: string, lastName: string) => {
  console.log('🧪 Testing user creation...')
  
  try {
    const tempPassword = `TestPass${Math.random().toString(36).substr(2, 8)}!`
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        user_type: 'tenant',
        first_name: firstName,
        last_name: lastName
      }
    })
    
    if (error) {
      console.error('❌ User creation test failed:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Test user created successfully:', data.user?.id)
    return { success: true, userId: data.user?.id, tempPassword }
  } catch (err) {
    console.error('❌ User creation test failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

