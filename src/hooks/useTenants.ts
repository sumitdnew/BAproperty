// useTenants.ts - Hook for managing tenant data and operations
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Tenant {
  id: string
  first_name: string
  last_name: string
  email: string
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
}

export const useTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError(null)

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
          is_active,
          user_profiles (
            first_name,
            last_name,
            email
          ),
          apartments (
            unit_number,
            floor,
            monthly_rent
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: Tenant[] = data?.map(tenant => ({
        id: tenant.id,
        first_name: tenant.user_profiles?.[0]?.first_name || '',
        last_name: tenant.user_profiles?.[0]?.last_name || '',
        email: tenant.user_profiles?.[0]?.email || '',
        phone: tenant.phone || '',
        dni: tenant.dni || '',
        apartment: tenant.apartments?.[0]?.unit_number || '',
        floor: tenant.apartments?.[0]?.floor || 0,
        monthly_rent: tenant.apartments?.[0]?.monthly_rent || 0,
        lease_start_date: tenant.lease_start_date,
        lease_end_date: tenant.lease_end_date,
        is_active: tenant.is_active,
        emergency_contact_name: tenant.emergency_contact_name || '',
        emergency_contact_phone: tenant.emergency_contact_phone || ''
      })) || []

      setTenants(transformedData)

    } catch (err) {
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