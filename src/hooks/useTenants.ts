// useTenants.ts - Hook for managing tenant data and operations
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Tenant {
  id: string
  first_name: string
  last_name: string
  phone: string
  dni: string
  apartment: string
  floor: number
  monthly_rent: number
  lease_start_date: string
  lease_end_date: string
  is_active: boolean
  emergency_contact_name: string
  emergency_contact_phone: string
  deposit_amount: number
}

// Type for the raw Supabase response
interface TenantRaw {
  id: string
  dni: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  lease_start_date: string
  lease_end_date: string
  deposit_amount: number
  is_active: boolean
  user_profiles: {
    first_name: string
    last_name: string
  }[]
  apartments: {
    unit_number: string
    floor: number
    monthly_rent: number
    buildings: {
      name: string
    }[]
  }[]
}

export const useTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching tenants...')

      // Test: Check what tables exist and what data is available
      console.log('Testing database connectivity...')
      
      // Check tenants table
      const { data: tenantsTest, error: tenantsTestError } = await supabase
        .from('tenants')
        .select('count')
        .limit(1)
      
      console.log('Tenants table test:', tenantsTest, tenantsTestError)
      
      // Check user_profiles table
      const { data: userProfilesTest, error: userProfilesTestError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      console.log('User profiles table test:', userProfilesTest, userProfilesTestError)
      
      // Check apartments table
      const { data: apartmentsTest, error: apartmentsTestError } = await supabase
        .from('apartments')
        .select('count')
        .limit(1)
      
      console.log('Apartments table test:', apartmentsTest, apartmentsTestError)

      // First, let's try a simple query to see what's in the tenants table
      const { data: simpleData, error: simpleError } = await supabase
        .from('tenants')
        .select('*')
        .eq('is_active', true)
        .limit(5)

      console.log('Simple tenants query result:', simpleData)
      console.log('Simple tenants query error:', simpleError)

      // Now try the full query
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          id,
          dni,
          phone,
          emergency_contact_name,
          emergency_contact_phone,
          lease_start_date,
          lease_end_date,
          deposit_amount,
          is_active,
          user_profiles!inner (
            first_name,
            last_name
          ),
          apartments!inner (
            unit_number,
            floor,
            monthly_rent,
            buildings (
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      console.log('Full query result:', data)
      console.log('Full query error:', error)

      if (error) throw error

      const transformedData: Tenant[] = (data as TenantRaw[])?.map(tenant => {
        console.log('Processing tenant:', tenant)
        
        const transformed = {
          id: tenant.id,
          first_name: tenant.user_profiles?.[0]?.first_name || 'Unknown',
          last_name: tenant.user_profiles?.[0]?.last_name || 'Unknown',
          phone: tenant.phone || '',
          dni: tenant.dni || '',
          apartment: tenant.apartments?.[0]?.unit_number || 'Unknown',
          floor: tenant.apartments?.[0]?.floor || 0,
          monthly_rent: tenant.apartments?.[0]?.monthly_rent || 0,
          lease_start_date: tenant.lease_start_date,
          lease_end_date: tenant.lease_end_date,
          is_active: tenant.is_active,
          emergency_contact_name: tenant.emergency_contact_name || '',
          emergency_contact_phone: tenant.emergency_contact_phone || '',
          deposit_amount: tenant.deposit_amount || 0
        }
        
        console.log('Transformed tenant:', transformed)
        return transformed
      }) || []

      console.log('Final transformed data:', transformedData)

      setTenants(transformedData)

    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()

    // Set up real-time subscription
    const subscription = supabase
      .channel('tenants')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        () => fetchTenants()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    tenants,
    loading,
    error,
    fetchTenants
  }
}