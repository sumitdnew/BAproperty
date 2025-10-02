// pages/Apartments.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'
import { 
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import AddApartmentModal from '../components/Apartments/AddApartmentModal'
import EditApartmentModal from '../components/Apartments/EditApartmentModal'
import ViewApartmentModal from '../components/Apartments/ViewApartmentModal'

interface Apartment {
  id: string
  building_id: string
  unit_number: string
  floor: number
  bedrooms: number
  bathrooms: number
  square_meters: number
  monthly_rent: number
  is_occupied: boolean
  created_at: string
  buildings: {
    name: string
    address: string
    city: string
  }
  tenants?: {
    user_profiles: {
      first_name: string
      last_name: string
    }
  }[]
}

const Apartments: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalApartments: 0,
    occupiedApartments: 0,
    availableApartments: 0,
    averageRent: 0
  })
  
  // Modal states
  const [showAddApartmentModal, setShowAddApartmentModal] = useState(false)
  const [showEditApartmentModal, setShowEditApartmentModal] = useState(false)
  const [showViewApartmentModal, setShowViewApartmentModal] = useState(false)
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>('')

  const { selectedBuildingId } = useBuildingContext()

  // Fetch apartments data
  const fetchApartments = async () => {
    try {
      setLoading(true)
      setError(null)

      let apartmentsQuery = supabase
        .from('apartments')
        .select(`
          *,
          buildings!inner (
            name,
            address,
            city
          ),
          tenants!left (
            user_profiles!left (
              first_name,
              last_name
            )
          )
        `)
        .order('floor', { ascending: true })
        .order('unit_number', { ascending: true })

      if (selectedBuildingId !== 'all') {
        apartmentsQuery = apartmentsQuery.eq('building_id', selectedBuildingId)
      }

      const { data: apartmentsData, error: apartmentsError } = await apartmentsQuery

      if (apartmentsError) throw apartmentsError

      setApartments(apartmentsData || [])

      // Calculate statistics
      const totalApartments = apartmentsData?.length || 0
      const occupiedApartments = apartmentsData?.filter(apt => apt.is_occupied).length || 0
      const availableApartments = totalApartments - occupiedApartments
      const averageRent = totalApartments > 0 
        ? Math.round(apartmentsData?.reduce((sum, apt) => sum + apt.monthly_rent, 0) / totalApartments) || 0
        : 0

      setStats({
        totalApartments,
        occupiedApartments,
        availableApartments,
        averageRent
      })

    } catch (err) {
      console.error('Error fetching apartments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch apartments')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchApartments()
  }, [selectedBuildingId])

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.buildings.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.buildings.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'occupied' && apartment.is_occupied) ||
                         (statusFilter === 'available' && !apartment.is_occupied)
    
    return matchesSearch && matchesStatus
  })

  // Modal handlers
  const handleAddApartment = () => {
    setShowAddApartmentModal(true)
  }

  const handleEditApartment = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId)
    setShowEditApartmentModal(true)
  }

  const handleViewApartment = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId)
    setShowViewApartmentModal(true)
  }

  const handleModalSuccess = () => {
    fetchApartments() // Refresh the apartments list
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
            onClick={() => fetchApartments()} 
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
          <h1 className="text-2xl font-bold text-gray-900">{t('apartments')}</h1>
          <p className="text-gray-600 mt-1">{t('manageApartmentsAndUnits')}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleAddApartment}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('addApartment')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('occupiedApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.occupiedApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 border border-red-200">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('availableApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.availableApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 border border-green-200">
              <MapPinIcon className="w-6 h-6 text-green-600" />
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
              <BuildingOfficeIcon className="w-6 h-6 text-purple-600" />
            </div>
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
              placeholder={t('searchApartments')}
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
            <option value="occupied">{t('occupied')}</option>
            <option value="available">{t('available')}</option>
          </select>
        </div>
      </div>

      {/* Apartments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('apartmentsList')} ({filteredApartments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredApartments.length} {t('of')} {stats.totalApartments}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('unit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('building')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('floor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bedrooms')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApartments.map((apartment) => (
                <tr key={apartment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apartment.unit_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apartment.buildings.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {apartment.buildings.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {apartment.floor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {apartment.bedrooms} bed, {apartment.bathrooms} bath
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${apartment.monthly_rent.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      ARS / {t('month')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      apartment.is_occupied 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {apartment.is_occupied ? t('occupied') : t('available')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {apartment.tenants && apartment.tenants.length > 0
                        ? `${apartment.tenants[0].user_profiles.first_name} ${apartment.tenants[0].user_profiles.last_name}`
                        : '—'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewApartment(apartment.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        {t('view')}
                      </button>
                      <button 
                        onClick={() => handleEditApartment(apartment.id)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        {t('edit')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredApartments.length === 0 && (
          <div className="text-center py-12">
            <HomeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">{t('noApartmentsFound')}</p>
          <p className="text-gray-400">{t('tryAdjustingFilters')}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddApartmentModal
        isOpen={showAddApartmentModal}
        onClose={() => setShowAddApartmentModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditApartmentModal
        isOpen={showEditApartmentModal}
        onClose={() => setShowEditApartmentModal(false)}
        apartmentId={selectedApartmentId}
        onSuccess={handleModalSuccess}
      />

      <ViewApartmentModal
        isOpen={showViewApartmentModal}
        onClose={() => setShowViewApartmentModal(false)}
        apartmentId={selectedApartmentId}
      />
    </div>
  )
}

export default Apartments
