import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'

interface TenantPaymentSubmissionProps {
  onClose: () => void
  onSubmit: (paymentData: any) => Promise<void>
}

const TenantPaymentSubmission: React.FC<TenantPaymentSubmissionProps> = ({ onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    description: '',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0]
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submission started:', { formData, proofFile })
    
    if (!formData.amount || !formData.payment_date || !proofFile) {
      console.log('Form validation failed:', {
        amount: formData.amount,
        payment_date: formData.payment_date,
        proofFile: !!proofFile
      })
      return
    }

    setIsSubmitting(true)
    try {
      let proofUrl = null
      
      // Upload proof file if provided
      if (proofFile) {
        // Get current user ID for the file path
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const fileExt = proofFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}` // Use user ID as folder

        console.log('Uploading file to path:', filePath)

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, proofFile)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          throw new Error('Failed to upload payment proof')
        }

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(filePath)

        proofUrl = publicUrl
      }

      const paymentData = {
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        description: formData.description,
        reference_number: formData.reference_number,
        due_date: formData.payment_date, // Use due_date instead of payment_date
        paid_date: formData.payment_date, // Set paid_date to the payment date
        proof_url: proofUrl,
        status: 'pending' // Use 'pending' status for tenant-submitted payments
      }

      await onSubmit(paymentData)
      onClose()
    } catch (error) {
      console.error('Error submitting payment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert(t('invalidFileType'))
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('fileTooLarge'))
        return
      }
      
      setProofFile(file)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('submitPayment')}</h2>
            <p className="text-sm text-gray-600">{t('submitPaymentDescription')}</p>
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
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              {t('amount')} *
            </label>
            <input
              type="number"
              id="amount"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
              {t('paymentMethod')} *
            </label>
            <select
              id="payment_method"
              value={formData.payment_method}
              onChange={(e) => handleChange('payment_method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="bank_transfer">{t('bankTransfer')}</option>
              <option value="cash">{t('cash')}</option>
              <option value="credit_card">{t('creditCard')}</option>
              <option value="debit_card">{t('debitCard')}</option>
              <option value="check">{t('check')}</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('paymentDate')} *
            </label>
            <input
              type="date"
              id="payment_date"
              value={formData.payment_date}
              onChange={(e) => handleChange('payment_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Reference Number */}
          <div>
            <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 mb-2">
              {t('referenceNumber')} *
            </label>
            <input
              type="text"
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => handleChange('reference_number', e.target.value)}
              placeholder="TR001234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('paymentDescriptionPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Proof of Payment Upload */}
          <div>
            <label htmlFor="proof_file" className="block text-sm font-medium text-gray-700 mb-2">
              {t('proofOfPayment')} *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="proof_file" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                    <span>{t('uploadFile')}</span>
                    <input
                      id="proof_file"
                      name="proof_file"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                      required
                    />
                  </label>
                  <p className="pl-1">{t('orDragAndDrop')}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {t('supportedFormats')}: PNG, JPG, GIF, PDF ({t('maxSize')}: 5MB)
                </p>
              </div>
            </div>
            {proofFile && (
              <div className="mt-2 flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">{proofFile.name}</span>
                <button
                  type="button"
                  onClick={() => setProofFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  {t('remove')}
                </button>
              </div>
            )}
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
              disabled={!formData.amount || !formData.payment_date || !formData.reference_number || !proofFile || isSubmitting}
              onClick={() => console.log('Submit button clicked', { 
                amount: formData.amount, 
                payment_date: formData.payment_date, 
                reference_number: formData.reference_number,
                proofFile: !!proofFile,
                isSubmitting 
              })}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? t('submitting') : t('submitPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TenantPaymentSubmission
