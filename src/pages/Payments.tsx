// pages/Payments.tsx
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import StatsCard from '../components/Dashboard/StatsCard'
import { usePayments } from '../hooks/usePayments'
import TenantPaymentSubmission from '../components/Payments/TenantPaymentSubmission'
import PaymentApprovalModal from '../components/Payments/PaymentApprovalModal'
import { supabase } from '../lib/supabase'
import EmailService from '../services/emailService'
import { 
  CreditCardIcon, 
  ClockIcon, 
  ChartBarIcon, 
  PlusIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const Payments: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('thisMonth')
  const [showTenantSubmission, setShowTenantSubmission] = useState(false)
  const [selectedPaymentForReview, setSelectedPaymentForReview] = useState<any>(null)

  // Calculate date range based on period filter using useMemo to prevent infinite loops
  const dateRange = useMemo(() => {
    const now = new Date()
    const start = new Date()
    
    switch (periodFilter) {
      case 'thisMonth':
        start.setDate(1)
        break
      case 'lastMonth':
        start.setMonth(now.getMonth() - 1, 1)
        break
      case 'last3Months':
        start.setMonth(now.getMonth() - 3, 1)
        break
      case 'thisYear':
        start.setMonth(0, 1)
        break
      default:
        start.setDate(1)
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    }
  }, [periodFilter])

  // Use real data from the database with date filtering
  const { payments, loading, error, createPayment } = usePayments(undefined, dateRange)


  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      // First check if the payment is rejected
      const { data: payment } = await supabase
        .from('payments')
        .select('submission_status')
        .eq('id', paymentId)
        .single()

      if (payment?.submission_status === 'rejected') {
        alert('Cannot mark rejected payments as paid')
        return
      }

      const { error } = await supabase
        .from('payments')
        .update({ 
      status: 'completed',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId)

      if (error) throw error
      
      // Refresh payments list
      window.location.reload() // Simple refresh for now
    } catch (error) {
      console.error('Error marking payment as paid:', error)
    }
  }

  const handleSendReminder = async (paymentId: string) => {
    try {
      // For now, just show an alert. In a real app, this would send an email/SMS
      alert(t('reminderSent'))
    } catch (error) {
      console.error('Error sending reminder:', error)
    }
  }

  const handleTenantPaymentSubmission = async (paymentData: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create payment with submission status
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          status: 'submitted',
          submission_status: 'pending',
          submitted_by: user.id,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Send notification to admin
      console.log('Payment submitted for review:', data)
      
      // Send email notifications
      try {
        const emailService = EmailService.getInstance()
        
        // Notify tenant
        await emailService.sendPaymentSubmittedNotification(
          'tenant@example.com', // TODO: Get actual tenant email
          paymentData.tenant_name || 'Tenant',
          paymentData.amount,
          paymentData.currency || 'ARS',
          paymentData.payment_date
        )
        
        // Notify admin
        const adminEmails = await emailService.getAdminEmails()
        for (const adminEmail of adminEmails) {
          await emailService.sendAdminNotification(
            adminEmail,
            paymentData.tenant_name || 'Tenant',
            paymentData.amount,
            paymentData.currency || 'ARS',
            paymentData.payment_date
          )
        }
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError)
        // Don't fail the payment submission if email fails
      }
      
      // Refresh payments list
      window.location.reload()
    } catch (error) {
      console.error('Error submitting payment:', error)
      throw error
    }
  }

  const handlePaymentApproval = async (paymentId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const updateData: any = {
        submission_status: status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes
      }

      // If approved, mark as completed
      if (status === 'approved') {
        updateData.status = 'completed'
        updateData.paid_date = new Date().toISOString().split('T')[0]
      } else {
        updateData.status = 'pending' // Reset to pending for retry
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)

      if (error) throw error

      // Send notification to tenant
      console.log(`Payment ${status}:`, paymentId, notes)
      
      // Send email notifications
      try {
        const emailService = EmailService.getInstance()
        
        // Get payment details for email
        const { data: paymentData } = await supabase
          .from('payments')
          .select('amount, currency, submitted_at, tenant_id')
          .eq('id', paymentId)
          .single()
        
        if (paymentData) {
          const tenantEmail = await emailService.getTenantEmail(paymentData.tenant_id)
          
          if (tenantEmail) {
            if (status === 'approved') {
              await emailService.sendPaymentApprovedNotification(
                tenantEmail,
                'Tenant', // TODO: Get actual tenant name
                paymentData.amount,
                paymentData.currency || 'ARS',
                paymentData.submitted_at
              )
            } else {
              await emailService.sendPaymentRejectedNotification(
                tenantEmail,
                'Tenant', // TODO: Get actual tenant name
                paymentData.amount,
                paymentData.currency || 'ARS',
                paymentData.submitted_at,
                notes
              )
            }
          }
        }
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError)
        // Don't fail the approval if email fails
      }
      
      // Refresh payments list
      window.location.reload()
    } catch (error) {
      console.error('Error processing payment approval:', error)
      throw error
    }
  }

  const totalCompletedAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const totalPendingOrOverdueAmount = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const totalAmountAll = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const collectionEfficiencyPct = totalAmountAll > 0
    ? Math.round((totalCompletedAmount / totalAmountAll) * 100)
    : 0

  const avgPayment = payments.length > 0
    ? Math.round(totalAmountAll / payments.length)
    : 0

  const paymentStats = [
    {
      title: t('totalIncome'),
      value: `$${totalCompletedAmount.toLocaleString()}`,
      icon: CreditCardIcon,
      color: 'green' as const,
      subtitle: t('thisMonth')
    },
    {
      title: t('pendingAmount'),
      value: `$${totalPendingOrOverdueAmount.toLocaleString()}`,
      icon: ClockIcon,
      color: 'red' as const,
    },
    {
      title: t('collectionRate'),
      value: payments.length > 0 ? `${Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)}%` : '0%',
      icon: ChartBarIcon,
      color: 'blue' as const,
    },
    {
      title: t('overduePayments'),
      value: payments.filter(p => p.status === 'overdue').length,
      icon: ArrowTrendingUpIcon,
      color: 'yellow' as const,
    },
  ]

  const getStatusColor = (status: string, submissionStatus?: string) => {
    // If it has a submission_status, use that for coloring
    if (submissionStatus) {
      switch (submissionStatus) {
        case 'pending': return 'bg-blue-100 text-blue-800 border border-blue-200'
        case 'approved': return 'bg-green-100 text-green-800 border border-green-200' // Shows as "completed"
        case 'rejected': return 'bg-red-100 text-red-800 border border-red-200'
        default: return 'bg-gray-100 text-gray-800 border border-gray-200'
      }
    }
    
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 border border-red-200'
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return '🏦'
      case 'cash': return '💵'
      case 'credit_card': return '💳'
      case 'debit_card': return '💳'
      case 'check': return '📄'
      default: return '💰'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = false
    if (statusFilter === 'all') {
      matchesStatus = true
    } else if (statusFilter === 'submission_pending') {
      matchesStatus = payment.submission_status === 'pending'
    } else if (statusFilter === 'submission_approved') {
      matchesStatus = payment.submission_status === 'approved'
    } else if (statusFilter === 'submission_rejected') {
      matchesStatus = payment.submission_status === 'rejected'
    } else {
      matchesStatus = payment.status === statusFilter
    }
    
    return matchesSearch && matchesStatus
  })

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading payments: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('payments')}</h1>
          <p className="text-gray-600 mt-1">{t('trackPaymentsAndIncome')}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thisMonth">{t('thisMonth')}</option>
            <option value="lastMonth">{t('lastMonth')}</option>
            <option value="last3Months">{t('last3Months')}</option>
            <option value="thisYear">{t('thisYear')}</option>
          </select>
          <button 
            onClick={() => setShowTenantSubmission(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('recordPayment')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('paymentSummary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${payments
                .filter(p => p.payment_type === 'rent' && p.status === 'completed')
                .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('rentIncome')}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{collectionEfficiencyPct}%</p>
            <p className="text-sm text-gray-600">{t('collectionEfficiency')}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
              <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${avgPayment.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{t('averagePayment')}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPayments')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="overdue">{t('overdue')}</option>
            <option value="failed">{t('failed')}</option>
            <option value="submission_pending">{t('pending')} ({t('submitted')})</option>
            <option value="submission_approved">{t('completed')} ({t('approved')})</option>
            <option value="submission_rejected">{t('rejected')}</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('paymentHistory')} ({filteredPayments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredPayments.length} {t('of')} {payments.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('method')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dates')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {payment.tenant_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.tenant_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.apartment}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {payment.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t(payment.payment_type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getPaymentMethodIcon(payment.payment_method)}
                      </span>
                      <span className="text-sm text-gray-900">
                        {t(payment.payment_method)}
                      </span>
                    </div>
                    {payment.reference_number && (
                      <div className="text-xs text-gray-400">
                        {payment.reference_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status, payment.submission_status)}`}>
                      {payment.submission_status === 'pending' ? t('pending') : 
                       payment.submission_status === 'approved' ? t('completed') :
                       payment.submission_status === 'rejected' ? t('rejected') :
                       t(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {t('due')}: {new Date(payment.due_date).toLocaleDateString('es-AR')}
                    </div>
                    {payment.paid_date && (
                      <div className="text-sm text-gray-500">
                        {t('paid')}: {new Date(payment.paid_date).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {payment.status === 'pending' && payment.submission_status !== 'rejected' && (
                        <button 
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          {t('markPaid')}
                        </button>
                      )}
                      {/* Review button for pending and rejected payments */}
                      {payment.submission_status === 'pending' || payment.submission_status === 'rejected' ? (
                        <button 
                          onClick={() => setSelectedPaymentForReview(payment)}
                          className={`transition-colors ${
                            payment.submission_status === 'rejected' 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {t('review')}
                        </button>
                      ) : (
                        /* View button for all other payments */
                        <button 
                          onClick={() => setSelectedPaymentForReview(payment)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          {t('view')}
                        </button>
                      )}
                      {payment.status === 'overdue' && (
                        <button 
                          onClick={() => handleSendReminder(payment.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          {t('sendReminder')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Form Modal */}

      {/* Tenant Payment Submission Modal */}
      {showTenantSubmission && (
        <TenantPaymentSubmission
          onClose={() => setShowTenantSubmission(false)}
          onSubmit={handleTenantPaymentSubmission}
        />
      )}

      {/* Payment Approval Modal */}
      {selectedPaymentForReview && (
        <PaymentApprovalModal
          payment={selectedPaymentForReview}
          onClose={() => {
            console.log('Closing payment approval modal')
            setSelectedPaymentForReview(null)
          }}
          onApproval={handlePaymentApproval}
        />
      )}
    </div>
  )
}

export default Payments