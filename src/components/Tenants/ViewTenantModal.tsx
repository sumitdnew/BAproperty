// components/Tenants/ViewTenantModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, PhoneIcon, EnvelopeIcon, HomeIcon, CalendarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ViewTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
}

interface TenantDetails {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  dni: string
  cuit_cuil: string
  apartment: string
  floor: number
  monthly_rent: number
  lease_start_date: string
  lease_end_date: string
  is_active: boolean
  emergency_contact_name: string
  emergency_contact_phone: string
  payment_status: string
  lease_status: string
  created_at: string
}

interface PaymentHistory {
  id: string
  amount: number
  status: string
  due_date: string
  paid_date?: string
  payment_type: string
  description: string
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
  estimated_cost?: number
}

const ViewTenantModal: React.FC<ViewTenantModalProps> = ({ isOpen, onClose, tenantId }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchTenantDetails()
    }
  }, [isOpen, tenantId])

  const fetchTenantDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch tenant with all related data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          *,
          user_profiles!inner (
            first_name,
            last_name,
            phone,
            dni,
            cuit_cuil
          ),
          apartments!inner (
            unit_number,
            floor,
            monthly_rent
          )
        `)
        .eq('id', tenantId)
        .single()

      if (tenantError) throw tenantError

      // Resolve email from user_profiles or invitations (client-safe)
      let resolvedEmail = ''
      // Try user_profiles.email first
      const { data: profileEmail } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', tenantData.user_id)
        .single()
      if (profileEmail?.email) resolvedEmail = profileEmail.email
      if (!resolvedEmail) {
        const { data: invEmailByUser } = await supabase
          .from('invitations')
          .select('email')
          .eq('auth_user_id', tenantData.user_id)
          .order('accepted_at', { ascending: false, nullsFirst: false })
          .limit(1)
        if (invEmailByUser && invEmailByUser[0]?.email) resolvedEmail = invEmailByUser[0].email
      }
      if (!resolvedEmail) {
        const { data: invEmailByApt } = await supabase
          .from('invitations')
          .select('email')
          .eq('apartment_id', tenantData.apartment_id)
          .order('accepted_at', { ascending: false, nullsFirst: false })
          .limit(1)
        if (invEmailByApt && invEmailByApt[0]?.email) resolvedEmail = invEmailByApt[0].email
      }

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, status, due_date, paid_date, payment_type, description')
        .eq('tenant_id', tenantId)
        .order('due_date', { ascending: false })
        .limit(10)

      if (paymentsError) throw paymentsError

      // Fetch maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('id, title, description, priority, status, created_at, estimated_cost')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (maintenanceError) throw maintenanceError

      // Calculate lease status
      const today = new Date()
      const leaseEnd = new Date(tenantData.lease_end_date)
      const daysUntilExpiry = Math.ceil((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      let leaseStatus: string = 'active'
      if (daysUntilExpiry < 0) {
        leaseStatus = 'expired'
      } else if (daysUntilExpiry <= 30) {
        leaseStatus = 'ending_soon'
      } else if (!tenantData.is_active) {
        leaseStatus = 'inactive'
      }

      // Calculate payment status
      const latestPayment = paymentsData?.[0]
      let paymentStatus = 'unknown'
      if (latestPayment) {
        const today = new Date()
        const dueDate = new Date(latestPayment.due_date)
        const isOverdue = today > dueDate && latestPayment.status !== 'completed'
        paymentStatus = isOverdue ? 'overdue' : latestPayment.status
      }

      const tenantDetails: TenantDetails = {
        id: tenantData.id,
        first_name: tenantData.user_profiles.first_name,
        last_name: tenantData.user_profiles.last_name,
        email: resolvedEmail,
        phone: tenantData.user_profiles.phone || '',
        dni: tenantData.user_profiles.dni || '',
        cuit_cuil: tenantData.user_profiles.cuit_cuil || '',
        apartment: tenantData.apartments.unit_number,
        floor: tenantData.apartments.floor,
        monthly_rent: tenantData.apartments.monthly_rent,
        lease_start_date: tenantData.lease_start_date,
        lease_end_date: tenantData.lease_end_date,
        is_active: tenantData.is_active,
        emergency_contact_name: tenantData.emergency_contact_name || '',
        emergency_contact_phone: tenantData.emergency_contact_phone || '',
        payment_status: paymentStatus,
        lease_status: leaseStatus,
        created_at: tenantData.created_at
      }

      setTenant(tenantDetails)
      setPayments(paymentsData || [])
      setMaintenanceRequests(maintenanceData || [])

    } catch (err) {
      console.error('Error fetching tenant details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ending_soon': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('error')}</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Tenant not found'}</p>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {tenant.first_name} {tenant.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tenant Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <HomeIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('apartment')}</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {tenant.apartment} - {t('floor')} {tenant.floor}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">{t('leaseStatus')}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.lease_status)}`}>
                    {t(tenant.lease_status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <PhoneIcon className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('paymentStatus')}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.payment_status)}`}>
                    {t(tenant.payment_status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('email')}</label>
                <div className="flex items-center mt-1">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{tenant.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('phone')}</label>
                <div className="flex items-center mt-1">
                  <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{tenant.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('dni')}</label>
                <p className="text-gray-900 mt-1">{tenant.dni}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('cuitCuil')}</label>
                <p className="text-gray-900 mt-1">{tenant.cuit_cuil || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaseInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('monthlyRent')}</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  ${tenant.monthly_rent.toLocaleString()} ARS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('leaseStartDate')}</label>
                <p className="text-gray-900 mt-1">
                  {new Date(tenant.lease_start_date).toLocaleDateString('es-AR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('leaseEndDate')}</label>
                <p className="text-gray-900 mt-1">
                  {new Date(tenant.lease_end_date).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {tenant.emergency_contact_name && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('emergencyContact')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">{t('emergencyContactName')}</label>
                  <p className="text-gray-900 mt-1">{tenant.emergency_contact_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">{t('emergencyContactPhone')}</label>
                  <p className="text-gray-900 mt-1">{tenant.emergency_contact_phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Payments */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('recentPayments')}</h3>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('amount')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('type')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(payment.due_date).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {t(payment.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {t(payment.payment_type)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">{t('noPaymentsFound')}</p>
            )}
          </div>

          {/* Recent Maintenance Requests */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('recentMaintenanceRequests')}</h3>
            {maintenanceRequests.length > 0 ? (
              <div className="space-y-3">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {t(request.priority)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {t(request.status)}
                          </span>
                          {request.estimated_cost && (
                            <span className="text-xs text-gray-500">
                              ${request.estimated_cost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{t('noMaintenanceRequestsFound')}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewTenantModal


