// usePayments.ts - Hook for managing payment operations and tracking
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'

interface Payment {
  id: string
  tenant_name: string
  apartment: string
  amount: number
  currency: string
  payment_type: 'rent' | 'deposit' | 'utilities' | 'maintenance' | 'other'
  payment_method: 'bank_transfer' | 'cash' | 'check' | 'credit_card' | 'debit_card'
  status: 'pending' | 'completed' | 'failed' | 'overdue'
  due_date: string
  paid_date?: string
  description: string
  reference_number?: string
  created_at: string
  // Payment submission fields
  proof_url?: string
  submitted_by?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  submission_status?: 'pending' | 'approved' | 'rejected'
  building_id?: string
  tenant_id?: string
  unit_number?: string
  updated_at?: string
}

export const usePayments = (limit?: number, dateRange?: { start: string; end: string }) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedBuildingId } = useBuildingContext()

  const fetchPayments = async () => {
    try {
      console.log('Fetching payments for building:', selectedBuildingId)
      setLoading(true)
      setError(null)

      // First, get apartment IDs for the selected building if not 'all'
      let apartmentIds: string[] = []
      if (selectedBuildingId !== 'all') {
        const { data: apartmentsData, error: apartmentsError } = await supabase
          .from('apartments')
          .select('id')
          .eq('building_id', selectedBuildingId)

        if (apartmentsError) {
          console.error('Error fetching apartments:', apartmentsError)
          throw apartmentsError
        }

        apartmentIds = apartmentsData?.map(apt => apt.id) || []
        console.log('Apartment IDs for building:', apartmentIds)
      }

      // Now fetch payments
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      // Filter by apartment IDs if we have them
      if (apartmentIds.length > 0) {
        query = query.in('apartment_id', apartmentIds)
      }

      // Filter by date range if provided
      if (dateRange) {
        query = query
          .gte('due_date', dateRange.start)
          .lte('due_date', dateRange.end)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      console.log('Payments query result:', { data, error })
      console.log('First payment data:', data?.[0])

      if (error) {
        console.error('Payments query error:', error)
        throw error
      }

      // Now fetch tenant and apartment info for each payment
      const transformedData: Payment[] = []
      for (const payment of data || []) {
        // Fetch tenant info
        const { data: tenantData } = await supabase
          .from('tenants')
          .select(`
            user_profiles!tenants_user_id_fkey (
              first_name,
              last_name
            )
          `)
          .eq('id', payment.tenant_id)
          .single()

        // Fetch apartment info
        const { data: apartmentData } = await supabase
          .from('apartments')
          .select('unit_number')
          .eq('id', payment.apartment_id)
          .single()

        transformedData.push({
          id: payment.id,
          building_id: payment.building_id,
          tenant_id: payment.tenant_id,
          unit_number: apartmentData?.unit_number || 'Unknown',
          tenant_name: tenantData?.user_profiles
            ? `${(tenantData.user_profiles as any).first_name} ${(tenantData.user_profiles as any).last_name}`
            : 'Unknown',
          apartment: apartmentData?.unit_number || 'Unknown',
          amount: payment.amount,
          currency: payment.currency,
          payment_type: payment.payment_type,
          payment_method: payment.payment_method,
          status: payment.status,
          due_date: payment.due_date,
          paid_date: payment.paid_date,
          description: payment.description,
          reference_number: payment.reference_number,
          // New payment submission fields
          proof_url: payment.proof_url,
          submitted_by: payment.submitted_by,
          submitted_at: payment.submitted_at,
          reviewed_by: payment.reviewed_by,
          reviewed_at: payment.reviewed_at,
          review_notes: payment.review_notes,
          submission_status: payment.submission_status,
          created_at: payment.created_at,
          updated_at: payment.updated_at
        })
      }

      setPayments(transformedData)

    } catch (err) {
      console.error('Error in fetchPayments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'tenant_name' | 'apartment'>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()

      if (error) throw error
      await fetchPayments() // Refresh the list
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create payment' }
    }
  }

  useEffect(() => {
    fetchPayments()

    // Set up real-time subscription
    const subscription = supabase
      .channel('payments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchPayments()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [limit, selectedBuildingId, dateRange])

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment
  }
}