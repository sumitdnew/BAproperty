// pages/Buildings.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'
import { 
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import AddBuildingModal from '../components/Buildings/AddBuildingModal'
import EditBuildingModal from '../components/Buildings/EditBuildingModal'
import ViewBuildingModal from '../components/Buildings/ViewBuildingModal'

interface Building {
  id: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  total_apartments: number
  amenities: string[]
  created_at: string
  updated_at: string
  apartment_count?: number
  occupied_apartments?: number
}

const Buildings: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalBuildings: 0,
    totalApartments: 0,
    occupiedApartments: 0,
    availableApartments: 0
  })
  
  // Modal states
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false)
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false)
  const [showViewBuildingModal, setShowViewBuildingModal] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('')

  const { selectedBuildingId: contextBuildingId, setSelectedBuildingId: setContextBuildingId } = useBuildingContext()

  // Fetch buildings data
  const fetchBuildings = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch buildings with apartment counts
      const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select(`
          *,
          apartments (
            id,
            is_occupied
          )
        `)
        .order('created_at', { ascending: false })

      if (buildingsError) throw buildingsError

      // Process buildings data to include apartment counts
      const processedBuildings: Building[] = buildingsData?.map(building => {
        const apartments = building.apartments || []
        const apartmentCount = apartments.length
        const occupiedCount = apartments.filter((apt: any) => apt.is_occupied).length

        return {
          ...building,
          apartment_count: apartmentCount,
          occupied_apartments: occupiedCount
        }
      }) || []

      setBuildings(processedBuildings)

      // Calculate statistics
      const totalBuildings = processedBuildings.length
      const totalApartments = processedBuildings.reduce((sum, b) => sum + (b.apartment_count || 0), 0)
      const occupiedApartments = processedBuildings.reduce((sum, b) => sum + (b.occupied_apartments || 0), 0)
      const availableApartments = totalApartments - occupiedApartments

      setStats({
        totalBuildings,
        totalApartments,
        occupiedApartments,
        availableApartments
      })

    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch buildings')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchBuildings()
  }, [])

  const filteredBuildings = buildings.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Modal handlers
  const handleAddBuilding = () => {
    setShowAddBuildingModal(true)
  }

  const handleEditBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId)
    setShowEditBuildingModal(true)
  }

  const handleViewBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId)
    setShowViewBuildingModal(true)
  }

  const handleModalSuccess = () => {
    fetchBuildings() // Refresh the buildings list
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
            onClick={() => fetchBuildings()} 
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
          <h1 className="text-2xl font-bold text-gray-900">{t('buildings')}</h1>
          <p className="text-gray-600 mt-1">{t('manageBuildingsAndProperties')}</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleAddBuilding}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>{t('addBuilding')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalBuildings')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBuildings}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 border border-green-200">
              <HomeIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('occupiedApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.occupiedApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
              <CalendarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('availableApartments')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.availableApartments}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 border border-purple-200">
              <MapPinIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchBuildings')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buildings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuildings.map((building) => (
          <div key={building.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{building.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{building.city}, {building.province}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{building.address}</p>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleViewBuilding(building.id)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                        {t('view')}
                  </button>
                  <button 
                    onClick={() => handleEditBuilding(building.id)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                        {t('edit')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{building.apartment_count || 0}</p>
                  <p className="text-xs text-gray-500">{t('totalUnits')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{building.occupied_apartments || 0}</p>
                  <p className="text-xs text-gray-500">{t('occupied')}</p>
                </div>
              </div>

              {building.amenities && building.amenities.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">{t('amenities')}</p>
                  <div className="flex flex-wrap gap-1">
                    {building.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {building.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{building.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{t('created')} {new Date(building.created_at).toLocaleDateString()}</span>
                <span>{t('postalCode')}: {building.postal_code || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBuildings.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">{t('noBuildingsFound')}</p>
          <p className="text-gray-400 mb-4">{t('getStartedByAddingYourFirstBuilding')}</p>
          <button 
            onClick={handleAddBuilding}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('addFirstBuilding')}
          </button>
        </div>
      )}

      {/* Modals */}
      <AddBuildingModal
        isOpen={showAddBuildingModal}
        onClose={() => setShowAddBuildingModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditBuildingModal
        isOpen={showEditBuildingModal}
        onClose={() => setShowEditBuildingModal(false)}
        buildingId={selectedBuildingId}
        onSuccess={handleModalSuccess}
      />

      <ViewBuildingModal
        isOpen={showViewBuildingModal}
        onClose={() => setShowViewBuildingModal(false)}
        buildingId={selectedBuildingId}
      />
    </div>
  )
}

export default Buildings
