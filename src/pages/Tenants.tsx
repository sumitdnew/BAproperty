// pages/Tenants.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'
import { 
  EnvelopeIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import ViewTenantModal from '../components/Tenants/ViewTenantModal'
import EditTenantModal from '../components/Tenants/EditTenantModal'
import InviteTenantModal from '../components/Tenants/InviteTenantModalSimple'

// Enhanced Tenant interface for admin list
interface TenantWithPaymentStatus {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  dni: string
  apartment: string
  floor: number
  monthly_rent: number
  lease_start_date: string
  lease_end_date: string
  is_active: boolean
  emergency_contact_name: string
  emergency_contact_phone: string
  lease_status: 'active' | 'ending_soon' | 'expired' | 'inactive'
}

const Tenants: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [tenantsWithPaymentStatus, setTenantsWithPaymentStatus] = useState<TenantWithPaymentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    leasesExpiringSoon: 0,
    averageRent: 0,
    overduePayments: 0
  })
  
  // Modal states
  const [showInviteTenantModal, setShowInviteTenantModal] = useState(false)
  const [showViewTenantModal, setShowViewTenantModal] = useState(false)
  const [showEditTenantModal, setShowEditTenantModal] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')

  const { selectedBuildingId } = useBuildingContext()

  // Fetch tenants data directly
  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching tenants directly...')

      // Query tenants first, then get related data separately
      let tenantsQuery = supabase
        .from('tenants')
        .select('*, apartments!inner ( building_id )')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (selectedBuildingId !== 'all') {
        tenantsQuery = tenantsQuery.eq('apartments.building_id', selectedBuildingId)
      }
      const { data: tenantsData, error: tenantsError } = await tenantsQuery

      if (tenantsError) throw tenantsError

      console.log('Raw tenants data:', tenantsData)

      // Get user profiles for all tenants
      const tenantUserIds = tenantsData?.map(t => t.user_id).filter(Boolean) || []
      const { data: userProfiles, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', tenantUserIds)

      if (userProfilesError) throw userProfilesError

      console.log('User profiles:', userProfiles)

      // Compute apartment IDs next, then fetch emails via invitations (client-safe)
      const tenantApartmentIds = tenantsData?.map(t => t.apartment_id).filter(Boolean) || []
      const authIdsExpr = tenantUserIds.length ? `auth_user_id.in.(${tenantUserIds.join(',')})` : ''
      const aptIdsExpr = tenantApartmentIds.length ? `apartment_id.in.(${tenantApartmentIds.join(',')})` : ''
      const orExpr = [authIdsExpr, aptIdsExpr].filter(Boolean).join(',') || 'id.not.is.null'
      const { data: invitationRows, error: invitesError } = await supabase
        .from('invitations')
        .select('auth_user_id, apartment_id, email, status, accepted_at, expires_at, id')
        .or(orExpr)
      if (invitesError) {
        console.warn('Could not load invitations for emails:', invitesError)
      }
      const userIdToEmail = new Map<string, string>()
      const apartmentIdToEmail = new Map<string, string>()
      ;(invitationRows || []).forEach(row => {
        if (row.auth_user_id && row.email && !userIdToEmail.has(row.auth_user_id)) {
          userIdToEmail.set(row.auth_user_id, row.email)
        }
        if (row.apartment_id && row.email && !apartmentIdToEmail.has(row.apartment_id)) {
          apartmentIdToEmail.set(row.apartment_id, row.email)
        }
      })

      const { data: apartments, error: apartmentsError } = await supabase
        .from('apartments')
        .select('id, unit_number, floor, monthly_rent')
        .in('id', tenantApartmentIds)

      if (apartmentsError) throw apartmentsError

      console.log('Apartments:', apartments)

      if (tenantsError) throw tenantsError

      console.log('Tenants data:', tenantsData)
      console.log('First tenant structure:', tenantsData?.[0])
      console.log('First tenant user_profiles:', tenantsData?.[0]?.user_profiles)
      console.log('First tenant apartments:', tenantsData?.[0]?.apartments)

      // We are not showing payment status in the table anymore

      // Transform tenants with payment status
      const enhancedTenants: TenantWithPaymentStatus[] = tenantsData?.map(tenant => {
        const today = new Date()
        const leaseEnd = new Date(tenant.lease_end_date)
        const daysUntilExpiry = Math.ceil((leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        // Find related user profile and apartment
        const userProfile = userProfiles?.find(up => up.id === tenant.user_id)
        const apartment = apartments?.find(apt => apt.id === tenant.apartment_id)
        const email = (userProfile as any)?.email || userIdToEmail.get(tenant.user_id) || apartmentIdToEmail.get(tenant.apartment_id) || ''
        
        let leaseStatus: 'active' | 'ending_soon' | 'expired' | 'inactive' = 'active'
        if (daysUntilExpiry < 0) {
          leaseStatus = 'expired'
        } else if (daysUntilExpiry <= 30) {
          leaseStatus = 'ending_soon'
        } else if (!tenant.is_active) {
          leaseStatus = 'inactive'
        }

        return {
          id: tenant.id,
          first_name: userProfile?.first_name || 'Unknown',
          last_name: userProfile?.last_name || 'Unknown',
          email,
          phone: tenant.phone || '',
          dni: tenant.dni || '',
          apartment: apartment?.unit_number || 'Unknown',
          floor: apartment?.floor || 0,
          monthly_rent: apartment?.monthly_rent || 0,
          lease_start_date: tenant.lease_start_date,
          lease_end_date: tenant.lease_end_date,
          is_active: tenant.is_active,
          emergency_contact_name: tenant.emergency_contact_name || '',
          emergency_contact_phone: tenant.emergency_contact_phone || '',
          lease_status: leaseStatus
        }
      }) || []

      console.log('Enhanced tenants:', enhancedTenants)

      setTenantsWithPaymentStatus(enhancedTenants)

      // Calculate statistics
      const totalTenants = enhancedTenants.length
      const activeTenants = enhancedTenants.filter(t => t.lease_status === 'active').length
      const leasesExpiringSoon = enhancedTenants.filter(t => t.lease_status === 'ending_soon').length
      const overduePayments = 0
      const averageRent = enhancedTenants.length > 0 
        ? Math.round(enhancedTenants.reduce((sum, t) => sum + t.monthly_rent, 0) / enhancedTenants.length)
        : 0

      setStats({
        totalTenants,
        activeTenants,
        leasesExpiringSoon,
        averageRent,
        overduePayments
      })

    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tenants')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchTenants()
  }, [selectedBuildingId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200'
      case 'ending_soon': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'expired': return 'bg-red-100 text-red-800 border border-red-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  // removed payment status color helper (email shown instead)

  const filteredTenants = tenantsWithPaymentStatus.filter(tenant => {
    const matchesSearch = `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.apartment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tenant.lease_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Modal handlers
  const handleInviteTenant = () => {
    setShowInviteTenantModal(true)
  }

  const handleViewTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setShowViewTenantModal(true)
  }

  const handleEditTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId)
    setShowEditTenantModal(true)
  }

  const handleModalSuccess = () => {
    fetchTenants() // Refresh the tenants list
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="animate-pulse">
            <div className="h-6 bg-blue-500 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-500 rounded w-1/2"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => fetchTenants()} 
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
          <h1 className="text-2xl font-bold text-gray-900">{t('tenants')}</h1>
          <p className="text-gray-600 mt-1">{t('manageTenantsAndLeases')}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleInviteTenant}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <EnvelopeIcon className="w-4 h-4" />
            <span>{t('inviteNewTenant')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalTenants')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTenants}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('activeTenants')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeTenants}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 border border-green-200">
              <HomeIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('leasesExpiringSoon')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.leasesExpiringSoon}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('averageRent')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.averageRent.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 border border-purple-200">
              <PhoneIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Payments Alert */}
      {stats.overduePayments > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">
              {t('overduePaymentsAlert', { count: stats.overduePayments })}
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchTenants')}
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
            <option value="active">{t('active')}</option>
            <option value="ending_soon">{t('endingSoon')}</option>
            <option value="expired">{t('expired')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('tenantsList')} ({filteredTenants.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredTenants.length} {t('of')} {stats.totalTenants}
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
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leaseStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {tenant.first_name[0]}{tenant.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.first_name} {tenant.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {tenant.dni}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.apartment}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('floor')} {tenant.floor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${tenant.monthly_rent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      ARS / {t('month')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tenant.lease_status)}`}>
                      {t(tenant.lease_status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('until')} {new Date(tenant.lease_end_date).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.phone}</div>
                    <div className="text-sm text-gray-500">{tenant.emergency_contact_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewTenant(tenant.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        {t('view')}
                      </button>
                      <button 
                        onClick={() => handleEditTenant(tenant.id)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        {t('edit')}
                      </button>
                      <button 
                        onClick={() => {
                          if (tenant.email) {
                            window.open(`mailto:${tenant.email}`, '_blank')
                          }
                        }}
                        disabled={!tenant.email}
                        className={`transition-colors ${
                          tenant.email 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={tenant.email ? `Send email to ${tenant.email}` : 'No email available'}
                      >
                        {t('contact')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">{t('noTenantsFound')}</p>
            <p className="text-gray-400">{t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteTenantModal
        isOpen={showInviteTenantModal}
        onClose={() => setShowInviteTenantModal(false)}
        onSuccess={handleModalSuccess}
      />

      <ViewTenantModal
        isOpen={showViewTenantModal}
        onClose={() => setShowViewTenantModal(false)}
        tenantId={selectedTenantId}
      />

      <EditTenantModal
        isOpen={showEditTenantModal}
        onClose={() => setShowEditTenantModal(false)}
        tenantId={selectedTenantId}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default Tenants