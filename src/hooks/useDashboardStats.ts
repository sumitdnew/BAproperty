// useDashboardStats.ts - Hook for fetching and managing dashboard statistics
// hooks/useDashboardStats.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'

interface DashboardStats {
  totalApartments: number
  occupiedApartments: number
  totalRequests: number
  totalTenants: number
  totalIncome: number
  monthlyIncome: number
}

export const useDashboardStats = () => {
  const { selectedBuildingId } = useBuildingContext()
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
      // Not used by UI right now, leaving this hook for parity; if used, mirror Dashboard.tsx
      let apartmentQuery = supabase
        .from('apartments')
        .select('id, is_occupied, unit_number')
      if (selectedBuildingId !== 'all') {
        apartmentQuery = apartmentQuery.eq('building_id', selectedBuildingId)
      }
      const apartmentRes = await apartmentQuery

      const maintenanceBase = supabase
        .from('maintenance_requests')
        .select('id, apartment, status')
        .in('status', ['pending', 'in_progress'])

      let maintenanceRes
      if (selectedBuildingId !== 'all') {
        const units = (apartmentRes.data || []).map((a: any) => a.unit_number).filter(Boolean)
        maintenanceRes = units.length > 0 ? await maintenanceBase.in('apartment', units) : { data: [], error: null }
      } else {
        maintenanceRes = await maintenanceBase
      }

      let tenantQuery = supabase
        .from('tenants')
        .select('id, apartments!inner ( building_id )')
        .eq('is_active', true)
      if (selectedBuildingId !== 'all') {
        tenantQuery = tenantQuery.eq('apartments.building_id', selectedBuildingId)
      }
      const tenantRes = await tenantQuery

      const month = new Date().toISOString().substring(0, 7)
      let monthlyPaymentQuery = supabase
        .from('payments')
        .select('amount, apartments!inner ( building_id )')
        .eq('status', 'completed')
        .gte('paid_date', `${month}-01`)
      if (selectedBuildingId !== 'all') {
        monthlyPaymentQuery = monthlyPaymentQuery.eq('apartments.building_id', selectedBuildingId)
      }
      const monthlyPaymentRes = await monthlyPaymentQuery

      let totalPaymentQuery = supabase
        .from('payments')
        .select('amount, apartments!inner ( building_id )')
        .eq('status', 'completed')
      if (selectedBuildingId !== 'all') {
        totalPaymentQuery = totalPaymentQuery.eq('apartments.building_id', selectedBuildingId)
      }
      const totalPaymentRes = await totalPaymentQuery

      // Check for errors
      if (apartmentRes.error) throw apartmentRes.error
      if (maintenanceRes.error) throw maintenanceRes.error
      if (tenantRes.error) throw tenantRes.error
      if (monthlyPaymentRes.error) throw monthlyPaymentRes.error
      if (totalPaymentRes.error) throw totalPaymentRes.error

      const totalApartments = (apartmentRes.data as any[] | null)?.length || 0
      const occupiedApartments = ((apartmentRes.data as any[] | null) || []).filter((apt: any) => apt.is_occupied).length || 0
      const totalRequests = (maintenanceRes.data as any[] | null)?.length || 0
      const totalTenants = (tenantRes.data as any[] | null)?.length || 0
      const monthlyIncome = ((monthlyPaymentRes.data as any[] | null) || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
      const totalIncome = ((totalPaymentRes.data as any[] | null) || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0

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
  }, [selectedBuildingId])

  return { stats, loading, error, refetch: fetchStats }
}
