import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import TenantPaymentSubmission from '../components/Payments/TenantPaymentSubmission'
import { supabase } from '../lib/supabase'
import { 
  CreditCardIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const TenantDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [showPaymentSubmission, setShowPaymentSubmission] = useState(false)
  const [userPayments, setUserPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's payment submissions
  React.useEffect(() => {
    const fetchUserPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            currency,
            payment_method,
            status,
            submission_status,
            due_date,
            paid_date,
            description,
            reference_number,
            submitted_at,
            reviewed_at,
            review_notes,
            proof_url
          `)
          .eq('submitted_by', user.id)
          .order('submitted_at', { ascending: false })

        if (error) throw error
        setUserPayments(data || [])
      } catch (error) {
        console.error('Error fetching user payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserPayments()
  }, [])

  const handlePaymentSubmission = async (paymentData: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get tenant record for this user
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, apartment_id')
        .eq('user_id', user.id)
        .single()

      if (tenantError) {
        console.error('Error fetching tenant data:', tenantError)
        // Continue without tenant_id for now
      }

      // Create payment with submission status
      console.log('Inserting payment data:', {
        ...paymentData,
        status: 'submitted',
        submission_status: 'pending',
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        tenant_id: tenantData?.id,
        apartment_id: tenantData?.apartment_id
      })

      const { data, error } = await supabase
        .from('payments')
        .insert({
          amount: paymentData.amount,
          currency: 'ARS',
          payment_type: 'rent', // Default to rent
          payment_method: paymentData.payment_method,
          status: 'pending', // Use 'pending' instead of 'submitted' to satisfy check constraint
          due_date: paymentData.due_date,
          paid_date: paymentData.paid_date,
          description: paymentData.description,
          reference_number: paymentData.reference_number,
          proof_url: paymentData.proof_url,
          submitted_by: user.id,
          submitted_at: new Date().toISOString(),
          submission_status: 'pending',
          tenant_id: tenantData?.id || null,
          apartment_id: tenantData?.apartment_id || null
        })
        .select()
        .single()

      if (error) throw error

      // Refresh payments list
      setUserPayments(prev => [data, ...prev])
      setShowPaymentSubmission(false)
    } catch (error) {
      console.error('Error submitting payment:', error)
      throw error
    }
  }

  const getStatusIcon = (status: string, submissionStatus?: string) => {
    if (status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />
    } else if (status === 'submitted') {
      if (submissionStatus === 'approved') {
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      } else if (submissionStatus === 'rejected') {
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      } else {
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      }
    } else {
      return <ClockIcon className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string, submissionStatus?: string) => {
    if (status === 'completed') {
      return t('completed')
    } else if (status === 'submitted') {
      if (submissionStatus === 'approved') {
        return t('approved')
      } else if (submissionStatus === 'rejected') {
        return t('rejected')
      } else {
        return t('underReview')
      }
    } else {
      return t('pending')
    }
  }

  const getStatusColor = (status: string, submissionStatus?: string) => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800'
    } else if (status === 'submitted') {
      if (submissionStatus === 'approved') {
        return 'bg-green-100 text-green-800'
      } else if (submissionStatus === 'rejected') {
        return 'bg-red-100 text-red-800'
      } else {
        return 'bg-blue-100 text-blue-800'
      }
    } else {
      return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('myPayments')}</h1>
          <p className="text-gray-600 mt-1">{t('manageYourPayments')}</p>
        </div>
        <button 
          onClick={() => {
            console.log('Opening payment submission modal')
            setShowPaymentSubmission(true)
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{t('submitPayment')}</span>
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('completedPayments')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userPayments.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('pendingReview')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userPayments.filter(p => p.status === 'submitted' && p.submission_status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('totalSubmitted')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userPayments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('paymentHistory')}</h3>
        </div>
        
        {userPayments.length === 0 ? (
          <div className="p-6 text-center">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noPaymentsYet')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('submitYourFirstPayment')}</p>
            <div className="mt-6">
              <button
                onClick={() => setShowPaymentSubmission(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {t('submitPayment')}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('method')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('submitted')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('reviewed')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('notes')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      {payment.description && (
                        <div className="text-sm text-gray-500">{payment.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t(payment.payment_method)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status, payment.submission_status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status, payment.submission_status)}`}>
                          {getStatusText(payment.status, payment.submission_status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.submitted_at ? formatDate(payment.submitted_at) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.reviewed_at ? formatDate(payment.reviewed_at) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.review_notes ? (
                        <div className="max-w-xs truncate" title={payment.review_notes}>
                          {payment.review_notes}
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Submission Modal */}
      {showPaymentSubmission && (
        <TenantPaymentSubmission
          onClose={() => {
            console.log('Closing payment submission modal')
            setShowPaymentSubmission(false)
          }}
          onSubmit={handlePaymentSubmission}
        />
      )}
    </div>
  )
}

export default TenantDashboard
