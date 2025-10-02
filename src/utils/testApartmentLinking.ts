// Test utility to verify apartment linking works correctly
import { supabase } from '../lib/supabase'

export const testApartmentLinking = async (email: string) => {
  console.log('🔍 Testing apartment linking for email:', email)
  
  try {
    // 1. Find the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('id, apartment_id, building_id, status')
      .eq('email', email)
      .single()
    
    if (inviteError) {
      console.error('❌ Failed to find invitation:', inviteError)
      return false
    }
    
    console.log('✅ Found invitation:', invitation)
    
    // 2. Find the tenant record
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, user_id, apartment_id, is_active')
      .eq('apartment_id', invitation.apartment_id)
      .single()
    
    if (tenantError) {
      console.error('❌ Failed to find tenant record:', tenantError)
      return false
    }
    
    console.log('✅ Found tenant record:', tenant)
    
    // 3. Find the apartment
    const { data: apartment, error: apartmentError } = await supabase
      .from('apartments')
      .select('id, unit_number, floor, building_id, is_occupied')
      .eq('id', invitation.apartment_id)
      .single()
    
    if (apartmentError) {
      console.error('❌ Failed to find apartment:', apartmentError)
      return false
    }
    
    console.log('✅ Found apartment:', apartment)
    
    // 4. Find the building
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('id', invitation.building_id)
      .single()
    
    if (buildingError) {
      console.error('❌ Failed to find building:', buildingError)
      return false
    }
    
    console.log('✅ Found building:', building)
    
    // 5. Check if user profile exists (if user_id is not null)
    if (tenant.user_id) {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_type, first_name, last_name')
        .eq('id', tenant.user_id)
        .single()
      
      if (profileError) {
        console.error('❌ Failed to find user profile:', profileError)
        return false
      }
      
      console.log('✅ Found user profile:', userProfile)
    }
    
    console.log('🎉 All apartment linking tests passed!')
    console.log('📋 Summary:')
    console.log(`   - Invitation: ${invitation.status}`)
    console.log(`   - Tenant: ${tenant.user_id ? 'Linked to user' : 'Not linked yet'} (Active: ${tenant.is_active})`)
    console.log(`   - Apartment: ${apartment.unit_number} (Occupied: ${apartment.is_occupied})`)
    console.log(`   - Building: ${building.name}`)
    
    // Check if the logic is correct
    if (invitation.status === 'sent' && !apartment.is_occupied) {
      console.log('✅ Correct: Apartment not occupied while invitation is pending')
    } else if (invitation.status === 'accepted' && apartment.is_occupied) {
      console.log('✅ Correct: Apartment occupied after invitation accepted')
    } else {
      console.log('⚠️ Check: Apartment occupancy status may need review')
    }
    
    return true
  } catch (err) {
    console.error('❌ Test failed:', err)
    return false
  }
}

// Test function to simulate the signup process
export const simulateSignupProcess = async (email: string, userId: string) => {
  console.log('🧪 Simulating signup process for:', email, 'with user ID:', userId)
  
  try {
    // 1. Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('id, apartment_id')
      .eq('email', email)
      .eq('status', 'sent')
      .single()
    
    if (inviteError) {
      console.error('❌ Failed to find invitation:', inviteError)
      return false
    }
    
    // 2. Update invitation
    const { error: updateInviteError } = await supabase
      .from('invitations')
      .update({
        auth_user_id: userId,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)
    
    if (updateInviteError) {
      console.error('❌ Failed to update invitation:', updateInviteError)
      return false
    }
    
    // 3. Update tenant record
    const { error: updateTenantError } = await supabase
      .from('tenants')
      .update({
        user_id: userId,
        is_active: true
      })
      .eq('apartment_id', invitation.apartment_id)
      .eq('user_id', null)
    
    if (updateTenantError) {
      console.error('❌ Failed to update tenant record:', updateTenantError)
      return false
    }
    
    // 4. Mark apartment as occupied
    const { error: updateApartmentError } = await supabase
      .from('apartments')
      .update({ is_occupied: true })
      .eq('id', invitation.apartment_id)
    
    if (updateApartmentError) {
      console.error('❌ Failed to mark apartment as occupied:', updateApartmentError)
      return false
    }
    
    console.log('✅ Signup simulation completed successfully!')
    return true
  } catch (err) {
    console.error('❌ Signup simulation failed:', err)
    return false
  }
}
