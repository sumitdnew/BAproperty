// Test utility to debug signup issues
import { supabase } from '../lib/supabase'

export const testSignup = async (email: string, password: string, firstName: string, lastName: string) => {
  console.log('🧪 Testing signup process...')
  
  try {
    // Test 1: Check if we can create a user
    console.log('🔄 Step 1: Testing user creation...')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: 'tenant'
        }
      }
    })

    if (signUpError) {
      console.error('❌ Signup failed:', signUpError)
      return { success: false, error: signUpError.message }
    }

    console.log('✅ User created successfully:', authData.user?.id)

    // Test 2: Check if we can create user profile
    if (authData.user) {
      console.log('🔄 Step 2: Testing user profile creation...')
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          user_type: 'tenant',
          first_name: firstName,
          last_name: lastName
        })

      if (profileError) {
        console.error('❌ User profile creation failed:', profileError)
        return { 
          success: false, 
          error: `User created but profile failed: ${profileError.message}`,
          userId: authData.user.id
        }
      }

      console.log('✅ User profile created successfully')
    }

    return { success: true, userId: authData.user?.id }
  } catch (err) {
    console.error('❌ Test failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export const testDatabaseAccess = async () => {
  console.log('🔍 Testing database access...')
  
  try {
    // Test user_profiles table access
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ user_profiles access failed:', profilesError)
      return false
    }
    
    console.log('✅ user_profiles access OK')
    
    // Test tenants table access
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('count')
      .limit(1)
    
    if (tenantsError) {
      console.error('❌ tenants access failed:', tenantsError)
      return false
    }
    
    console.log('✅ tenants access OK')
    
    // Test invitations table access
    const { data: invitations, error: invitationsError } = await supabase
      .from('invitations')
      .select('count')
      .limit(1)
    
    if (invitationsError) {
      console.error('❌ invitations access failed:', invitationsError)
      return false
    }
    
    console.log('✅ invitations access OK')
    
    return true
  } catch (err) {
    console.error('❌ Database access test failed:', err)
    return false
  }
}

