// components/Tenants/InviteTenantModal.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { useBuildingContext } from '../../context/BuildingContext'
import { testDatabaseSchema } from '../../utils/testDatabase'
import emailjs from '@emailjs/browser'
import { XMarkIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

interface InviteTenantModalProps {
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

interface Building {
  id: string
  name: string
}

const InviteTenantModal: React.FC<InviteTenantModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const { selectedBuildingId } = useBuildingContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loadingApartments, setLoadingApartments] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    building_id: '',
    apartment_id: '',
    message: ''
  })

  // Load buildings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBuildings()
    }
  }, [isOpen])

  // Load apartments when building is selected
  useEffect(() => {
    if (formData.building_id) {
      fetchApartments(formData.building_id)
    } else {
      setApartments([])
    }
  }, [formData.building_id])

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .order('name')

      if (error) throw error
      setBuildings(data || [])
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError('Failed to load buildings')
    }
  }

  const fetchApartments = async (buildingId: string) => {
    try {
      setLoadingApartments(true)
      const { data, error } = await supabase
        .from('apartments')
        .select('id, unit_number, floor, monthly_rent, is_occupied')
        .eq('building_id', buildingId)
        .eq('is_occupied', false) // Only show unoccupied apartments
        .order('unit_number')

      if (error) throw error
      setApartments(data || [])
    } catch (err) {
      console.error('Error fetching apartments:', err)
      setError('Failed to load apartments')
    } finally {
      setLoadingApartments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Test database schema first
      console.log('🔍 Testing database schema before invitation...')
      const schemaTest = await testDatabaseSchema()
      if (!schemaTest) {
        throw new Error('Database schema test failed. Please run the migration scripts first.')
      }
      // Try admin invitation first, fallback to regular signup if not available
      let authData = null
      let authError = null

      // Check if admin client is properly configured
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      if (!serviceKey) {
        console.error('❌ VITE_SUPABASE_SERVICE_ROLE_KEY is not configured. Cannot create user in auth.users table.')
        authError = new Error('Service role key not configured')
      } else {
        // Create user directly in auth.users table
        console.log('👤 Creating user directly in auth.users table...')
        const tempPassword = `TempPass${Math.random().toString(36).substr(2, 8)}!`
        
        try {
          const createUserResult = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: tempPassword, // Temporary password
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
              user_type: 'tenant',
              first_name: formData.first_name,
              last_name: formData.last_name,
              building_id: formData.building_id,
              apartment_id: formData.apartment_id,
              invitation_message: formData.message
            }
          })
          
          if (createUserResult.data?.user) {
            console.log('✅ User created successfully in auth.users:', createUserResult.data.user.id)
            authData = createUserResult.data
            authError = null
            // Store the password for the email
            authData.tempPassword = tempPassword
            
            // Create user profile
            console.log('👤 Creating user profile...')
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                id: createUserResult.data.user.id,
                user_type: 'tenant',
                first_name: formData.first_name,
                last_name: formData.last_name
              })
            
            if (profileError) {
              console.error('❌ Failed to create user profile:', profileError)
              // Don't throw here, continue with invitation
            } else {
              console.log('✅ User profile created successfully')
            }
          } else {
            throw createUserResult.error || new Error('Failed to create user')
          }
        } catch (createError) {
          console.error('❌ Failed to create user in auth.users:', createError)
          console.error('❌ Error details:', createError)
          authData = { user: null }
          authError = createError
        }
      }

      if (authError) {
        console.warn('Auth invitation failed, proceeding with invitation record only:', authError)
        // Continue without auth user creation - use null for auth_user_id
        authData = { user: null }
        
        // Show warning to user if service role key is missing
        if (authError.message === 'Service role key not configured') {
          console.warn('⚠️ Service role key not configured. User will need to sign up manually.')
        }
      }

      // Create invitation record in our database
      const { error: inviteError } = await supabase
        .from('invitations')
        .insert({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          building_id: formData.building_id,
          apartment_id: formData.apartment_id,
          invitation_type: 'tenant',
          status: 'sent',
          message: formData.message,
          auth_user_id: authData.user?.id || null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        })

      if (inviteError) {
        console.error('Failed to create invitation record:', inviteError)
        throw new Error(`Failed to create invitation: ${inviteError.message}`)
      }

      console.log('✅ Invitation record created successfully')

      // Get apartment details for tenant creation
      const selectedApartment = apartments.find(apt => apt.id === formData.apartment_id)
      if (!selectedApartment) {
        throw new Error('Selected apartment not found')
      }

      console.log('📋 Creating tenant record for apartment:', selectedApartment)

      // Send email first - if this fails, don't create tenant record or mark apartment as occupied
      let emailSuccess = false
      try {
        console.log('📧 Sending invitation email via EmailJS...')
        
        // Force the correct Public Key (same as EmailTest)
        const envKey = import.meta.env.VITE_EMAILJS_USER_ID
        const emailjsPublicKey = envKey === 'E0G-u44Ys9PBcy6gP' ? '2eD5KJ_H_t0llmv08' : envKey
        
        // Get building and apartment names for the email
        const selectedBuilding = buildings.find(b => b.id === formData.building_id)
        const selectedApartment = apartments.find(a => a.id === formData.apartment_id)
        
        // Send email using EmailJS (same pattern as EmailTest)
        await emailjs.sendForm(
          'service_7n6g698', // Your EmailJS Service ID
          'template_ln74jmx', // Your EmailJS Template ID
          form.current!, // Form reference
          {
            publicKey: emailjsPublicKey,
          }
        ).then(
          () => {
            console.log('✅ Invitation email sent successfully via EmailJS')
            emailSuccess = true
          },
          (error) => {
            console.error('❌ EmailJS failed:', error.text)
            throw new Error(`Failed to send invitation email: ${error.text}`)
          }
        )
        
      } catch (emailError) {
        console.error('❌ Failed to send invitation email:', emailError)
        throw new Error('Failed to send invitation email. Please try again.')
      }

      // Only proceed with tenant creation and apartment marking if email was sent successfully
      if (emailSuccess) {
        // Create tenant record (even though they haven't accepted yet)
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            user_id: authData.user?.id || null,
            apartment_id: formData.apartment_id,
            lease_start_date: new Date().toISOString().split('T')[0], // Date format for DATE column
            lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            deposit_amount: selectedApartment.monthly_rent * 2, // 2 months rent as deposit
            is_active: false // Will be true when they accept the invitation
          })
          .select()

        if (tenantError) {
          console.error('Failed to create tenant record:', tenantError)
          throw new Error(`Failed to create tenant record: ${tenantError.message}`)
        }

        console.log('✅ Tenant record created successfully:', tenantData)

        // Mark apartment as occupied only if everything succeeded
        const { data: apartmentData, error: apartmentError } = await supabase
          .from('apartments')
          .update({ is_occupied: true })
          .eq('id', formData.apartment_id)
          .select()

        if (apartmentError) {
          console.error('Failed to update apartment status:', apartmentError)
          throw new Error(`Failed to update apartment status: ${apartmentError.message}`)
        }

        console.log('✅ Apartment marked as occupied:', apartmentData)
      }

      // Email was already sent above, no need to send again

      console.log('Tenant invitation sent and record created:', {
        email: formData.email,
        name: `${formData.first_name} ${formData.last_name}`,
        building: formData.building_id,
        apartment: formData.apartment_id,
        authUserId: authData.user?.id,
        tenantActive: false,
        apartmentOccupied: true,
        depositAmount: selectedApartment.monthly_rent * 2,
        monthlyRent: selectedApartment.monthly_rent
      })

      // Only set success if email was sent successfully
      if (emailSuccess) {
        setSuccess(true)
      }
      
      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        building_id: '',
        apartment_id: '',
        message: ''
      })

      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess()
        onClose()
        setSuccess(false)
      }, 2000)

    } catch (err) {
      console.error('Error creating invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('invitationSent')}</h2>
            <p className="text-gray-600 mb-4">
              {t('invitationSentMessage', { email: formData.email })}
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('inviteNewTenant')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form ref={form} onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">{t('invitationInfo')}</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {t('invitationInfoDescription')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {t('personalInformation')}
              </h3>
              
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
                
                {/* Hidden field for EmailJS user_name */}
                <input
                  type="hidden"
                  name="user_name"
                  value={`${formData.first_name} ${formData.last_name}`}
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
                  {t('personalMessage')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t('personalMessagePlaceholder')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Hidden fields for EmailJS template variables */}
              <input
                type="hidden"
                name="user_email"
                value={formData.email}
              />
              <input
                type="hidden"
                name="building_name"
                value={buildings.find(b => b.id === formData.building_id)?.name || ''}
              />
              <input
                type="hidden"
                name="apartment_unit"
                value={apartments.find(a => a.id === formData.apartment_id)?.unit_number || ''}
              />
              <input
                type="hidden"
                name="temp_password"
                value="TempPass123!"
              />
              <input
                type="hidden"
                name="login_url"
                value={`${window.location.origin}/login`}
              />
            </div>

            {/* Right Column - Property Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                {t('leaseInformation')}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('building')} *
                </label>
                <select
                  name="building_id"
                  value={formData.building_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('selectBuilding')}</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  disabled={!formData.building_id || loadingApartments}
                >
                  <option value="">{loadingApartments ? t('loading') : t('selectApartment')}</option>
                  {apartments.map((apartment) => (
                    <option key={apartment.id} value={apartment.id}>
                      {t('apartment')} {apartment.unit_number} - {t('floor')} {apartment.floor} (${apartment.monthly_rent}/month)
                    </option>
                  ))}
                </select>
                {formData.building_id && apartments.length === 0 && !loadingApartments && (
                  <p className="text-sm text-gray-500 mt-1">{t('noAvailableApartments')}</p>
                )}
              </div>

              {/* Invitation Details */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('invitationDetails')}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>{t('invitationType')}:</span>
                    <span className="font-medium">{t('tenant')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('expiresIn')}:</span>
                    <span className="font-medium">7 {t('days')}</span>
                  </div>
                  {formData.building_id && (
                    <div className="flex justify-between">
                      <span>{t('building')}:</span>
                      <span className="font-medium">
                        {buildings.find(b => b.id === formData.building_id)?.name}
                      </span>
                    </div>
                  )}
                  {formData.apartment_id && (
                    <div className="flex justify-between">
                      <span>{t('apartment')}:</span>
                      <span className="font-medium">
                        {apartments.find(a => a.id === formData.apartment_id)?.unit_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{loading ? t('sending') : t('sendInvitation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InviteTenantModal
