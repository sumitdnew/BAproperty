import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTenants } from '../../hooks/useTenants'
import { supabase } from '../../lib/supabase'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface NewPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PaymentForm {
  tenant_id: string
  apartment: string
  apartment_id: string
  amount: string
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other'
  payment_date: string
  description: string
}

interface Tenant {
  id: string
  first_name: string
  last_name: string
  apartment: string
  apartment_id: string
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsLoading, setTenantsLoading] = useState(false)
  const [tenantsError, setTenantsError] = useState<string | null>(null)
  
  // Debug: Log what we get from the hook
  React.useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching tenants directly...')
      fetchTenantsDirectly()
    }
  }, [isOpen])
  
  const fetchTenantsDirectly = async () => {
    try {
      setTenantsLoading(true)
      setTenantsError(null)
      
      console.log('Fetching tenants with joins...')
      
      // Now let's try to get tenant names and apartment numbers with joins
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          id,
          apartment_id,
          user_profiles(
            first_name,
            last_name
          ),
          apartments(
            unit_number
          )
        `)
        .eq('is_active', true)
      
      console.log('Joined tenants query result:', { data, error })
      
      if (error) {
        console.error('Joined query error:', error)
        setTenantsError(error.message)
        return
      }
      
      if (!data || data.length === 0) {
        console.log('No tenants found in joined query')
        setTenants([])
        return
      }
      
      console.log('Found tenants in joined query:', data)
      
      // Let's inspect the first tenant to see the actual structure
      if (data.length > 0) {
        console.log('First tenant raw data:', data[0])
        console.log('First tenant user_profiles:', data[0].user_profiles)
        console.log('First tenant apartments:', data[0].apartments)
      }
      
      // Transform the joined data - the joins return objects, not arrays
      const tenantsWithDetails = data.map(tenant => ({
        id: tenant.id,
        first_name: (tenant.user_profiles as any)?.first_name || 'Unknown',
        last_name: (tenant.user_profiles as any)?.last_name || '',
        apartment: (tenant.apartments as any)?.unit_number || 'N/A',
        apartment_id: tenant.apartment_id || ''
      }))
      
      console.log('Tenants with details transformed:', tenantsWithDetails)
      
      // Check for duplicates
      const duplicateCheck = tenantsWithDetails.reduce((acc, tenant) => {
        const key = `${tenant.first_name} ${tenant.last_name} - ${tenant.apartment}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('Duplicate check:', duplicateCheck)
      
      // Remove duplicates based on tenant ID (keep first occurrence)
      const uniqueTenants = tenantsWithDetails.filter((tenant, index, self) => 
        index === self.findIndex(t => t.id === tenant.id)
      )
      
      console.log('Unique tenants after deduplication:', uniqueTenants)
      setTenants(uniqueTenants)
      
    } catch (error) {
      console.error('Error in joined fetch:', error)
      setTenantsError(error instanceof Error ? error.message : 'Failed to fetch tenants')
    } finally {
      setTenantsLoading(false)
    }
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PaymentForm>({
    tenant_id: '',
    apartment: '',
    apartment_id: '',
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'amount') {
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

  const handleTenantChange = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId)
    setFormData(prev => ({
      ...prev,
      tenant_id: tenantId,
      apartment: tenant ? tenant.apartment : '',
      apartment_id: tenant ? tenant.apartment_id : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate amount
      if (formData.amount && isNaN(parseFloat(formData.amount))) {
        throw new Error('Please enter a valid amount')
      }

      if (!formData.tenant_id) {
        throw new Error('Please select a tenant')
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          tenant_id: formData.tenant_id,
          apartment_id: formData.apartment_id, // We need to get the actual apartment_id
          amount: parseFloat(formData.amount) || 0,
          payment_type: 'other', // Default to 'other' since we don't have rent/deposit options
          payment_method: formData.payment_method,
          due_date: formData.payment_date,
          paid_date: formData.payment_date, // Since it's completed, set paid_date
          description: formData.description,
          status: 'completed'
        })

      if (error) throw error

      // Reset form
      setFormData({
        tenant_id: '',
        apartment: '',
        apartment_id: '',
        amount: '',
        payment_method: 'bank_transfer',
        payment_date: new Date().toISOString().split('T')[0],
        description: ''
      })

      // Call onSuccess first, then close modal (same as NewMaintenanceRequestModal)
      onSuccess()
      
      // Small delay to ensure onSuccess completes before closing
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error) {
      console.error('Error creating payment:', error)
      setError(error instanceof Error ? error.message : 'Failed to create payment')
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
            {t('newPayment')}
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

                     {/* Tenant Selection */}
           <div>
             <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 mb-2">
               {t('tenant')} *
             </label>
             {tenantsError && (
               <div className="text-red-600 text-sm mb-2">{tenantsError}</div>
             )}
             <select
               id="tenant_id"
               name="tenant_id"
               value={formData.tenant_id}
               onChange={(e) => handleTenantChange(e.target.value)}
               required
               disabled={tenantsLoading}
               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
             >
               <option value="">
                 {tenantsLoading ? t('loading') : t('selectTenant')}
               </option>
               {tenants.map((tenant) => (
                 <option key={tenant.id} value={tenant.id}>
                   {tenant.first_name} {tenant.last_name} - {tenant.apartment}
                 </option>
               ))}
             </select>
           </div>

          {/* Apartment (Auto-filled) */}
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
              {t('apartment')}
            </label>
            <input
              type="text"
              id="apartment"
              name="apartment"
              value={formData.apartment}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          {/* Amount and Payment Method Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                {t('amount')} ($) *
              </label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                {t('paymentMethod')} *
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">{t('cash')}</option>
                <option value="bank_transfer">{t('bankTransfer')}</option>
                <option value="credit_card">{t('creditCard')}</option>
                <option value="check">{t('check')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
          </div>

          {/* Payment Date and Description Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Date */}
            <div>
              <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-2">
                {t('paymentDate')} *
              </label>
              <input
                type="date"
                id="payment_date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('enterPaymentDescription')}
              />
            </div>
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
              {loading ? t('creating') : t('createPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewPaymentModal
