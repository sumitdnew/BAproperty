// pages/Invitations.tsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  PlusIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  HomeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline'

const Invitations: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('sent')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Mock sent invitations data
  const sentInvitations = [
    {
      id: 1,
      email: 'juan.perez@email.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      apartment: '2D',
      role: 'tenant',
      status: 'pending',
      sentAt: '2024-01-28T10:00:00',
      expiresAt: '2024-02-04T10:00:00',
      phone: '+54 11 1234-5678',
      message: 'Te invitamos a unirte a la comunidad del Edificio Central como inquilino del departamento 2D.'
    },
    {
      id: 2,
      email: 'maria.lopez@email.com',
      firstName: 'María',
      lastName: 'López',
      apartment: '1A',
      role: 'owner',
      status: 'accepted',
      sentAt: '2024-01-25T14:30:00',
      acceptedAt: '2024-01-26T09:15:00',
      phone: '+54 11 2345-6789',
      message: 'Bienvenida como nueva propietaria del departamento 1A en nuestro edificio.'
    },
    {
      id: 3,
      email: 'carlos.martinez@email.com',
      firstName: 'Carlos',
      lastName: 'Martínez',
      apartment: '4B',
      role: 'tenant',
      status: 'expired',
      sentAt: '2024-01-15T16:45:00',
      expiresAt: '2024-01-22T16:45:00',
      phone: '+54 11 3456-7890',
      message: 'Invitación para unirse como inquilino del departamento 4B.'
    },
    {
      id: 4,
      email: 'ana.silva@email.com',
      firstName: 'Ana',
      lastName: 'Silva',
      apartment: '3C',
      role: 'tenant',
      status: 'declined',
      sentAt: '2024-01-20T11:20:00',
      declinedAt: '2024-01-21T18:30:00',
      phone: '+54 11 4567-8901',
      message: 'Te invitamos a formar parte de nuestra comunidad como inquilina del 3C.'
    }
  ]

  // Mock invitation templates
  const invitationTemplates = [
    {
      id: 1,
      name: t('tenantInvitation'),
      subject: 'Invitación - Nuevo Inquilino',
      message: 'Te damos la bienvenida como nuevo inquilino del departamento {apartment} en {buildingName}. Tu presencia enriquece nuestra comunidad.',
      type: 'tenant'
    },
    {
      id: 2,
      name: t('ownerInvitation'),
      subject: 'Invitación - Nuevo Propietario',
      message: 'Es un honor tenerte como nuevo propietario del departamento {apartment}. Esperamos trabajar juntos por el bienestar de nuestro edificio.',
      type: 'owner'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border border-green-200'
      case 'declined': return 'bg-red-100 text-red-800 border border-red-200'
      case 'expired': return 'bg-gray-100 text-gray-800 border border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'tenant': return 'bg-blue-100 text-blue-800'
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredInvitations = sentInvitations.filter(invitation => {
    const matchesSearch = `${invitation.firstName} ${invitation.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.apartment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: sentInvitations.length,
    pending: sentInvitations.filter(i => i.status === 'pending').length,
    accepted: sentInvitations.filter(i => i.status === 'accepted').length,
    expired: sentInvitations.filter(i => i.status === 'expired').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('invitations')}</h1>
          <p className="text-gray-600 mt-1">{t('inviteNewMembersToBuilding')}</p>
        </div>
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>{t('sendInvitation')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalInvitations')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 border border-blue-200">
              <EnvelopeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('pendingInvitations')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-200">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('acceptedInvitations')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 border border-green-200">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('acceptanceRate')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 border border-purple-200">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
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
              placeholder={t('searchInvitations')}
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
            <option value="pending">{t('pending')}</option>
            <option value="accepted">{t('accepted')}</option>
            <option value="declined">{t('declined')}</option>
            <option value="expired">{t('expired')}</option>
          </select>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('sentInvitations')} ({filteredInvitations.length})
            </h3>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {filteredInvitations.length} {t('of')} {sentInvitations.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invitee')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sentDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {invitation.firstName[0]}{invitation.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invitation.firstName} {invitation.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invitation.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <HomeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {invitation.apartment}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(invitation.role)}`}>
                      {t(invitation.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {t(invitation.status)}
                    </span>
                    {invitation.status === 'pending' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t('expires')}: {new Date(invitation.expiresAt).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invitation.sentAt).toLocaleDateString('es-AR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(invitation.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors">
                        {t('view')}
                      </button>
                      {invitation.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 transition-colors">
                            {t('resend')}
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors">
                            {t('cancel')}
                          </button>
                        </>
                      )}
                      {invitation.status === 'expired' && (
                        <button className="text-green-600 hover:text-green-900 transition-colors">
                          {t('resend')}
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

      {/* Invitation Templates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('invitationTemplates')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitationTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(template.type)}`}>
                  {t(template.type)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">{template.message}</p>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  {t('useTemplate')}
                </button>
                <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                  {t('edit')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal - Simple placeholder */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('sendInvitation')}</h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ejemplo@email.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('firstName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('lastName')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('apartment')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('role')}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="tenant">{t('tenant')}</option>
                    <option value="owner">{t('owner')}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')} ({t('optional')})
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('message')} ({t('optional')})
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('personalMessageForInvitee')}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors">
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>{t('sendInvitation')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invitations