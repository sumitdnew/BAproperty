// components/Apartments/ViewApartmentModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon, HomeIcon, MapPinIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'

interface ViewApartmentModalProps {
  isOpen: boolean
  onClose: () => void
  apartmentId: string
}

interface ApartmentDetails {
  id: string
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
      phone: string
    }
    lease_start_date: string
    lease_end_date: string
    deposit_amount: number
  }[]
}

const ViewApartmentModal: React.FC<ViewApartmentModalProps> = ({ isOpen, onClose, apartmentId }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apartment, setApartment] = useState<ApartmentDetails | null>(null)

  useEffect(() => {
    if (isOpen && apartmentId) {
      fetchApartmentDetails()
    }
  }, [isOpen, apartmentId])

  const fetchApartmentDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: apartmentData, error: apartmentError } = await supabase
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
              last_name,
              phone
            ),
            lease_start_date,
            lease_end_date,
            deposit_amount
          )
        `)
        .eq('id', apartmentId)
        .single()

      if (apartmentError) throw apartmentError

      setApartment(apartmentData)

    } catch (err) {
      console.error('Error fetching apartment details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch apartment details')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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

  if (error || !apartment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('error')}</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Apartment not found'}</p>
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

  const currentTenant = apartment.tenants?.[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {apartment.unit_number} - {apartment.buildings.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Apartment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <HomeIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-600">{t('unitNumber')}</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {apartment.unit_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-600">{t('monthlyExpense')}</p>
                  <p className="text-lg font-semibold text-green-900">
                    ${apartment.monthly_rent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <MapPinIcon className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-purple-600">{t('status')}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    apartment.is_occupied 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {apartment.is_occupied ? t('occupied') : t('available')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Building Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('buildingInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('buildingName')}</label>
                <p className="text-gray-900 mt-1">{apartment.buildings.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('location')}</label>
                <p className="text-gray-900 mt-1">{apartment.buildings.city}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">{t('address')}</label>
                <p className="text-gray-900 mt-1">{apartment.buildings.address}</p>
              </div>
            </div>
          </div>

          {/* Unit Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('unitDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">{t('floor')}</label>
                <p className="text-gray-900 mt-1">{apartment.floor}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('bedrooms')}</label>
                <p className="text-gray-900 mt-1">{apartment.bedrooms}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('bathrooms')}</label>
                <p className="text-gray-900 mt-1">{apartment.bathrooms}</p>
              </div>

              {apartment.square_meters && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">{t('squareMeters')}</label>
                  <p className="text-gray-900 mt-1">{apartment.square_meters} m²</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600">{t('created')}</label>
                <div className="flex items-center mt-1">
                  <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">
                    {new Date(apartment.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Tenant Information */}
          {currentTenant && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('currentTenant')}</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">{t('tenantName')}</label>
                    <p className="text-gray-900 mt-1">
                      {currentTenant.user_profiles.first_name} {currentTenant.user_profiles.last_name}
                    </p>
                  </div>

                  {currentTenant.user_profiles.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">{t('phone')}</label>
                      <p className="text-gray-900 mt-1">{currentTenant.user_profiles.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-600">{t('leaseStartDate')}</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(currentTenant.lease_start_date).toLocaleDateString('es-AR')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">{t('leaseEndDate')}</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(currentTenant.lease_end_date).toLocaleDateString('es-AR')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">{t('depositAmount')}</label>
                    <p className="text-gray-900 mt-1">
                      ${currentTenant.deposit_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default ViewApartmentModal

