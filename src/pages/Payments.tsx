// pages/Payments.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import StatsCard from '../components/Dashboard/StatsCard'
import { 
  CreditCardIcon, 
  ClockIcon, 
  ChartBarIcon, 
  PlusIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const Payments: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('thisMonth')

  // Mock payments data
  const payments = [
    {
      id: 1,
      tenantName: 'María González',
      apartment: '3A',
      amount: 85000,
      currency: 'ARS',
      paymentType: 'rent',
      paymentMethod: 'bank_transfer',
      status: 'completed',
      dueDate: '2024-01-05',
      paidDate: '2024-01-03',
      description: t('monthlyRentJanuary'),
      reference: 'TR001234567'
    },
    {
      id: 2,
      tenantName: 'Carlos Rodríguez',
      apartment: '1B',
      amount: 92000,
      currency: 'ARS',
      paymentType: 'rent',
      paymentMethod: 'cash',
      status: 'overdue',
      dueDate: '2024-01-05',
      paidDate: null,
      description: t('monthlyRentJanuary'),
      reference: null
    },
    {
      id: 3,
      tenantName: 'Ana Silva',
      apartment: '2C',
      amount: 78000,
      currency: 'ARS',
      paymentType: 'rent',
      paymentMethod: 'bank_transfer',
      status: 'completed',
      dueDate: '2024-01-05',
      paidDate: '2024-01-04',
      description: t('monthlyRentJanuary'),
      reference: 'TR001234568'
    },
    {
      id: 4,
      tenantName: 'Roberto Martínez',
      apartment: '4A',
      amount: 25000,
      currency: 'ARS',
      paymentType: 'maintenance',
      paymentMethod: 'bank_transfer',
      status: 'pending',
      dueDate: '2024-01-10',
      paidDate: null,
      description: t('extraordinaryExpensesPlumbing'),
      reference: null
    },
    {
      id: 5,
      tenantName: 'Laura Fernández',
      apartment: '2B',
      amount: 89000,
      currency: 'ARS',
      paymentType: 'rent',
      paymentMethod: 'debit_card',
      status: 'completed',
      dueDate: '2024-01-05',
      paidDate: '2024-01-05',
      description: t('monthlyRentJanuary'),
      reference: 'DC789123456'
    }
  ]

  const paymentStats = [
    {
      title: t('totalIncome'),
      value: `$${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      icon: CreditCardIcon,
      color: 'green' as const,
      subtitle: t('thisMonth')
    },
    {
      title: t('pendingAmount'),
      value: `$${payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      icon: ClockIcon,
      color: 'red' as const,
    },
    {
      title: t('collectionRate'),
      value: `${Math.round((payments.filter(p => p.status === 'completed').length / payments.length) * 100)}%`,
      icon: ChartBarIcon,
      color: 'blue' as const,
    },
    {
      title: t('overduePayments'),
      value: payments.filter(p => p.status === 'overdue').length,
      icon: ArrowTrendingUpIcon,
      color: 'yellow' as const,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 border border-red-200'
      case 'failed': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return '🏦'
      case 'cash': return '💵'
      case 'credit_card': return '💳'
      case 'debit_card': return '💳'
      case 'check': return '📄'
      default: return '💰'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('payments')}</h1>
          <p className="text-gray-600 mt-1">{t('trackPaymentsAndIncome')}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="thisMonth">{t('thisMonth')}</option>
            <option value="lastMonth">{t('lastMonth')}</option>
            <option value="last3Months">{t('last3Months')}</option>
            <option value="thisYear">{t('thisYear')}</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span>{t('recordPayment')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('paymentSummary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${payments.filter(p => p.paymentType === 'rent' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('rentIncome')}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) / payments.reduce((sum, p) => sum + p.amount, 0)) * 100)}%
            </p>
            <p className="text-sm text-gray-600">{t('collectionEfficiency')}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
              <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{t('averagePayment')}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPayments')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="overdue">{t('overdue')}</option>
            <option value="failed">{t('failed')}</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('paymentHistory')} ({filteredPayments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredPayments.length} {t('of')} {payments.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('method')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dates')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {payment.tenantName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.tenantName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.apartment}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {payment.description}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t(payment.paymentType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                      </span>
                      <span className="text-sm text-gray-900">
                        {t(payment.paymentMethod)}
                      </span>
                    </div>
                    {payment.reference && (
                      <div className="text-xs text-gray-400">
                        {payment.reference}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {t(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {t('due')}: {new Date(payment.dueDate).toLocaleDateString('es-AR')}
                    </div>
                    {payment.paidDate && (
                      <div className="text-sm text-gray-500">
                        {t('paid')}: {new Date(payment.paidDate).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        {t('view')}
                      </button>
                      {payment.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900 transition-colors">
                          {t('markPaid')}
                        </button>
                      )}
                      {payment.status === 'overdue' && (
                        <button className="text-red-600 hover:text-red-900 transition-colors">
                          {t('sendReminder')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Payments