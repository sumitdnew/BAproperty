// components/Modals/NewMaintenanceRequestModal.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewMaintenanceRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const NewMaintenanceRequestModal: React.FC<NewMaintenanceRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError(t('pleaseFillAllFields'))
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get tenant's apartment_id
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('apartment_id, apartments!inner (unit_number)')
        .eq('user_id', user.id)
        .single()

      if (tenantError || !tenantData) {
        throw new Error('Tenant information not found')
      }

      // Create maintenance request
      const { error: insertError } = await supabase
        .from('maintenance_requests')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: 'pending',
          apartment: tenantData.apartments.unit_number,
          apartment_id: tenantData.apartment_id,
          tenant_id: user.id // Store the user ID as tenant_id
        })

      if (insertError) {
        throw insertError
      }

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      })
      onSuccess()
      onClose()

    } catch (error: any) {
      console.error('Error creating maintenance request:', error)
      setError(error.message || t('errorCreatingRequest'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      })
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('newMaintenanceRequest')}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                {t('title')} *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('enterRequestTitle')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                {t('priority')} *
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')} *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('describeTheIssue')}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? t('submitting') : t('submitRequest')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewMaintenanceRequestModal