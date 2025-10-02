// pages/TenantMaintenance.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import NewMaintenanceRequestModal from '../components/Modals/NewMaintenanceRequestModal'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_cost: string
  created_at: string
  building_name: string
  apartment_number: string
}

const TenantMaintenance: React.FC = () => {
  const { t } = useTranslation()
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false)

  useEffect(() => {
    fetchMaintenanceRequests()
  }, [])

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('User not authenticated')
        return
      }

      // Get tenant's apartment_id
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('apartment_id')
        .eq('user_id', user.id)
        .single()

      if (tenantError || !tenantData) {
        setError('Tenant information not found')
        return
      }

      // Fetch maintenance requests for this tenant's apartment
      const { data, error: maintenanceError } = await supabase
        .from('maintenance_requests_with_tenant_info')
        .select(`
          id,
          title,
          description,
          apartment,
          priority,
          status,
          estimated_cost,
          created_at,
          building_name,
          apartment_number
        `)
        .eq('apartment_id', tenantData.apartment_id)
        .order('created_at', { ascending: false })

      if (maintenanceError) throw maintenanceError

      // Transform data to match component interface
      const transformedData: MaintenanceRequest[] = data?.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        priority: request.priority,
        status: request.status,
        estimated_cost: request.estimated_cost,
        created_at: request.created_at,
        building_name: request.building_name,
        apartment_number: request.apartment_number
      })) || []

      setMaintenanceRequests(transformedData)

    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      setError('Failed to load maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border border-green-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'in_progress': return <ClockIcon className="w-4 h-4" />
      case 'pending': return <ExclamationCircleIcon className="w-4 h-4" />
      default: return <WrenchScrewdriverIcon className="w-4 h-4" />
    }
  }

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
            {t('maintenanceRequests')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('viewYourMaintenanceRequests')}
          </p>
        </div>
        <button
          onClick={() => setIsNewRequestModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>{t('newRequest')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchRequests')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="pending">{t('pending')}</option>
              <option value="in_progress">{t('inProgress')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('priority')}
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('allPriorities')}</option>
              <option value="urgent">{t('urgent')}</option>
              <option value="high">{t('high')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="low">{t('low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('request')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('priority')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('created')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {t(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        <span className="flex items-center">
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{t(request.status)}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title={t('viewDetails')}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noMaintenanceRequests')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('noMaintenanceRequestsDescription')}</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedRequest.title}
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">{t('close')}</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('priority')}</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                      {t(selectedRequest.priority)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      <span className="flex items-center">
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1">{t(selectedRequest.status)}</span>
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('apartment')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.apartment_number}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('created')}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRequest.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedRequest.estimated_cost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('estimatedCost')}</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ${selectedRequest.estimated_cost}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Maintenance Request Modal */}
      <NewMaintenanceRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={() => {
          fetchMaintenanceRequests()
        }}
      />
    </div>
  )
}

export default TenantMaintenance
