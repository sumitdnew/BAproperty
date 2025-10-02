// pages/Invitations.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import InviteTenantModalSimple from '../components/Tenants/InviteTenantModalSimple'
import emailjs from '@emailjs/browser'
import { useBuildingContext } from '../context/BuildingContext'
import { 
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface InvitationRow {
  id: string
  email: string
  first_name: string
  last_name: string
  building_id: string
  apartment_id: string
  invitation_type: string
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  message?: string
  accepted_at?: string
  expires_at?: string
  created_at?: string
  apartments?: { unit_number: string, buildings?: { name: string } }
}

const Invitations: React.FC = () => {
  const { t } = useTranslation()
  const { selectedBuildingId } = useBuildingContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'accepted' | 'declined' | 'expired' | 'cancelled'>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationRow | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<InvitationRow[]>([])

  // Load invitations from DB
  const loadInvitations = async () => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase
        .from('invitations')
        .select(`
          id,
          email,
          first_name,
          last_name,
          building_id,
          apartment_id,
          invitation_type,
          status,
          message,
          accepted_at,
          expires_at,
          apartments:apartments!inner(
            unit_number,
            buildings:buildings!inner(name)
          )
        `)
        .order('accepted_at', { ascending: false, nullsFirst: false })
      if (selectedBuildingId !== 'all') {
        query = query.eq('apartments.building_id', selectedBuildingId)
      }
      const { data, error } = await query
      if (error) throw error
      setRows((data || []) as any)
    } catch (err: any) {
      setError(err.message || 'Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
    // listen to table changes
    const sub = supabase
      .channel('invitations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => {
        loadInvitations()
      })
      .subscribe()
    return () => { sub.unsubscribe() }
  }, [selectedBuildingId])

  // Invitation templates (static copy)
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
      case 'sent': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border border-green-200'
      case 'declined': return 'bg-red-100 text-red-800 border border-red-200'
      case 'expired': return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'cancelled': return 'bg-gray-100 text-gray-500 border border-gray-200'
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

  const filteredInvitations = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return rows.filter((inv) => {
      const fullName = `${inv.first_name || ''} ${inv.last_name || ''}`.trim().toLowerCase()
      const apt = inv.apartments?.unit_number?.toLowerCase() || ''
      const matchesSearch = fullName.includes(term) || (inv.email || '').toLowerCase().includes(term) || apt.includes(term)
      const matchesStatus = statusFilter === 'all'
        ? inv.status !== 'cancelled'
        : statusFilter === 'pending'
          ? (inv.status === 'pending' || inv.status === 'sent')
          : inv.status === statusFilter
    return matchesSearch && matchesStatus
  })
  }, [rows, searchTerm, statusFilter])

  const cancelInvitation = async (invitation: InvitationRow) => {
    try {
      if (!(invitation.status === 'sent' || invitation.status === 'pending')) {
        alert(t('onlyPendingInvitationsCanBeCancelled') || 'Only pending invitations can be cancelled')
        return
      }
      if (!confirm(t('areYouSureCancelInvitation') || 'Are you sure you want to cancel this invitation?')) return
      // Best-effort cleanup: remove placeholder tenants and un-occupy apartment if no active tenant
      if (invitation.apartment_id) {
        // Delete placeholder tenant rows (user_id is NULL)
        await supabase
          .from('tenants')
          .delete()
          .eq('apartment_id', invitation.apartment_id)
          .is('user_id', null)

        // Check if an active tenant exists for this apartment
        const { data: activeTenants, error: activeErr } = await supabase
          .from('tenants')
          .select('id')
          .eq('apartment_id', invitation.apartment_id)
          .eq('is_active', true)
          .not('user_id', 'is', null)
        if (!activeErr && (activeTenants?.length || 0) === 0) {
          await supabase
            .from('apartments')
            .update({ is_occupied: false })
            .eq('id', invitation.apartment_id)
        }
      }
      // Soft delete the invitation: mark as cancelled and clear accepted_at/auth_user_id
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled', accepted_at: null, auth_user_id: null })
        .eq('id', invitation.id)
      if (error) throw error
      await loadInvitations()
    } catch (err: any) {
      alert(err.message || 'Failed to cancel invitation')
    }
  }

  const openView = (invitation: InvitationRow) => {
    setSelectedInvitation(invitation)
    setShowViewModal(true)
  }

  const buildSignupUrl = (invitation: InvitationRow) => {
    return `${window.location.origin}/invite?invitation=${invitation.id}&email=${encodeURIComponent(invitation.email)}`
  }

  const resendInvitation = async (invitation: InvitationRow) => {
    try {
      setResendingId(invitation.id)
      // Prepare EmailJS params similar to invite modal
      const envKey = (import.meta as any).env?.VITE_EMAILJS_USER_ID
      const emailjsPublicKey = envKey === 'E0G-u44Ys9PBcy6gP' ? '2eD5KJ_H_t0llmv08' : envKey
      const serviceId = 'service_7n6g698'
      const templateId = 'template_ln74jmx'

      const params: Record<string, any> = {
        user_name: `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim() || invitation.email,
        user_email: invitation.email,
        building_name: invitation.apartments?.buildings?.name || '',
        apartment_unit: invitation.apartments?.unit_number || '',
        temp_password: 'TempPass123!',
        login_url: `${window.location.origin}/login`,
        signup_url: buildSignupUrl(invitation),
        message: invitation.message || ''
      }

      await emailjs.send(serviceId, templateId, params, { publicKey: emailjsPublicKey })

      // Extend expiration by 7 days and keep status as sent (or accepted stays accepted)
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const { error } = await supabase
        .from('invitations')
        .update({ expires_at: newExpiry })
        .eq('id', invitation.id)
      if (error) throw error

      await loadInvitations()
      alert(t('invitationResent') || 'Invitation resent')
    } catch (err: any) {
      alert(err.message || 'Failed to resend invitation')
    } finally {
      setResendingId(null)
    }
  }

  const stats = {
    total: rows.length,
    pending: rows.filter(i => i.status === 'sent').length,
    accepted: rows.filter(i => i.status === 'accepted').length,
    expired: rows.filter(i => i.status === 'expired').length
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
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

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
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="sent">{t('pending')}</option>
            <option value="accepted">{t('accepted')}</option>
            <option value="declined">{t('declined')}</option>
            <option value="expired">{t('expired')}</option>
            <option value="cancelled">{t('cancelled') || 'Cancelled'}</option>
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
                {filteredInvitations.length} {t('of')} {rows.length}
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
                          {(invitation.first_name || '?')[0]}{(invitation.last_name || '?')[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {invitation.first_name} {invitation.last_name}
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
                        {invitation.apartments?.unit_number || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(invitation.invitation_type)}`}>
                      {t(invitation.invitation_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                      {t(invitation.status)}
                    </span>
                    {invitation.status === 'sent' && invitation.expires_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t('expires')}: {new Date(invitation.expires_at).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(invitation.accepted_at || invitation.expires_at) ? new Date(invitation.accepted_at || invitation.expires_at as string).toLocaleDateString('es-AR') : '—'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(invitation.accepted_at || invitation.expires_at) ? new Date(invitation.accepted_at || invitation.expires_at as string).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors" onClick={() => openView(invitation)}>
                        {t('view')}
                      </button>
                      {(invitation.status === 'sent' || invitation.status === 'pending') && (
                        <>
                          <button className="text-green-600 hover:text-green-900 transition-colors" onClick={() => resendInvitation(invitation)} disabled={resendingId === invitation.id}>
                            {t('resend')}
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors" onClick={() => cancelInvitation(invitation)}>
                            {t('cancel')}
                          </button>
                        </>
                      )}
                      {invitation.status === 'expired' && (
                        <button className="text-green-600 hover:text-green-900 transition-colors" onClick={() => resendInvitation(invitation)} disabled={resendingId === invitation.id}>
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
        <InviteTenantModalSimple
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            loadInvitations()
          }}
        />
      )}

      {showViewModal && selectedInvitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('invitationDetails')}</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div><strong>{t('invitee')}:</strong> {selectedInvitation.first_name} {selectedInvitation.last_name} &lt;{selectedInvitation.email}&gt;</div>
              <div><strong>{t('building')}:</strong> {selectedInvitation.apartments?.buildings?.name || '—'}</div>
              <div><strong>{t('apartment')}:</strong> {selectedInvitation.apartments?.unit_number || '—'}</div>
              <div><strong>{t('status')}:</strong> {t(selectedInvitation.status)}</div>
              <div><strong>{t('expires')}:</strong> {selectedInvitation.expires_at ? new Date(selectedInvitation.expires_at).toLocaleString() : '—'}</div>
              {selectedInvitation.message && (
                <div><strong>{t('message')}:</strong> {selectedInvitation.message}</div>
              )}
              <div>
                <strong>{t('inviteLink')}:</strong>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    readOnly
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                    value={buildSignupUrl(selectedInvitation)}
                  />
                  <button
                    className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
                    onClick={() => navigator.clipboard.writeText(buildSignupUrl(selectedInvitation))}
                  >
                    {t('copy')}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button className="px-3 py-2 text-sm border border-gray-300 rounded" onClick={() => setShowViewModal(false)}>{t('close')}</button>
              {(selectedInvitation.status === 'sent' || selectedInvitation.status === 'expired') && (
                <button className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700" onClick={() => resendInvitation(selectedInvitation)} disabled={resendingId === selectedInvitation.id}>
                  {t('resend')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invitations