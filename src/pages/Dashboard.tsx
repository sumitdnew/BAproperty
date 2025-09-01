// pages/Dashboard.tsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  UsersIcon, 
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()

  // Mock data - replace with real data from Supabase
  const stats = [
    {
      title: t('totalApartments'),
      value: 24,
      icon: HomeIcon,
      color: 'blue' as const,
    },
    {
      title: t('totalRequests'),
      value: 2,
      icon: WrenchScrewdriverIcon,
      color: 'yellow' as const,
    },
    {
      title: t('totalTenants'),
      value: 18,
      icon: UsersIcon,
      color: 'green' as const,
    },
    {
      title: t('totalIncome'),
      value: '$85,000',
      icon: CreditCardIcon,
      color: 'green' as const,
      subtitle: t('thisMonth')
    },
  ]

  const recentMaintenanceRequests = [
    {
      id: 1,
      title: t('waterLeakBathroom'),
      apartment: '3A',
      tenant: t('mariaGonzalez'),
      priority: 'high',
      status: 'pending',
      estimatedCost: 25000,
      createdAt: '2024-01-25'
    },
    {
      id: 2,
      title: t('elevatorOutOfService'),
      apartment: 'Admin',
      tenant: t('carlosRodriguez'),
      priority: 'low',
      status: 'in_progress',
      estimatedCost: 150000,
      createdAt: '2024-01-25'
    }
  ]

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
      href: '/maintenance'
    },
    {
      title: t('newPayment'),
      icon: CreditCardIcon,
      color: 'green',
      href: '/payments'
    },
    {
      title: t('inviteTenant'),
      icon: UsersIcon,
      color: 'purple',
      href: '/tenants'
    },
    {
      title: t('generateReport'),
      icon: ExclamationTriangleIcon,
      color: 'indigo',
      href: '/analytics'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('welcomeTitle')}
        </h1>
        <p className="text-blue-100">
          {t('welcomeSubtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('maintenanceSummary')}
              </h3>
              <a 
                href="/maintenance" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {t('viewAll')}
              </a>
            </div>
          </div>
          <div className="p-6">
            {recentMaintenanceRequests.length > 0 ? (
              <div className="space-y-4">
                {recentMaintenanceRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {t('apartment')}: {request.apartment} • {request.tenant}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                          {t(request.priority)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {t(request.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900">
                        ${request.estimatedCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{t('estimatedCost')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('noMaintenanceRequests')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('quickActions')}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
                  onClick={() => window.location.href = action.href}
                >
                  <action.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Building Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('buildingOverview')}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-gray-600">{t('totalApartments')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">18</p>
              <p className="text-sm text-gray-600">{t('occupied')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-sm text-gray-600">{t('available')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard