// usePayments.ts - Hook for managing payment operations and tracking
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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
}

export const usePayments = (limit?: number) => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          payment_type,
          payment_method,
          status,
          due_date,
          paid_date,
          description,
          reference_number,
          created_at,
          tenants (
            user_profiles (
              first_name,
              last_name
            )
          ),
          apartments (
            unit_number
          )
        `)
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error

      const transformedData: Payment[] = data?.map(payment => ({
        id: payment.id,
        tenant_name: payment.tenants?.[0]?.user_profiles?.[0]
          ? `${payment.tenants[0].user_profiles[0].first_name} ${payment.tenants[0].user_profiles[0].last_name}`
          : 'Unknown',
        apartment: payment.apartments?.[0]?.unit_number || 'Unknown',
        amount: payment.amount,
        currency: payment.currency,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        status: payment.status,
        due_date: payment.due_date,
        paid_date: payment.paid_date,
        description: payment.description,
        reference_number: payment.reference_number,
        created_at: payment.created_at
      })) || []

      setPayments(transformedData)

    } catch (err) {
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
  }, [limit])

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment
  }
}