// pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  UsersIcon, 
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import NewMaintenanceRequestModal from '../components/Modals/NewMaintenanceRequestModal'
import NewPaymentModal from '../components/Modals/NewPaymentModal'

// TypeScript interfaces
interface DashboardStats {
  totalApartments: number
  occupiedApartments: number
  totalRequests: number
  totalTenants: number
  totalIncome: number
  monthlyIncome: number
}

interface MaintenanceRequest {
  id: string
  title: string
  apartment: string
  tenant_name: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_cost: number
  created_at: string
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  
  // State management
  const [stats, setStats] = useState<DashboardStats>({
    totalApartments: 0,
    occupiedApartments: 0,
    totalRequests: 0,
    totalTenants: 0,
    totalIncome: 0,
    monthlyIncome: 0
  })
  
  const [recentMaintenanceRequests, setRecentMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false)
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false)

  const { selectedBuildingId } = useBuildingContext()

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch apartment statistics
      let apartmentData = []
      let apartmentError = null
      
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        apartmentData = []
      } else {
        let apartmentQuery = supabase
          .from('apartments')
          .select('id, is_occupied, unit_number')
        if (selectedBuildingId !== 'all') {
          apartmentQuery = apartmentQuery.eq('building_id', selectedBuildingId)
        }
        const result = await apartmentQuery
        apartmentData = result.data || []
        apartmentError = result.error
      }
      
      if (apartmentError) throw apartmentError
      console.log('🔍 Dashboard: Final apartment data length:', apartmentData.length)

      // Fetch maintenance requests count
      let maintenanceData = []
      let maintenanceError = null
      
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        maintenanceData = []
      } else {
        // Prefer filtering maintenance by apartment_id to avoid unit_number collisions across buildings
        let maintenanceBase = supabase
          .from('maintenance_requests')
          .select('id, apartment, apartment_id, status')
          .in('status', ['pending', 'in_progress'])
        
        if (selectedBuildingId !== 'all') {
          const apartmentIds = (apartmentData || []).map((a: any) => a.id).filter(Boolean)
          if (apartmentIds.length > 0) {
            const res = await maintenanceBase.in('apartment_id', apartmentIds)
            maintenanceData = res.data || []
            maintenanceError = res.error
          } else {
            maintenanceData = []
            maintenanceError = null
          }
        } else {
          const res = await maintenanceBase
          maintenanceData = res.data || []
          maintenanceError = res.error
        }
      }

      if (maintenanceError) throw maintenanceError

      // Fetch active tenants count
      let tenantData = []
      let tenantError = null
      
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        tenantData = []
      } else {
        let tenantQuery = supabase
          .from('tenants')
          .select('id, apartments!inner ( building_id )')
          .eq('is_active', true)
        if (selectedBuildingId !== 'all') {
          tenantQuery = tenantQuery.eq('apartments.building_id', selectedBuildingId)
        }
        const result = await tenantQuery
        tenantData = result.data || []
        tenantError = result.error
      }

      if (tenantError) throw tenantError

      // Fetch payments for this month
      const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM format
      let paymentData = []
      let paymentError = null
      
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        paymentData = []
      } else {
        let paymentQuery = supabase
          .from('payments')
          .select('amount, status, apartments!inner ( building_id )')
          .eq('status', 'completed')
          .gte('paid_date', `${currentMonth}-01`)
          .lt('paid_date', `${getNextMonth(currentMonth)}-01`)
        if (selectedBuildingId !== 'all') {
          paymentQuery = paymentQuery.eq('apartments.building_id', selectedBuildingId)
        }
        const result = await paymentQuery
        paymentData = result.data || []
        paymentError = result.error
      }

      if (paymentError) throw paymentError

      // Fetch total completed payments
      let totalPaymentData = []
      let totalPaymentError = null
      
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        totalPaymentData = []
      } else {
        let totalPaymentQuery = supabase
          .from('payments')
          .select('amount, apartments!inner ( building_id )')
          .eq('status', 'completed')
        if (selectedBuildingId !== 'all') {
          totalPaymentQuery = totalPaymentQuery.eq('apartments.building_id', selectedBuildingId)
        }
        const result = await totalPaymentQuery
        totalPaymentData = result.data || []
        totalPaymentError = result.error
      }

      if (totalPaymentError) throw totalPaymentError

      // Calculate statistics
      const totalApartments = apartmentData?.length || 0
      const totalRequests = maintenanceData?.length || 0
      const totalTenants = tenantData?.length || 0
      // Count occupied apartments based on actual tenant data, not the is_occupied field
      const occupiedApartments = totalTenants || 0
      const monthlyIncome = paymentData?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      const totalIncome = totalPaymentData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      setStats({
        totalApartments,
        occupiedApartments,
        totalRequests,
        totalTenants,
        totalIncome,
        monthlyIncome
      })

    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load dashboard statistics')
    }
  }

  // Fetch recent maintenance requests
  const fetchRecentMaintenanceRequests = async () => {
    try {
      // Determine unit numbers for the selected building (if any)
      // no-op: we now filter by apartment_id below

      // Try to use the enhanced view first, fall back to simple table if not available
      let baseViewQuery = supabase
        .from('maintenance_requests_with_tenant_info')
        .select(`
          id,
          title,
          apartment,
          apartment_id,
          priority,
          status,
          estimated_cost,
          created_at,
          tenant_name
        `)
        .in('status', ['pending', 'in_progress']) // Only show pending and in-progress requests
        .order('created_at', { ascending: false })
        .limit(10)

      let apartmentIdsForFilter: string[] = []
      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        setRecentMaintenanceRequests([])
        return
      } else if (selectedBuildingId !== 'all') {
        const { data: aptIdsRows } = await supabase
          .from('apartments')
          .select('id')
          .eq('building_id', selectedBuildingId)
        apartmentIdsForFilter = (aptIdsRows || []).map((r: any) => r.id)
        if (apartmentIdsForFilter.length > 0) {
          baseViewQuery = baseViewQuery.in('apartment_id', apartmentIdsForFilter)
        } else {
          baseViewQuery = baseViewQuery.limit(0)
        }
      }

      let { data, error } = await baseViewQuery

      // If the view doesn't exist, fall back to the simple table
      if (error && error.code === 'PGRST116') {
        let simpleQuery = supabase
          .from('maintenance_requests')
          .select(`
            id,
            title,
            apartment,
            apartment_id,
            priority,
            status,
            estimated_cost,
            created_at
          `)
          .in('status', ['pending', 'in_progress']) // Only show pending and in-progress requests
          .order('created_at', { ascending: false })
          .limit(5)
        if (selectedBuildingId !== 'all') {
          if (apartmentIdsForFilter.length > 0) {
            simpleQuery = simpleQuery.in('apartment_id', apartmentIdsForFilter)
          } else {
            simpleQuery = simpleQuery.limit(0)
          }
        }
        const { data: simpleData, error: simpleError } = await simpleQuery
        
        if (simpleError) throw simpleError
        // For fallback data, we need to ensure it has the right structure
        data = simpleData?.map(item => ({
          ...item,
          tenant_name: 'N/A' // Add missing tenant_name field for fallback
        }))
      } else if (error) {
        throw error
      }

      // Transform data to match component interface
      const transformedData: MaintenanceRequest[] = data?.map(request => {
        const baseRequest = request as any
        return {
          id: baseRequest.id,
          title: baseRequest.title,
          apartment: baseRequest.apartment,
          tenant_name: baseRequest.tenant_name || 'N/A', // Use tenant_name from view if available, otherwise 'N/A'
          priority: baseRequest.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: baseRequest.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
          estimated_cost: baseRequest.estimated_cost || 0,
          created_at: baseRequest.created_at
        }
      }) || []

      setRecentMaintenanceRequests(transformedData)

    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      setError('Failed to load maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get next month
  const getNextMonth = (currentMonth: string): string => {
    const date = new Date(currentMonth + '-01')
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().substring(0, 7)
  }

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentMaintenanceRequests()
      ])
    }

    loadDashboardData()

    // Set up real-time subscriptions
    const maintenanceSubscription = supabase
      .channel('maintenance_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          fetchRecentMaintenanceRequests()
          fetchDashboardStats()
        }
      )
      .subscribe()

    const paymentSubscription = supabase
      .channel('payments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchDashboardStats()
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      maintenanceSubscription.unsubscribe()
      paymentSubscription.unsubscribe()
    }
  }, [selectedBuildingId])

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'urgent': return 'bg-red-200 text-red-900 border border-red-300'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const quickActions = [
    {
      title: t('newRequest'),
      icon: WrenchScrewdriverIcon,
      color: 'blue',
      onClick: () => setIsNewRequestModalOpen(true)
    },
    {
      title: t('newPayment'),
      icon: CreditCardIcon,
      color: 'green',
      onClick: () => setIsNewPaymentModalOpen(true)
    },
    {
      title: t('inviteTenant'),
      icon: UsersIcon,
      color: 'purple',
      href: '/invitations'
    },
    {
      title: t('generateReport'),
      icon: ExclamationTriangleIcon,
      color: 'indigo',
      href: '/analytics'
    }
  ]

  // Prepare stats for display
  const statsCards = [
    {
      title: t('totalApartments'),
      value: stats.totalApartments,
      icon: HomeIcon,
      color: 'blue' as const,
    },
    {
      title: t('occupied'),
      value: stats.occupiedApartments,
      icon: CheckCircleIcon,
      color: 'green' as const,
    },
    {
      title: t('available'),
      value: stats.totalApartments - stats.occupiedApartments,
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: t('totalResidents'),
      value: stats.totalTenants,
      icon: UsersIcon,
      color: 'rose' as const,
    },
    {
      title: t('totalIncome'),
      value: `$${stats.monthlyIncome.toLocaleString()}`,
      icon: CreditCardIcon,
      color: 'red' as const,
      subtitle: t('thisMonth')
    },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card-modern bg-gradient-to-br from-white to-red-50/30 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-modern p-6">
              <div className="animate-pulse">
                <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="card-modern p-8 bg-gradient-to-br from-white to-red-50/30 hover-lift">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gradient-primary text-3xl font-bold mb-2">
              {t('welcomeTitle').replace('BA Property Manager', 'Barrio')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Requests */}
        <div className="card-modern hover-lift">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {t('maintenanceSummary')}
              </h3>
              <a 
                href="/maintenance" 
                className="text-red-500 hover:text-red-600 text-sm font-semibold transition-colors"
              >
                {t('viewAll')} →
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Pending Requests */}
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {recentMaintenanceRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">{t('pending')}</p>
              </div>

              {/* In Progress */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <ClockIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {recentMaintenanceRequests.filter(r => r.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">{t('inProgress')}</p>
              </div>

              {/* High Priority */}
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {recentMaintenanceRequests.filter(r => r.priority === 'high' || r.priority === 'urgent').length}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">{t('highPriority')}</p>
              </div>

              {/* Total Cost */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  ${recentMaintenanceRequests.reduce((sum, r) => sum + (r.estimated_cost || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 font-medium mt-1">{t('estimatedCost')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-modern hover-lift">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">
              {t('quickActions')}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-green-500 to-emerald-500',
                  'from-purple-500 to-pink-500',
                  'from-orange-500 to-red-500'
                ];
                return (
                  <button 
                    key={index}
                    className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-modern-lg transition-all duration-300 text-center hover-lift"
                    onClick={() => {
                      if (action.onClick) {
                        action.onClick()
                      } else if (action.href) {
                        window.location.href = action.href
                      }
                    }}
                  >
                    <div className={`icon-container-gradient bg-gradient-to-br ${gradients[index]} mx-auto mb-4`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {action.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* New Maintenance Request Modal */}
      <NewMaintenanceRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={() => {
          // Refresh the dashboard data after creating a new request
          fetchDashboardStats()
          fetchRecentMaintenanceRequests()
        }}
      />
      
      <NewPaymentModal
        isOpen={isNewPaymentModalOpen}
        onClose={() => setIsNewPaymentModalOpen(false)}
        onSuccess={() => {
          // Refresh the dashboard data after creating a new payment
          fetchDashboardStats()
          fetchRecentMaintenanceRequests()
        }}
      />
    </div>
  )
}

export default Dashboard