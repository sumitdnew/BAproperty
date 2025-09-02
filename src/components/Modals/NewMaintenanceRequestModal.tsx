import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewMaintenanceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface MaintenanceRequestForm {
  title: string
  description: string
  apartment: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_cost: string
}

const NewMaintenanceRequestModal: React.FC<NewMaintenanceRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apartments, setApartments] = useState<Array<{ id: string; unit_number: string; tenant_id: string | null }>>([])

  const [formData, setFormData] = useState<MaintenanceRequestForm>({
    title: '',
    description: '',
    apartment: '',
    priority: 'medium',
    estimated_cost: ''
  })

  // Fetch apartments when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchApartments()
    }
  }, [isOpen])

    const fetchApartments = async () => {
    try {
      // Get apartments with their tenant information using a join
      const { data, error } = await supabase
        .from('apartments')
        .select(`
          id,
          unit_number
        `)
        .order('unit_number')
      
      if (error) throw error

      // For each apartment, check if there's an active tenant
      const apartmentsWithTenants = await Promise.all(
        data.map(async (apartment) => {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('id')
            .eq('apartment_id', apartment.id)
            .eq('is_active', true)
            .maybeSingle()
          
          return {
            id: apartment.id,
            unit_number: apartment.unit_number,
            tenant_id: tenantData?.id || null
          }
        })
      )
      
      setApartments(apartmentsWithTenants)
    } catch (error) {
      console.error('Error fetching apartments:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'estimated_cost') {
      // Only allow valid number input (digits, decimal point, empty string)
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate estimated cost
      if (formData.estimated_cost && isNaN(parseFloat(formData.estimated_cost))) {
        throw new Error('Please enter a valid estimated cost')
      }
      
      // Get apartment ID and tenant ID from unit number
      const apartment = apartments.find(apt => apt.unit_number === formData.apartment)
      if (!apartment) {
        throw new Error('Invalid apartment selected')
      }

                     const { error } = await supabase
          .from('maintenance_requests')
          .insert({
            title: formData.title,
            description: formData.description,
            apartment: formData.apartment,
            apartment_id: apartment.id,
            tenant_id: apartment.tenant_id, // Include the tenant_id from the apartment
            priority: formData.priority,
            estimated_cost: parseFloat(formData.estimated_cost) || 0,
            status: 'pending'
          })

      if (error) throw error

                     // Reset form and close modal
        setFormData({
          title: '',
          description: '',
          apartment: '',
          priority: 'medium',
          estimated_cost: ''
        })
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating maintenance request:', error)
      setError(error instanceof Error ? error.message : 'Failed to create maintenance request')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('newRequest')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('title')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('enterRequestTitle')}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('describeTheIssue')}
            />
          </div>

          {/* Apartment and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Apartment */}
            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                {t('apartment')} *
              </label>
              <select
                id="apartment"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('selectApartment')}</option>
                {apartments.map((apt) => (
                  <option key={apt.id} value={apt.unit_number}>
                    {apt.unit_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                {t('priority')} *
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>
          </div>

                     {/* Estimated Cost */}
           <div>
             <label htmlFor="estimated_cost" className="block text-sm font-medium text-gray-700 mb-2">
               {t('estimatedCost')} ($)
             </label>
             <input
               type="number"
               id="estimated_cost"
               name="estimated_cost"
               value={formData.estimated_cost}
               onChange={handleInputChange}
               min="0"
               step="0.01"
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="0.00"
             />
           </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('creating') : t('createRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewMaintenanceRequestModal
