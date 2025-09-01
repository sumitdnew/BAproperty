// pages/Tenants.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  PlusIcon, 
  EnvelopeIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

const Tenants: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock tenants data
  const tenants = [
    {
      id: 1,
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 1234-5678',
      apartment: '3A',
      floor: 3,
      rentAmount: 85000,
      currency: 'ARS',
      leaseStart: '2023-06-01',
      leaseEnd: '2024-06-01',
      status: 'active',
      paymentStatus: 'paid',
      dni: '12.345.678',
      emergencyContact: {
        name: 'José González',
        phone: '+54 11 9876-5432'
      }
    },
    {
      id: 2,
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+54 11 2345-6789',
      apartment: '1B',
      floor: 1,
      rentAmount: 92000,
      currency: 'ARS',
      leaseStart: '2023-03-15',
      leaseEnd: '2024-03-15',
      status: 'active',
      paymentStatus: 'overdue',
      dni: '23.456.789',
      emergencyContact: {
        name: 'Ana Rodríguez',
        phone: '+54 11 8765-4321'
      }
    },
    {
      id: 3,
      firstName: 'Ana',
      lastName: 'Silva',
      email: 'ana.silva@email.com',
      phone: '+54 11 3456-7890',
      apartment: '2C',
      floor: 2,
      rentAmount: 78000,
      currency: 'ARS',
      leaseStart: '2023-08-01',
      leaseEnd: '2024-08-01',
      status: 'active',
      paymentStatus: 'paid',
      dni: '34.567.890',
      emergencyContact: {
        name: 'Luis Silva',
        phone: '+54 11 7654-3210'
      }
    },
    {
      id: 4,
      firstName: 'Roberto',
      lastName: 'Martínez',
      email: 'roberto.martinez@email.com',
      phone: '+54 11 4567-8901',
      apartment: '4A',
      floor: 4,
      rentAmount: 95000,
      currency: 'ARS',
      leaseStart: '2023-01-01',
      leaseEnd: '2024-01-01',
      status: 'ending_soon',
      paymentStatus: 'paid',
      dni: '45.678.901',
      emergencyContact: {
        name: 'Carmen Martínez',
        phone: '+54 11 6543-2109'
      }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200'
      case 'ending_soon': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'expired': return 'bg-red-100 text-red-800 border border-red-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border border-green-200'
      case 'overdue': return 'bg-red-100 text-red-800 border border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.apartment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('tenants')}</h1>
          <p className="text-gray-600 mt-1">{t('manageTenantsAndLeases')}</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <EnvelopeIcon className="w-4 h-4" />
            <span>{t('inviteNewTenant')}</span>
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2 transition-colors">
            <UserPlusIcon className="w-4 h-4" />
            <span>{t('addTenant')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalTenants')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tenants.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('activeTenants')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenants.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 border border-green-200">
              <HomeIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('leasesExpiringSoon')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenants.filter(t => t.status === 'ending_soon').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
              <EnvelopeIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('averageRent')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${Math.round(tenants.reduce((sum, t) => sum + t.rentAmount, 0) / tenants.length).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 border border-purple-200">
              <PhoneIcon className="w-6 h-6 text-purple-600" />
            </div>
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
              placeholder={t('searchTenants')}
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
            <option value="active">{t('active')}</option>
            <option value="ending_soon">{t('endingSoon')}</option>
            <option value="expired">{t('expired')}</option>
            <option value="inactive">{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('tenantsList')} ({filteredTenants.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredTenants.length} {t('of')} {tenants.length}
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
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rent')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('leaseStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('paymentStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {tenant.firstName[0]}{tenant.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {tenant.dni}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tenant.apartment}
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('floor')} {tenant.floor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${tenant.rentAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {tenant.currency} / {t('month')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                      {t(tenant.status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('until')} {new Date(tenant.leaseEnd).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(tenant.paymentStatus)}`}>
                      {t(tenant.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tenant.email}</div>
                    <div className="text-sm text-gray-500">{tenant.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        {t('view')}
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                        {t('edit')}
                      </button>
                      <button className="text-green-600 hover:text-green-900 transition-colors">
                        {t('contact')}
                      </button>
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

export default Tenants