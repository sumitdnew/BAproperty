// Utility to test database schema and migrations
import { supabase } from '../lib/supabase'

export const testDatabaseSchema = async () => {
  console.log('🔍 Testing database schema...')
  
  try {
    // Test invitations table
    const { data: invitationsTest, error: invitationsError } = await supabase
      .from('invitations')
      .select('id, email, auth_user_id, building_id, apartment_id, invitation_type')
      .limit(1)
    
    if (invitationsError) {
      console.error('❌ Invitations table test failed:', invitationsError)
      return false
    }
    console.log('✅ Invitations table schema OK')
    
    // Test tenants table
    const { data: tenantsTest, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, user_id, apartment_id, deposit_amount, is_active')
      .limit(1)
    
    if (tenantsError) {
      console.error('❌ Tenants table test failed:', tenantsError)
      return false
    }
    console.log('✅ Tenants table schema OK')
    
    // Test apartments table
    const { data: apartmentsTest, error: apartmentsError } = await supabase
      .from('apartments')
      .select('id, building_id, unit_number, monthly_rent, is_occupied')
      .limit(1)
    
    if (apartmentsError) {
      console.error('❌ Apartments table test failed:', apartmentsError)
      return false
    }
    console.log('✅ Apartments table schema OK')
    
    console.log('🎉 All database schema tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Database schema test failed:', error)
    return false
  }
}








