// pages/Maintenance.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const Maintenance: React.FC = () => {
  const { t } = useTranslation()
  const [selectedMonth, setSelectedMonth] = useState('thisMonth')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const maintenanceStats = [
    {
      title: t('totalRequests'),
      value: 12,
      icon: WrenchScrewdriverIcon,
      color: 'blue' as const,
    },
    {
      title: t('completed'),
      value: 8,
      icon: CheckCircleIcon,
      color: 'green' as const,
    },
    {
      title: t('inProgress'),
      value: 2,
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: t('pending'),
      value: 2,
      icon: ExclamationCircleIcon,
      color: 'red' as const,
    },
  ]

  // Mock maintenance requests data
  const maintenanceRequests = [
    {
      id: 1,
      title: t('waterLeakBathroom'),
      description: t('waterLeakDescription'),
      apartment: '3A',
      tenant: t('mariaGonzalez'),
      priority: 'high' as const,
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      category: 'plumbing' as const,
      estimatedCost: 25000,
      createdAt: '2024-01-25',
      assignedTo: null
    },
    {
      id: 2,
      title: t('elevatorOutOfService'),
      description: t('elevatorDescription'),
      apartment: t('common'),
      tenant: t('administration'),
      priority: 'high' as const,
      status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      category: 'mechanical' as const,
      estimatedCost: 150000,
      createdAt: '2024-01-24',
      assignedTo: t('carlosTechnician')
    },
    {
      id: 3,
      title: t('hallwayLightNotWorking'),
      description: t('hallwayLightDescription'),
      apartment: t('secondFloor'),
      tenant: t('juanPerez'),
      priority: 'low' as const,
      status: 'completed' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      category: 'electrical' as const,
      estimatedCost: 5000,
      createdAt: '2024-01-23',
      assignedTo: t('miguelElectrician')
    },
    {
      id: 4,
      title: t('mainDoorLockDefective'),
      description: t('mainDoorLockDescription'),
      apartment: t('entrance'),
      tenant: t('administration'),
      priority: 'medium' as const,
      status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      category: 'security' as const,
      estimatedCost: 35000,
      createdAt: '2024-01-22',
      assignedTo: null
    },
    {
      id: 5,
      title: t('airConditioningNotCooling'),
      description: t('airConditioningDescription'),
      apartment: '1B',
      tenant: t('anaSilva'),
      priority: 'medium' as const,
      status: 'in_progress' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      category: 'hvac' as const,
      estimatedCost: 80000,
      createdAt: '2024-01-21',
      assignedTo: t('robertoHvac')
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return '🚿'
      case 'electrical': return '⚡'
      case 'hvac': return '❄️'
      case 'mechanical': return '⚙️'
      case 'security': return '🔒'
      case 'cleaning': return '🧹'
      default: return '🔧'
    }
  }

  // Filter requests based on search and filters
  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.tenant.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('maintenance')}</h1>
          <p className="text-gray-600 mt-1">{t('manageMaintenanceRequests')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thisMonth">{t('thisMonth')}</option>
            <option value="lastMonth">{t('lastMonth')}</option>
            <option value="last3Months">{t('last3Months')}</option>
            <option value="thisYear">{t('thisYear')}</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>{t('export')}</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>{t('newRequest')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {maintenanceStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Maintenance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('maintenanceMetrics')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-gray-600">{t('highPriorityRequests')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1.8</div>
            <div className="text-sm text-gray-600">{t('averageTimeDays')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">67%</div>
            <div className="text-sm text-gray-600">{t('completionRate')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">$295,000</div>
            <div className="text-sm text-gray-600">{t('totalEstimatedCost')}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchRequests')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('inProgress')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="cancelled">{t('cancelled')}</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="high">{t('high')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="low">{t('low')}</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('maintenanceRequests')} ({filteredRequests.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredRequests.length} {t('of')} {maintenanceRequests.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('request')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('estimatedCost')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('assignedTo')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {getCategoryIcon(request.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {request.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(request.createdAt).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.apartment}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.tenant}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status === 'pending' && t('pending')}
                      {request.status === 'in_progress' && t('inProgress')}
                      {request.status === 'completed' && t('completed')}
                      {request.status === 'cancelled' && t('cancelled')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority === 'high' && t('high')}
                      {request.priority === 'medium' && t('medium')}
                      {request.priority === 'low' && t('low')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${request.estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">ARS</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.assignedTo || t('unassigned')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        {t('view')}
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                        {t('edit')}
                      </button>
                      {request.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 transition-colors">
                          {t('assign')}
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
    </div>
  )
}

export default Maintenance