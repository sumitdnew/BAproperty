// pages/TenantMainDashboard.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  WrenchScrewdriverIcon,
  CreditCardIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface TenantStats {
  totalPayments: number
  pendingPayments: number
  completedPayments: number
  overduePayments: number
  totalMaintenanceRequests: number
  pendingMaintenanceRequests: number
  completedMaintenanceRequests: number
  buildingName: string
  apartmentNumber: string
  tenantName: string
  tenantEmail: string
}

interface RecentPayment {
  id: string
  amount: number
  currency: string
  payment_type: string
  status: string
  due_date: string
  paid_date?: string
  description: string
  submission_status?: string
}

interface RecentMaintenanceRequest {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
}

const TenantMainDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState<TenantStats>({
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    overduePayments: 0,
    totalMaintenanceRequests: 0,
    pendingMaintenanceRequests: 0,
    completedMaintenanceRequests: 0,
    buildingName: '',
    apartmentNumber: '',
    tenantName: '',
    tenantEmail: ''
  })
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([])
  const [recentMaintenanceRequests, setRecentMaintenanceRequests] = useState<RecentMaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTenantData()
  }, [])

  const fetchTenantData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Get tenant information (pick the most recent active tenant row for this user)
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          id,
          apartment_id,
          user_profiles (
            first_name,
            last_name
          ),
          apartments (
            unit_number,
            buildings (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (tenantError || !tenantData) {
        console.error('Tenant lookup error:', tenantError)
        console.log('Tenant data:', tenantData)
        setError('Tenant information not found')
        return
      }

      console.log('Full tenant data structure:', JSON.stringify(tenantData, null, 2))

      const buildingName = tenantData.apartments?.[0]?.buildings?.[0]?.name || ''
      const apartmentNumber = tenantData.apartments?.[0]?.unit_number || ''
      const tenantName = `${tenantData.user_profiles?.[0]?.first_name || ''} ${tenantData.user_profiles?.[0]?.last_name || ''}`.trim()
      const tenantEmail = user.email || ''

      console.log('Extracted data:', { buildingName, apartmentNumber, tenantName, tenantEmail })

      // Fetch payments for this tenant
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError)
      }

      // Fetch maintenance requests for this tenant's apartment
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('apartment_id', tenantData.apartment_id)
        .order('created_at', { ascending: false })

      if (maintenanceError) {
        console.error('Error fetching maintenance requests:', maintenanceError)
      }

      // Calculate payment stats
      const payments = paymentsData || []
      const totalPayments = payments.length
      const pendingPayments = payments.filter(p => p.status === 'pending' && p.submission_status !== 'pending').length
      const completedPayments = payments.filter(p => p.status === 'completed').length
      const overduePayments = payments.filter(p => {
        const dueDate = new Date(p.due_date)
        const today = new Date()
        return p.status === 'pending' && dueDate < today
      }).length

      // Calculate maintenance stats
      const maintenanceRequests = maintenanceData || []
      const totalMaintenanceRequests = maintenanceRequests.length
      const pendingMaintenanceRequests = maintenanceRequests.filter(m => m.status === 'pending').length
      const completedMaintenanceRequests = maintenanceRequests.filter(m => m.status === 'completed').length

      setStats({
        totalPayments,
        pendingPayments,
        completedPayments,
        overduePayments,
        totalMaintenanceRequests,
        pendingMaintenanceRequests,
        completedMaintenanceRequests,
        buildingName,
        apartmentNumber,
        tenantName,
        tenantEmail
      })

      // Set recent data (last 5 items)
      setRecentPayments(payments.slice(0, 5))
      setRecentMaintenanceRequests(maintenanceRequests.slice(0, 5))

    } catch (error) {
      console.error('Error fetching tenant data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'pending': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getMaintenancePriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{t('error')}</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('welcomeBack')}, {stats.tenantName || t('tenant')}
        </h1>
        <p className="text-gray-600">
          {stats.apartmentNumber && stats.buildingName ? (
            <>
              {t('apartment')}: {stats.apartmentNumber} • {t('building')}: {stats.buildingName}
            </>
          ) : (
            <span className="text-gray-500">{t('loadingTenantInfo')}</span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('totalPayments')}
          value={stats.totalPayments.toString()}
          icon={CreditCardIcon}
          color="blue"
        />
        <StatsCard
          title={t('pendingPayments')}
          value={stats.pendingPayments.toString()}
          icon={ClockIcon}
          color="yellow"
        />
        <StatsCard
          title={t('completedPayments')}
          value={stats.completedPayments.toString()}
          icon={CheckCircleIcon}
          color="green"
        />
        <StatsCard
          title={t('maintenanceRequests')}
          value={stats.totalMaintenanceRequests.toString()}
          icon={WrenchScrewdriverIcon}
          color="blue"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              {t('recentPayments')}
            </h2>
            <a 
              href="/tenant-dashboard" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('viewAll')}
            </a>
          </div>
          
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </p>
                    <p className="text-sm text-gray-500">{payment.payment_type}</p>
                    <p className="text-xs text-gray-500">{stats.tenantEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noPaymentsYet')}</p>
          )}
        </div>

        {/* Recent Maintenance Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
              {t('recentMaintenanceRequests')}
            </h2>
            <a 
              href="/tenant-maintenance" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('viewAll')}
            </a>
          </div>
          
          {recentMaintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {recentMaintenanceRequests.map((request) => (
                <div key={request.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{request.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`text-sm font-medium ${getMaintenanceStatusColor(request.status)}`}>
                        {t(request.status)}
                      </p>
                      <p className={`text-xs ${getMaintenancePriorityColor(request.priority)}`}>
                        {t(request.priority)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noMaintenanceRequests')}</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/tenant-dashboard"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CreditCardIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('submitPayment')}</p>
              <p className="text-sm text-gray-500">{t('submitPaymentDescription')}</p>
            </div>
          </a>
          <a
            href="/community"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <UserGroupIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('community')}</p>
              <p className="text-sm text-gray-500">{t('connectWithNeighbors')}</p>
            </div>
          </a>
          <a
            href="/tenant-maintenance"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <WrenchScrewdriverIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{t('maintenance')}</p>
              <p className="text-sm text-gray-500">{t('viewMaintenanceRequests')}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default TenantMainDashboard


