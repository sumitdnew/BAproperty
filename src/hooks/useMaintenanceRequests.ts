// useMaintenanceRequests.ts - Hook for managing maintenance requests CRUD operations
// hooks/useMaintenanceRequests.ts
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  apartment: string
  tenant_name: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_cost: number
  actual_cost?: number
  created_at: string
  completed_at?: string
}

export const useMaintenanceRequests = (limit?: number) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedBuildingId } = useBuildingContext()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('maintenance_requests')
        .select(`
          id,
          title,
          description,
          apartment,
          priority,
          status,
          estimated_cost,
          actual_cost,
          created_at,
          completed_at
        `)
        .order('created_at', { ascending: false })

      if (selectedBuildingId !== 'all') {
        query = query.eq('building_id', selectedBuildingId)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      const transformedData: MaintenanceRequest[] = data?.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        apartment: request.apartment,
        tenant_name: 'N/A', // Tenant info not available in current schema
        priority: request.priority,
        status: request.status,
        estimated_cost: request.estimated_cost || 0,
        actual_cost: request.actual_cost,
        created_at: request.created_at,
        completed_at: request.completed_at
      })) || []

      setRequests(transformedData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (requestData: Omit<MaintenanceRequest, 'id' | 'created_at' | 'tenant_name'>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert([requestData])
        .select()

      if (error) throw error
      await fetchRequests() // Refresh the list
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create request' }
    }
  }

  const updateRequest = async (id: string, updates: Partial<MaintenanceRequest>) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      await fetchRequests() // Refresh the list
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to update request' }
    }
  }

  useEffect(() => {
    fetchRequests()

    // Set up real-time subscription
    const subscription = supabase
      .channel('maintenance_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => fetchRequests()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [limit, selectedBuildingId])

  return {
    requests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequest
  }
}
