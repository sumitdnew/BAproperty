// components/Tenants/EditTenantModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface EditTenantModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  onSuccess: () => void
}

interface TenantData {
  id: string
  user_id: string
  apartment_id: string
  phone: string
  dni: string
  emergency_contact_name: string
  emergency_contact_phone: string
  lease_start_date: string
  lease_end_date: string
  deposit_amount: number
  is_active: boolean
  user_profiles: {
    first_name: string
    last_name: string
    email?: string
  }
  apartments: {
    unit_number: string
    floor: number
    monthly_rent: number
  }
}

const EditTenantModal: React.FC<EditTenantModalProps> = ({ isOpen, onClose, tenantId, onSuccess }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenant, setTenant] = useState<TenantData | null>(null)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    dni: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    lease_start_date: '',
    lease_end_date: '',
    deposit_amount: 0,
    is_active: true
  })

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchTenantData()
    }
  }, [isOpen, tenantId])

  const fetchTenantData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          *,
          user_profiles!inner (
            first_name,
            last_name,
            email
          ),
          apartments!inner (
            unit_number,
            floor,
            monthly_rent
          )
        `)
        .eq('id', tenantId)
        .single()

      if (tenantError) throw tenantError

      setTenant(tenantData)
      setFormData({
        first_name: tenantData.user_profiles.first_name,
        last_name: tenantData.user_profiles.last_name,
        phone: tenantData.phone || '',
        dni: tenantData.dni || '',
        emergency_contact_name: tenantData.emergency_contact_name || '',
        emergency_contact_phone: tenantData.emergency_contact_phone || '',
        lease_start_date: tenantData.lease_start_date,
        lease_end_date: tenantData.lease_end_date,
        deposit_amount: tenantData.deposit_amount || 0,
        is_active: tenantData.is_active
      })

    } catch (err) {
      console.error('Error fetching tenant data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tenant data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tenant) return

    try {
      setSaving(true)
      setError(null)

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name
        })
        .eq('id', tenant.user_id)

      if (profileError) throw profileError

      // Update tenant record
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({
          phone: formData.phone,
          dni: formData.dni,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          lease_start_date: formData.lease_start_date,
          lease_end_date: formData.lease_end_date,
          deposit_amount: formData.deposit_amount,
          is_active: formData.is_active
        })
        .eq('id', tenantId)

      if (tenantError) throw tenantError

      onSuccess()
      onClose()

    } catch (err) {
      console.error('Error updating tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to update tenant')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
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

  if (error || !tenant) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">{t('error')}</h2>
            </div>
            <p className="text-gray-600 mb-4">{error || 'Tenant not found'}</p>
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
            {t('editTenant')} - {tenant.apartments.unit_number}
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

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')} *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')} *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dni')}
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('emergencyContact')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('emergencyContactName')}
                </label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('emergencyContactPhone')}
                </label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaseInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="lease_start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('leaseStartDate')} *
                </label>
                <input
                  type="date"
                  id="lease_start_date"
                  name="lease_start_date"
                  value={formData.lease_start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lease_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('leaseEndDate')} *
                </label>
                <input
                  type="date"
                  id="lease_end_date"
                  name="lease_end_date"
                  value={formData.lease_end_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('depositAmount')}
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  name="deposit_amount"
                  value={formData.deposit_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('status')}</h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                {t('activeTenant')}
              </label>
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

export default EditTenantModal

