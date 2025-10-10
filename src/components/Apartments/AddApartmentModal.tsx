// components/Apartments/AddApartmentModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface AddApartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Building {
  id: string
  name: string
  address: string
  city: string
}

interface ApartmentFormData {
  building_id: string
  unit_number: string
  floor: number | ''
  bedrooms: number | ''
  bathrooms: number | ''
  square_meters: number | ''
  monthly_rent: number | ''
  monthly_expenses: number | ''
}

const AddApartmentModal: React.FC<AddApartmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  
  const [formData, setFormData] = useState<ApartmentFormData>({
    building_id: '',
    unit_number: '',
    floor: 1,
    bedrooms: '',
    bathrooms: '',
    square_meters: '',
    monthly_rent: '',
    monthly_expenses: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchBuildings()
    }
  }, [isOpen])

  const fetchBuildings = async () => {
    try {
      const { data: buildingsData, error: buildingsError } = await supabase
        .from('buildings')
        .select('id, name, address, city')
        .order('name', { ascending: true })

      if (buildingsError) throw buildingsError
      setBuildings(buildingsData || [])
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError('Failed to load buildings')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const { error: insertError } = await supabase
        .from('apartments')
        .insert({
          building_id: formData.building_id,
          unit_number: formData.unit_number,
          floor: typeof formData.floor === 'number' ? formData.floor : Number(formData.floor || 0),
          bedrooms: typeof formData.bedrooms === 'number' ? formData.bedrooms : Number(formData.bedrooms || 0),
          bathrooms: typeof formData.bathrooms === 'number' ? formData.bathrooms : Number(formData.bathrooms || 0),
          square_meters: formData.square_meters === '' ? 0 : Number(formData.square_meters),
          monthly_rent: typeof formData.monthly_rent === 'number' ? formData.monthly_rent : Number(formData.monthly_rent || 0),
          monthly_expenses: typeof formData.monthly_expenses === 'number' ? formData.monthly_expenses : Number(formData.monthly_expenses || 0)
        })

      if (insertError) throw insertError

      // Reset form
      setFormData({
        building_id: '',
        unit_number: '',
        floor: 1,
        bedrooms: '',
        bathrooms: '',
        square_meters: '',
        monthly_rent: '',
        monthly_expenses: ''
      })

      onSuccess()
      onClose()

    } catch (err) {
      console.error('Error creating apartment:', err)
      setError(err instanceof Error ? err.message : 'Failed to create apartment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('addNewApartment')}
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

          {/* Building Selection */}
          <div>
            <label htmlFor="building_id" className="block text-sm font-medium text-gray-700 mb-1">
              {t('building')} *
            </label>
            <select
              id="building_id"
              name="building_id"
              value={formData.building_id}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('selectBuilding')}</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} - {building.city}
                </option>
              ))}
            </select>
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
                  placeholder="e.g., 1A, 2B, 3C"
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
                  {t('monthlyRent')}
                </label>
                <input
                  type="number"
                  id="monthly_rent"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="monthly_expenses" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('monthlyExpenses')}
                </label>
                <input
                  type="number"
                  id="monthly_expenses"
                  name="monthly_expenses"
                  value={formData.monthly_expenses}
                  onChange={handleInputChange}
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('creating') : t('createApartment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddApartmentModal
