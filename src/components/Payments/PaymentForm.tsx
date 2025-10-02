import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useBuildingContext } from '../../context/BuildingContext'

interface PaymentFormProps {
  onClose: () => void
  onSubmit: (paymentData: any) => Promise<void>
}

interface Tenant {
  id: string
  user_id: string
  apartment_id: string
  first_name: string
  last_name: string
  unit_number: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose, onSubmit }) => {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingContext()
  const [formData, setFormData] = useState({
    tenant_id: '',
    apartment_id: '',
    amount: '',
    currency: 'ARS',
    payment_type: 'rent',
    payment_method: 'bank_transfer',
    status: 'pending',
    due_date: '',
    description: '',
    reference_number: ''
  })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch tenants for the selected building
  useEffect(() => {
    const fetchTenants = async () => {
      if (!selectedBuilding) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tenants')
          .select(`
            id,
            user_id,
            apartment_id,
            user_profiles!tenants_user_id_fkey (
              first_name,
              last_name
            ),
            apartments!tenants_apartment_id_fkey (
              unit_number
            )
          `)
          .eq('apartments.building_id', selectedBuilding.id)
          .eq('is_active', true)

        if (error) throw error

        const transformedTenants = data?.map(tenant => ({
          id: tenant.id,
          user_id: tenant.user_id,
          apartment_id: tenant.apartment_id,
          first_name: tenant.user_profiles?.[0]?.first_name || '',
          last_name: tenant.user_profiles?.[0]?.last_name || '',
          unit_number: tenant.apartments?.[0]?.unit_number || ''
        })) || []

        setTenants(transformedTenants)
      } catch (err) {
        console.error('Error fetching tenants:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [selectedBuilding])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tenant_id || !formData.amount || !formData.due_date) return

    setIsSubmitting(true)
    try {
      const paymentData = {
        tenant_id: formData.tenant_id,
        apartment_id: formData.apartment_id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        status: formData.status,
        due_date: formData.due_date,
        description: formData.description,
        reference_number: formData.reference_number || null
      }

      await onSubmit(paymentData)
      onClose()
    } catch (error) {
      console.error('Error creating payment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Update apartment_id when tenant changes
    if (field === 'tenant_id') {
      const selectedTenant = tenants.find(t => t.id === value)
      if (selectedTenant) {
        setFormData(prev => ({ ...prev, apartment_id: selectedTenant.apartment_id }))
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('recordPayment')}</h2>
            <p className="text-sm text-gray-600">
              {selectedBuilding ? `${t('for')} ${selectedBuilding.name}` : t('selectBuildingToRecordPayment')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tenant Selection */}
          <div>
            <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectTenant')} *
            </label>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <select
                id="tenant_id"
                value={formData.tenant_id}
                onChange={(e) => handleChange('tenant_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">{t('selectTenant')}</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} - {tenant.unit_number}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              {t('amount')} *
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="amount"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-2">
              {t('paymentType')}
            </label>
            <select
              id="payment_type"
              value={formData.payment_type}
              onChange={(e) => handleChange('payment_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="rent">{t('rent')}</option>
              <option value="deposit">{t('deposit')}</option>
              <option value="utilities">{t('utilities')}</option>
              <option value="maintenance">{t('maintenance')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
              {t('paymentMethod')}
            </label>
            <select
              id="payment_method"
              value={formData.payment_method}
              onChange={(e) => handleChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="bank_transfer">{t('bankTransfer')}</option>
              <option value="cash">{t('cash')}</option>
              <option value="credit_card">{t('creditCard')}</option>
              <option value="debit_card">{t('debitCard')}</option>
              <option value="check">{t('check')}</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('dueDate')} *
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
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
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('enterPaymentDescription')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Reference Number */}
          <div>
            <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-2">
              {t('referenceNumber')} ({t('optional')})
            </label>
            <input
              type="text"
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => handleChange('reference_number', e.target.value)}
              placeholder="TR001234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!formData.tenant_id || !formData.amount || !formData.due_date || isSubmitting}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? t('creating') : t('createPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentForm





