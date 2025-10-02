import { supabase } from '../lib/supabase';

export interface TenantCreationTest {
  success: boolean;
  error?: string;
  tenantId?: string;
}

export const testTenantCreation = async (
  userId: string,
  apartmentId: string
): Promise<TenantCreationTest> => {
  try {
    console.log('🧪 Testing tenant creation...');
    console.log('User ID:', userId);
    console.log('Apartment ID:', apartmentId);

    // First, check if user exists in user_profiles
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ User profile not found:', userError);
      return { success: false, error: 'User profile not found' };
    }

    console.log('✅ User profile found:', userProfile);

    // Check if apartment exists
    const { data: apartment, error: apartmentError } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', apartmentId)
      .single();

    if (apartmentError) {
      console.error('❌ Apartment not found:', apartmentError);
      return { success: false, error: 'Apartment not found' };
    }

    console.log('✅ Apartment found:', apartment);

    // Try to create tenant record
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        user_id: userId,
        apartment_id: apartmentId,
        dni: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        lease_start_date: new Date().toISOString().split('T')[0],
        lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        deposit_amount: 0,
        is_active: true
      })
      .select()
      .single();

    if (tenantError) {
      console.error('❌ Tenant creation failed:', tenantError);
      return { success: false, error: tenantError.message };
    }

    console.log('✅ Tenant created successfully:', tenantData);

    // Try to mark apartment as occupied
    const { error: apartmentUpdateError } = await supabase
      .from('apartments')
      .update({ is_occupied: true })
      .eq('id', apartmentId);

    if (apartmentUpdateError) {
      console.error('❌ Failed to mark apartment as occupied:', apartmentUpdateError);
      return { success: false, error: 'Failed to mark apartment as occupied' };
    }

    console.log('✅ Apartment marked as occupied');

    return { success: true, tenantId: tenantData.id };
  } catch (error: any) {
    console.error('❌ Unexpected error during tenant creation test:', error);
    return { success: false, error: error.message };
  }
};

export const testTenantRetrieval = async (userId: string): Promise<any> => {
  try {
    console.log('🧪 Testing tenant retrieval...');
    
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        *,
        apartments (
          *,
          buildings (*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (tenantError) {
      console.error('❌ Tenant retrieval failed:', tenantError);
      return { success: false, error: tenantError.message };
    }

    console.log('✅ Tenant retrieved successfully:', tenantData);
    return { success: true, data: tenantData };
  } catch (error: any) {
    console.error('❌ Unexpected error during tenant retrieval test:', error);
    return { success: false, error: error.message };
  }
};

