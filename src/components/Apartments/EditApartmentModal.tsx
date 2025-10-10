// components/Apartments/EditApartmentModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface EditApartmentModalProps {
  isOpen: boolean
  onClose: () => void
  apartmentId: string
  onSuccess: () => void
}

interface ApartmentData {
  id: string
  building_id: string
  unit_number: string
  floor: number
  bedrooms: number
  bathrooms: number
  square_meters: number
  monthly_rent: number
  is_occupied: boolean
  buildings: {
    name: string
  }
}

const EditApartmentModal: React.FC<EditApartmentModalProps> = ({ isOpen, onClose, apartmentId, onSuccess }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apartment, setApartment] = useState<ApartmentData | null>(null)
  
  const [formData, setFormData] = useState({
    unit_number: '',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 0,
    monthly_rent: 0
  })

  useEffect(() => {
    if (isOpen && apartmentId) {
      fetchApartmentData()
    }
  }, [isOpen, apartmentId])

  const fetchApartmentData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: apartmentData, error: apartmentError } = await supabase
        .from('apartments')
        .select(`
          *,
          buildings!inner (
            name
          )
        `)
        .eq('id', apartmentId)
        .single()

      if (apartmentError) throw apartmentError

      setApartment(apartmentData)
      setFormData({
        unit_number: apartmentData.unit_number,
        floor: apartmentData.floor,
        bedrooms: apartmentData.bedrooms || 1,
        bathrooms: apartmentData.bathrooms || 1,
        square_meters: apartmentData.square_meters || 0,
        monthly_rent: apartmentData.monthly_rent
      })

    } catch (err) {
      console.error('Error fetching apartment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch apartment data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!apartment) return

    try {
      setSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('apartments')
        .update({
          unit_number: formData.unit_number,
          floor: formData.floor,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          square_meters: formData.square_meters,
          monthly_rent: formData.monthly_rent
        })
        .eq('id', apartmentId)

      if (updateError) throw updateError

      onSuccess()
      onClose()

    } catch (err) {
      console.error('Error updating apartment:', err)
      setError(err instanceof Error ? err.message : 'Failed to update apartment')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('editApartment')} - {apartment.unit_number}
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

          {/* Building Info (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('building')}
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {apartment.buildings.name}
            </p>
          </div>

          {/* Unit Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('unitInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="unit_number" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('unitNumber')} *
                </label>
                <input
                  type="text"
                  id="unit_number"
                  name="unit_number"
                  value={formData.unit_number}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('floor')} *
                </label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bedrooms')}
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bathrooms')}
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  step="0.5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="square_meters" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('squareMeters')}
                </label>
                <input
                  type="number"
                  id="square_meters"
                  name="square_meters"
                  value={formData.square_meters}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('monthlyExpense')} *
                </label>
                <input
                  type="number"
                  id="monthly_rent"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

export default EditApartmentModal

