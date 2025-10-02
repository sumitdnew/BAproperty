// components/Buildings/ViewBuildingModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon, MapPinIcon, HomeIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface ViewBuildingModalProps {
  isOpen: boolean
  onClose: () => void
  buildingId: string
}

interface BuildingDetails {
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
  apartment_count: number
  occupied_apartments: number
  available_apartments: number
}

interface Apartment {
  id: string
  unit_number: string
  floor: number
  bedrooms: number
  bathrooms: number
  square_meters: number
  monthly_rent: number
  is_occupied: boolean
  tenants?: {
    first_name: string
    last_name: string
  }
}

const ViewBuildingModal: React.FC<ViewBuildingModalProps> = ({ isOpen, onClose, buildingId }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [building, setBuilding] = useState<BuildingDetails | null>(null)
  const [apartments, setApartments] = useState<Apartment[]>([])

  useEffect(() => {
    if (isOpen && buildingId) {
      fetchBuildingDetails()
    }
  }, [isOpen, buildingId])

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch building details
      const { data: buildingData, error: buildingError } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single()

      if (buildingError) throw buildingError

      // Fetch apartments with tenant information
      const { data: apartmentsData, error: apartmentsError } = await supabase
        .from('apartments')
        .select(`
          *,
          tenants!left (
            user_profiles!left (
              first_name,
              last_name
            )
          )
        `)
        .eq('building_id', buildingId)
        .order('floor', { ascending: true })
        .order('unit_number', { ascending: true })

      if (apartmentsError) throw apartmentsError

      // Process apartments data
      const processedApartments: Apartment[] = apartmentsData?.map(apt => ({
        id: apt.id,
        unit_number: apt.unit_number,
        floor: apt.floor,
        bedrooms: apt.bedrooms || 1,
        bathrooms: apt.bathrooms || 1,
        square_meters: apt.square_meters,
        monthly_rent: apt.monthly_rent,
        is_occupied: apt.is_occupied,
        tenants: apt.tenants?.[0]?.user_profiles ? {
          first_name: apt.tenants[0].user_profiles.first_name,
          last_name: apt.tenants[0].user_profiles.last_name
        } : undefined
      })) || []

      // Calculate apartment statistics
      const apartmentCount = processedApartments.length
      const occupiedCount = processedApartments.filter(apt => apt.is_occupied).length
      const availableCount = apartmentCount - occupiedCount

      const buildingDetails: BuildingDetails = {
        ...buildingData,
        apartment_count: apartmentCount,
        occupied_apartments: occupiedCount,
        available_apartments: availableCount
      }

      setBuilding(buildingDetails)
      setApartments(processedApartments)

    } catch (err) {
      console.error('Error fetching building details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch building details')
    } finally {
      setLoading(false)
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

  if (error || !building) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('error')}</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Building not found'}</p>
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
            {building.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Building Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('totalApartments')}</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {building.apartment_count}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <HomeIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">{t('occupiedApartments')}</p>
                  <p className="text-lg font-semibold text-green-900">
                    {building.occupied_apartments}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapPinIcon className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('availableApartments')}</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {building.available_apartments}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Building Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('buildingInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('address')}</label>
                <div className="flex items-center mt-1">
                  <MapPinIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{building.address}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('location')}</label>
                <p className="text-gray-900 mt-1">{building.city}, {building.province}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('postalCode')}</label>
                <p className="text-gray-900 mt-1">{building.postal_code || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('created')}</label>
                <div className="flex items-center mt-1">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {new Date(building.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {building.amenities && building.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('amenities')}</h3>
              <div className="flex flex-wrap gap-2">
                {building.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apartments List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('apartments')}</h3>
            {apartments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('unit')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('floor')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('bedrooms')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('bathrooms')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('rent')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('tenant')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apartments.map((apartment) => (
                      <tr key={apartment.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {apartment.unit_number}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {apartment.floor}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {apartment.bedrooms}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {apartment.bathrooms}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ${apartment.monthly_rent.toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            apartment.is_occupied 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {apartment.is_occupied ? t('occupied') : t('available')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {apartment.tenants 
                            ? `${apartment.tenants.first_name} ${apartment.tenants.last_name}`
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">{t('noApartmentsFound')}</p>
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

export default ViewBuildingModal

