// components/Tenants/AddTenantModal.tsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useBuildingContext } from '../../context/BuildingContext'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AddTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Apartment {
  id: string
  unit_number: string
  floor: number
  monthly_rent: number
  is_occupied: boolean
}

const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { selectedBuildingId } = useBuildingContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apartments, setApartments] = useState<Apartment[]>([])
  
  const [formData, setFormData] = useState({
    // User profile data
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    dni: '',
    cuit_cuil: '',
    
    // Tenant data
    apartment_id: '',
    lease_start_date: '',
    lease_end_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    is_active: true
  })

  // Fetch available apartments for the selected building
  useEffect(() => {
    if (isOpen && selectedBuildingId !== 'all') {
      fetchApartments()
    }
  }, [isOpen, selectedBuildingId])

  const fetchApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('id, unit_number, floor, monthly_rent, is_occupied')
        .eq('building_id', selectedBuildingId)
        .eq('is_occupied', false) // Only show unoccupied apartments
        .order('unit_number')

      if (error) throw error
      setApartments(data || [])
    } catch (err) {
      console.error('Error fetching apartments:', err)
      setError('Failed to load available apartments')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          user_type: 'tenant',
          first_name: formData.first_name,
          last_name: formData.last_name
        }
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to create user account')

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          dni: formData.dni,
          cuit_cuil: formData.cuit_cuil
        })

      if (profileError) throw profileError

      // Create tenant record
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          user_id: userId,
          apartment_id: formData.apartment_id,
          lease_start_date: formData.lease_start_date,
          lease_end_date: formData.lease_end_date,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          is_active: formData.is_active
        })

      if (tenantError) throw tenantError

      // Update apartment as occupied
      const { error: apartmentError } = await supabase
        .from('apartments')
        .update({ is_occupied: true })
        .eq('id', formData.apartment_id)

      if (apartmentError) throw apartmentError

      // Create initial rent payment record
      const selectedApartment = apartments.find(apt => apt.id === formData.apartment_id)
      if (selectedApartment) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            tenant_id: userId, // Using userId as tenant_id for now
            apartment_id: formData.apartment_id,
            amount: selectedApartment.monthly_rent,
            currency: 'ARS',
            payment_type: 'rent',
            payment_method: 'bank_transfer',
            status: 'pending',
            due_date: formData.lease_start_date,
            description: 'Monthly rent payment'
          })

        if (paymentError) {
          console.warn('Failed to create initial payment record:', paymentError)
          // Don't throw here as the tenant was created successfully
        }
      }

      onSuccess()
      onClose()
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        dni: '',
        cuit_cuil: '',
        apartment_id: '',
        lease_start_date: '',
        lease_end_date: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        is_active: true
      })

    } catch (err) {
      console.error('Error creating tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('addTenant')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('personalInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('firstName')} *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('lastName')} *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('dni')} *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cuitCuil')}
                </label>
                <input
                  type="text"
                  name="cuit_cuil"
                  value={formData.cuit_cuil}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lease Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('leaseInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('apartment')} *
                </label>
                <select
                  name="apartment_id"
                  value={formData.apartment_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('selectApartment')}</option>
                  {apartments.map(apartment => (
                    <option key={apartment.id} value={apartment.id}>
                      {apartment.unit_number} - {t('floor')} {apartment.floor} (${apartment.monthly_rent.toLocaleString()}/month)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('leaseStartDate')} *
                </label>
                <input
                  type="date"
                  name="lease_start_date"
                  value={formData.lease_start_date}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('leaseEndDate')} *
                </label>
                <input
                  type="date"
                  name="lease_end_date"
                  value={formData.lease_end_date}
                  onChange={handleInputChange}
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('emergencyContactName')}
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('emergencyContactPhone')}
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('creating') : t('createTenant')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTenantModal








