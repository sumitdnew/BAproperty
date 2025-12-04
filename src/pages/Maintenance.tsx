// pages/Maintenance.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import NewMaintenanceRequestModal from '../components/Modals/NewMaintenanceRequestModal'
import AssignVendorModal from '../components/Modals/AssignVendorModal'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// TypeScript interfaces based on actual view structure
interface MaintenanceRequest {
  id: string
  title: string
  description: string
  apartment: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  estimated_cost: string
  created_at: string
  tenant_name: string
  building_name: string
  apartment_number: string
  vendor_name?: string
  vendor_category?: string
  vendor_contact_person?: string
  vendor_email?: string
  vendor_phone?: string
}

interface MaintenanceStats {
  totalRequests: number
  completed: number
  inProgress: number
  pending: number
  highPriority: number
  averageTimeDays: number
  completionRate: number
  totalEstimatedCost: number
}

const Maintenance: React.FC = () => {
  const { t } = useTranslation()
  const { selectedBuildingId } = useBuildingContext()
  
  // Check if current user is a tenant
  useEffect(() => {
    const checkUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()
        
        setIsTenant(profile?.user_type === 'tenant')
      }
    }
    checkUserType()
  }, [])
  
  // State management
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [stats, setStats] = useState<MaintenanceStats>({
    totalRequests: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    highPriority: 0,
    averageTimeDays: 0,
    completionRate: 0,
    totalEstimatedCost: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [selectedMonth, setSelectedMonth] = useState('thisMonth')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [isTenant, setIsTenant] = useState(false)

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Description',
      'Apartment',
      'Priority',
      'Status',
      'Estimated Cost (ARS)',
      'Created Date',
      'Tenant Name',
      'Building Name'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredRequests.map(request => [
        request.id,
        `"${request.title.replace(/"/g, '""')}"`,
        `"${request.description.replace(/"/g, '""')}"`,
        request.apartment,
        request.priority,
        request.status,
        request.estimated_cost,
        new Date(request.created_at).toLocaleDateString(),
        `"${request.tenant_name.replace(/"/g, '""')}"`,
        `"${request.building_name.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `maintenance_requests_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    try {
      console.log('Starting PDF export...')
      
      // Check if jsPDF is available
      if (typeof jsPDF === 'undefined') {
        console.error('jsPDF is not available')
        alert('PDF export is not available. Please check the console for details.')
        return
      }

      const doc = new jsPDF()
      console.log('PDF document created')
      
      // Title
      doc.setFontSize(20)
      doc.text('Maintenance Requests Report', 105, 20, { align: 'center' })
      
      // Date
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)
      
      // Summary
      doc.setFontSize(14)
      doc.text('Summary', 20, 50)
      doc.setFontSize(10)
      doc.text(`Total Requests: ${stats.totalRequests}`, 20, 60)
      doc.text(`Completed: ${stats.completed}`, 20, 67)
      doc.text(`In Progress: ${stats.inProgress}`, 20, 74)
      doc.text(`Pending: ${stats.pending}`, 20, 81)
      doc.text(`High Priority: ${stats.highPriority}`, 20, 88)
      doc.text(`Total Estimated Cost: $${stats.totalEstimatedCost.toLocaleString()} ARS`, 20, 95)
      
      console.log('Summary added to PDF')
      
      // Check if we have data to export
      if (filteredRequests.length === 0) {
        doc.text('No maintenance requests to display', 20, 110)
        doc.save(`maintenance_requests_${new Date().toISOString().split('T')[0]}.pdf`)
        return
      }
      
      // Table
      const tableData = filteredRequests.map(request => [
        request.title.substring(0, 30), // Limit title length
        request.apartment,
        request.priority,
        request.status,
        `$${parseFloat(request.estimated_cost).toLocaleString()}`,
        new Date(request.created_at).toLocaleDateString(),
        (request.tenant_name || 'N/A').substring(0, 20) // Limit tenant name length
      ])
      
      const tableHeaders = [
        'Title',
        'Apartment',
        'Priority',
        'Status',
        'Est. Cost',
        'Created',
        'Tenant'
      ]
      
      console.log('Table data prepared:', tableData.length, 'rows')
      
      // Check if autoTable is available and use it, otherwise fallback to manual table
      try {
        // Try to use autoTable if available
        if (typeof (doc as any).autoTable === 'function') {
          console.log('Using autoTable plugin')
          ;(doc as any).autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: 110,
            styles: {
              fontSize: 8,
              cellPadding: 2
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252]
            }
          })
          console.log('AutoTable completed')
        } else {
          throw new Error('autoTable not available')
        }
      } catch (autoTableError) {
        console.log('AutoTable failed, using manual table:', autoTableError)
        // Fallback: create a simple table manually
        let yPosition = 110
        
        // Add headers
        doc.setFontSize(8)
        doc.setFont(undefined, 'bold')
        doc.text(tableHeaders.join(' | '), 20, yPosition)
        yPosition += 8
        
        // Add data rows
        doc.setFont(undefined, 'normal')
        tableData.forEach((row) => {
          if (yPosition > 250) {
            doc.addPage()
            yPosition = 20
          }
          doc.text(row.join(' | '), 20, yPosition)
          yPosition += 8
        })
      }
      
      console.log('Table added to PDF')
      
      // Footer
      let finalY = 200
      try {
        // Try to get the final Y position from autoTable
        if ((doc as any).lastAutoTable && (doc as any).lastAutoTable.finalY) {
          finalY = (doc as any).lastAutoTable.finalY + 10
        }
      } catch (e) {
        console.log('Could not get autoTable finalY, using default')
      }
      
      doc.setFontSize(8)
      doc.text(`Report generated from ${filteredRequests.length} maintenance requests`, 20, finalY)
      
      console.log('Saving PDF...')
      doc.save(`maintenance_requests_${new Date().toISOString().split('T')[0]}.pdf`)
      console.log('PDF exported successfully!')
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Action handlers
  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setIsViewModalOpen(true)
  }

  const handleEditRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setIsEditModalOpen(true)
  }

  const handleAssignRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setIsAssignModalOpen(true)
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error

      // Refresh the data
      fetchMaintenanceRequests()
      
      // Close modals
      setIsViewModalOpen(false)
      setIsEditModalOpen(false)
      setIsAssignModalOpen(false)
      setSelectedRequest(null)

    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handlePriorityUpdate = async (requestId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ priority: newPriority })
        .eq('id', requestId)

      if (error) throw error

      // Refresh the data
      fetchMaintenanceRequests()
      
      // Close modals
      setIsEditModalOpen(false)
      setSelectedRequest(null)

    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Failed to update priority')
    }
  }


  // Fetch maintenance requests with tenant information
  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      if (selectedBuildingId === 'none') {
        // User has no building access - show empty data
        setMaintenanceRequests([])
        setStats({
          totalRequests: 0,
          pendingRequests: 0,
          inProgressRequests: 0,
          completedRequests: 0,
          averageTimeDays: 0,
          completionRate: 0,
          totalEstimatedCost: 0
        })
        return
      }

      // Get current user to check if they're a tenant
      const { data: { user } } = await supabase.auth.getUser()
      
      let viewQuery = supabase
        .from('maintenance_requests_with_tenant_info')
        .select(`
          id,
          title,
          description,
          apartment,
          apartment_id,
          priority,
          status,
          estimated_cost,
          created_at,
          tenant_name,
          building_name,
          apartment_number
        `)
        .order('created_at', { ascending: false })

      // Check if user is a tenant
      if (user) {
        console.log('Checking if user is tenant, user_id:', user.id)
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('apartment_id')
          .eq('user_id', user.id)
          .single()
        
        console.log('Tenant lookup result:', tenantData, 'Error:', tenantError)

        if (tenantData) {
          // User is a tenant - only show their maintenance requests
          console.log('User is a tenant, apartment_id:', tenantData.apartment_id)
          setIsTenant(true)
          viewQuery = viewQuery.eq('apartment_id', tenantData.apartment_id)
        } else {
          // User is admin/manager
          setIsTenant(false)
          if (selectedBuildingId !== 'all') {
            // User is admin/manager - filter by selected building
            const { data: aptIds } = await supabase
              .from('apartments')
              .select('id')
              .eq('building_id', selectedBuildingId)
            const apartmentIds = (aptIds || []).map((r: any) => r.id)
            if (apartmentIds.length > 0) {
              viewQuery = viewQuery.in('apartment_id', apartmentIds)
            } else {
              viewQuery = viewQuery.limit(0)
            }
          }
        }
      }

      const { data, error } = await viewQuery

      if (error) throw error
      
      console.log('Maintenance requests fetched:', data?.length, 'requests')
      console.log('Query result:', data)

      // Transform data to match component interface
      const transformedData: MaintenanceRequest[] = data?.map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        apartment: request.apartment,
        priority: request.priority,
        status: request.status,
        estimated_cost: request.estimated_cost,
        created_at: request.created_at,
        tenant_name: request.tenant_name || 'N/A',
        building_name: request.building_name || 'N/A',
        apartment_number: request.apartment_number || request.apartment
      })) || []

      setMaintenanceRequests(transformedData)
      calculateStats(transformedData)

    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      setError('Failed to load maintenance requests')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics from the data
  const calculateStats = (requests: MaintenanceRequest[]) => {
    const totalRequests = requests.length
    const completed = requests.filter(r => r.status === 'completed').length
    const inProgress = requests.filter(r => r.status === 'in_progress').length
    const pending = requests.filter(r => r.status === 'pending').length
    const highPriority = requests.filter(r => ['high', 'urgent'].includes(r.priority)).length
    
    // Calculate completion rate
    const completionRate = totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0
    
    // Calculate total estimated cost
    const totalEstimatedCost = requests.reduce((sum, r) => sum + parseFloat(r.estimated_cost || '0'), 0)
    
    // Calculate average completion time for completed requests
    let totalDays = 0
    let completedCount = 0
    
    requests.forEach(request => {
      if (request.status === 'completed') {
        // Since we don't have completed_at, we'll use a placeholder calculation
        // In a real scenario, you'd want to add this field to track completion time
        totalDays += 2 // Placeholder average
        completedCount++
      }
    })
    
    const averageTimeDays = completedCount > 0 ? Math.round((totalDays / completedCount) * 10) / 10 : 0

    setStats({
      totalRequests,
      completed,
      inProgress,
      pending,
      highPriority,
      averageTimeDays,
      completionRate,
      totalEstimatedCost
    })
  }

  // Load data on component mount
  useEffect(() => {
    fetchMaintenanceRequests()

    // Set up real-time subscription
    const subscription = supabase
      .channel('maintenance_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          fetchMaintenanceRequests()
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [selectedBuildingId])

  // Filter requests based on search and filters
  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.tenant_name && request.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

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

  const getCategoryIcon = (category: string) => {
    // Infer category from title/description for now
    const title = category.toLowerCase()
    if (title.includes('agua') || title.includes('fuga') || title.includes('baño') || title.includes('plumbing')) return '🚿'
    if (title.includes('luz') || title.includes('eléctric') || title.includes('electrical')) return '⚡'
    if (title.includes('aire') || title.includes('acondicionado') || title.includes('calefacción')) return '❄️'
    if (title.includes('ascensor') || title.includes('mecánic') || title.includes('persiana')) return '⚙️'
    if (title.includes('cerradura') || title.includes('puerta') || title.includes('entrada')) return '🔒'
    if (title.includes('pintura') || title.includes('limpieza') || title.includes('techo')) return '🧹'
    return '🔧'
  }

  // Prepare stats for display
  const statsCards = [
    {
      title: t('totalRequests'),
      value: stats.totalRequests,
      icon: WrenchScrewdriverIcon,
      color: 'blue' as const,
    },
    {
      title: t('completed'),
      value: stats.completed,
      icon: CheckCircleIcon,
      color: 'green' as const,
    },
    {
      title: t('inProgress'),
      value: stats.inProgress,
      icon: ClockIcon,
      color: 'yellow' as const,
    },
    {
      title: t('pending'),
      value: stats.pending,
      icon: ExclamationCircleIcon,
      color: 'red' as const,
    },
  ]

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => fetchMaintenanceRequests()} 
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

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
          
          {/* Export Dropdown */}
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>{t('export')}</span>
            </button>
            
            {/* Export Options Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={exportToCSV}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Export to CSV</span>
                </button>
                <button
                  onClick={exportToPDF}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>Export to PDF</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick CSV Export Button */}
          <button 
            onClick={exportToCSV}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 transition-colors text-sm"
            title="Quick CSV Export"
          >
            📊 CSV
          </button>
          
          {!isTenant && (
            <button 
              onClick={() => setIsNewRequestModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>{t('newRequest')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <StatsCard
            key={stat.title}
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
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">{t('highPriorityRequests')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.averageTimeDays}</div>
            <div className="text-sm text-gray-600">{t('averageTimeDays')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600">{t('completionRate')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.totalEstimatedCost.toLocaleString()}</div>
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
            <option value="urgent">{t('urgent')}</option>
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">
                          {getCategoryIcon(request.title)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {request.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.apartment}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.tenant_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {t(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {t(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(request.estimated_cost).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">ARS</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.vendor_name ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.vendor_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.vendor_category}
                          </div>
                          <div className="text-xs text-gray-400">
                            {request.vendor_contact_person}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {t('unassigned')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {!isTenant && (
                          <button 
                            onClick={() => handleEditRequest(request)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                            title="Edit Request"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {request.status === 'pending' && !isTenant && (
                          <button 
                            onClick={() => handleAssignRequest(request)}
                            className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                            title="Assign to Technician"
                          >
                            <UserPlusIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>{t('noMaintenanceRequests')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Request Modal */}
      {isViewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900">{selectedRequest.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedRequest.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apartment</label>
                  <p className="text-sm text-gray-900">{selectedRequest.apartment}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tenant</label>
                  <p className="text-sm text-gray-900">{selectedRequest.tenant_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {t(selectedRequest.priority)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {t(selectedRequest.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
                  <p className="text-sm text-gray-900">${parseFloat(selectedRequest.estimated_cost).toLocaleString()} ARS</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    handleEditRequest(selectedRequest)
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      {isEditModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Request</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => setSelectedRequest({...selectedRequest, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedRequest.priority}
                    onChange={(e) => setSelectedRequest({...selectedRequest, priority: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedRequest.id, selectedRequest.status)
                    handlePriorityUpdate(selectedRequest.id, selectedRequest.priority)
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Vendor Modal */}
      <AssignVendorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        maintenanceRequest={selectedRequest}
        onSuccess={() => {
          fetchMaintenanceRequests();
          setIsAssignModalOpen(false);
        }}
      />

      {/* New Maintenance Request Modal */}
      <NewMaintenanceRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={() => {
          // Refresh the maintenance data after creating a new request
          fetchMaintenanceRequests()
        }}
      />
    </div>
  )
}

export default Maintenance