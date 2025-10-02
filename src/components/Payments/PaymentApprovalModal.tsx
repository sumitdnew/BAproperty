import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PaymentApprovalModalProps {
  payment: any
  onClose: () => void
  onApproval: (paymentId: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>
}

const PaymentApprovalModal: React.FC<PaymentApprovalModalProps> = ({ payment, onClose, onApproval }) => {
  const { t } = useTranslation()
  const [reviewNotes, setReviewNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAction, setSelectedAction] = useState<'approved' | 'rejected' | null>(null)


  const handleApproval = async (status: 'approved' | 'rejected') => {
    setIsProcessing(true)
    try {
      await onApproval(payment.id, status, reviewNotes)
      onClose()
    } catch (error) {
      console.error('Error processing payment approval:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {payment.submission_status === 'pending' ? t('reviewPayment') : t('paymentDetails')}
            </h2>
            <p className="text-sm text-gray-600">
              {payment.submission_status === 'pending' ? t('reviewPaymentDescription') : t('viewPaymentDetails')}
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

        <div className="p-6 space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{t('paymentDetails')}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('tenant')}</label>
                  <p className="text-sm text-gray-900">{payment.tenant_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('apartment')}</label>
                  <p className="text-sm text-gray-900">{payment.apartment}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('paymentMethod')}</label>
                  <p className="text-sm text-gray-900">{t(payment.payment_method)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('referenceNumber')}</label>
                  <p className="text-sm text-gray-900 font-mono">{payment.reference_number}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('paymentDate')}</label>
                  <p className="text-sm text-gray-900">{formatDate(payment.payment_date || payment.submitted_at)}</p>
                </div>
                
                {payment.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                    <p className="text-sm text-gray-900">{payment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Proof of Payment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{t('proofOfPayment')}</h3>
              
              {payment.proof_url ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  {payment.proof_url.toLowerCase().includes('.pdf') ? (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">{t('pdfDocument')}</p>
                      <a
                        href={payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        {t('viewDocument')}
                      </a>
                    </div>
                  ) : (
                    <div className="text-center">
                      <img
                        src={payment.proof_url}
                        alt={t('proofOfPayment')}
                        className="mx-auto max-h-64 rounded-lg shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="hidden">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">{t('imageNotAvailable')}</p>
                      </div>
                      <a
                        href={payment.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        {t('viewFullSize')}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">{t('noProofProvided')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Section - Only show for submitted payments */}
          {payment.submission_status === 'pending' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reviewDecision')}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reviewNotes')}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={t('reviewNotesPlaceholder')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedAction('approved')}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedAction === 'approved'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('approve')}
                </button>

                <button
                  onClick={() => setSelectedAction('rejected')}
                  className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedAction === 'rejected'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {t('reject')}
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              {payment.submission_status === 'pending' ? t('cancel') : t('close')}
            </button>
            {payment.submission_status === 'pending' && (
              <button
                onClick={() => selectedAction && handleApproval(selectedAction)}
                disabled={!selectedAction || isProcessing}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedAction === 'approved'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : selectedAction === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? t('processing') : t('submitDecision')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentApprovalModal
