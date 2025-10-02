// components/Buildings/EditBuildingModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface EditBuildingModalProps {
  isOpen: boolean
  onClose: () => void
  buildingId: string
  onSuccess: () => void
}

interface BuildingData {
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
}

const EditBuildingModal: React.FC<EditBuildingModalProps> = ({ isOpen, onClose, buildingId, onSuccess }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [building, setBuilding] = useState<BuildingData | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    total_apartments: 0,
    amenities: [] as string[]
  })

  const [newAmenity, setNewAmenity] = useState('')

  useEffect(() => {
    if (isOpen && buildingId) {
      fetchBuildingData()
    }
  }, [isOpen, buildingId])

  const fetchBuildingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: buildingData, error: buildingError } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single()

      if (buildingError) throw buildingError

      setBuilding(buildingData)
      setFormData({
        name: buildingData.name,
        address: buildingData.address,
        city: buildingData.city,
        province: buildingData.province,
        postal_code: buildingData.postal_code || '',
        total_apartments: buildingData.total_apartments,
        amenities: buildingData.amenities || []
      })

    } catch (err) {
      console.error('Error fetching building data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch building data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }))
      setNewAmenity('')
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!building) return

    try {
      setSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('buildings')
        .update({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          total_apartments: formData.total_apartments,
          amenities: formData.amenities,
          updated_at: new Date().toISOString()
        })
        .eq('id', buildingId)

      if (updateError) throw updateError

      onSuccess()
      onClose()

    } catch (err) {
      console.error('Error updating building:', err)
      setError(err instanceof Error ? err.message : 'Failed to update building')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('editBuilding')} - {building.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('basicInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buildingName')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('address')} *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('city')} *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('province')} *
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postalCode')}
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="total_apartments" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('totalApartments')} *
                </label>
                <input
                  type="number"
                  id="total_apartments"
                  name="total_apartments"
                  value={formData.total_apartments}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('amenities')}</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder={t('addAmenity')}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('add')}
                </button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBuildingModal

