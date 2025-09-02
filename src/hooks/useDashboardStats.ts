// useDashboardStats.ts - Hook for fetching and managing dashboard statistics
// hooks/useDashboardStats.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DashboardStats {
  totalApartments: number
  occupiedApartments: number
  totalRequests: number
  totalTenants: number
  totalIncome: number
  monthlyIncome: number
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalApartments: 0,
    occupiedApartments: 0,
    totalRequests: 0,
    totalTenants: 0,
    totalIncome: 0,
    monthlyIncome: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Parallel fetch for better performance
      const [apartmentRes, maintenanceRes, tenantRes, monthlyPaymentRes, totalPaymentRes] = await Promise.all([
        supabase.from('apartments').select('id, is_occupied'),
        supabase.from('maintenance_requests').select('id').in('status', ['pending', 'in_progress']),
        supabase.from('tenants').select('id').eq('is_active', true),
        supabase.from('payments').select('amount').eq('status', 'completed')
          .gte('paid_date', new Date().toISOString().substring(0, 7) + '-01'),
        supabase.from('payments').select('amount').eq('status', 'completed')
      ])

      // Check for errors
      if (apartmentRes.error) throw apartmentRes.error
      if (maintenanceRes.error) throw maintenanceRes.error
      if (tenantRes.error) throw tenantRes.error
      if (monthlyPaymentRes.error) throw monthlyPaymentRes.error
      if (totalPaymentRes.error) throw totalPaymentRes.error

      const totalApartments = apartmentRes.data?.length || 0
      const occupiedApartments = apartmentRes.data?.filter(apt => apt.is_occupied).length || 0
      const totalRequests = maintenanceRes.data?.length || 0
      const totalTenants = tenantRes.data?.length || 0
      const monthlyIncome = monthlyPaymentRes.data?.reduce((sum, p) => sum + p.amount, 0) || 0
      const totalIncome = totalPaymentRes.data?.reduce((sum, p) => sum + p.amount, 0) || 0

      setStats({
        totalApartments,
        occupiedApartments,
        totalRequests,
        totalTenants,
        totalIncome,
        monthlyIncome
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}
