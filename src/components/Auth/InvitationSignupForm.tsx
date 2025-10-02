import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from '../LanguageSwitcher';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface InvitationData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  building_id: string;
  apartment_id: string;
  message: string;
  status: string;
  expires_at: string;
}

const InvitationSignupForm: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get invitation details from URL
  const invitationId = searchParams.get('invitation');
  const emailParam = searchParams.get('email');
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Load and validate invitation
  useEffect(() => {
    const validateInvitation = async () => {
      if (!invitationId) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', invitationId)
          .eq('status', 'sent')
          .single();

        if (error || !data) {
          setError('Invitation not found or already used');
          setLoading(false);
          return;
        }

        // Check if invitation is expired
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        if (now > expiresAt) {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        // Check if email matches (if provided in URL)
        if (emailParam && emailParam !== data.email) {
          setError('Email mismatch with invitation');
          setLoading(false);
          return;
        }

        setInvitation(data);
        setEmail(data.email);
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setError(null);
      } catch (err) {
        setError('Failed to validate invitation');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [invitationId, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!invitation) {
      setError('Invalid invitation');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      console.log('🔄 Attempting to sign up user...');
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            user_type: 'tenant'
          }
        }
      });

      if (signUpError) {
        console.error('❌ Signup error:', signUpError);
        throw signUpError;
      }

      console.log('✅ User signup successful:', authData);

      if (authData.user) {
        console.log('✅ User created in auth.users:', authData.user.id);

        // Create user profile
        console.log('🔄 Creating user profile...');
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            user_type: 'tenant',
            first_name: invitation.first_name,
            last_name: invitation.last_name
          });

        if (profileError) {
          console.error('❌ Failed to create user profile:', profileError);
          // Continue anyway - the user is created in auth.users
          console.log('⚠️ Continuing without user profile - user can still login');
        } else {
          console.log('✅ User profile created successfully');
        }

        // Update invitation record
        console.log('🔄 Updating invitation record...');
        const { error: inviteError } = await supabase
          .from('invitations')
          .update({
            auth_user_id: authData.user.id,
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('id', invitation.id);

        if (inviteError) {
          console.error('❌ Failed to update invitation:', inviteError);
          throw new Error('Failed to update invitation record');
        } else {
          console.log('✅ Invitation updated successfully');
        }

        // Create tenant record
        console.log('🔄 Creating tenant record...');
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            user_id: authData.user.id,
            apartment_id: invitation.apartment_id,
            dni: '', // Will be filled later by tenant
            phone: '', // Will be filled later by tenant
            emergency_contact_name: '',
            emergency_contact_phone: '',
            lease_start_date: new Date().toISOString().split('T')[0], // Today as default
            lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            deposit_amount: 0, // Will be filled later by admin
            is_active: true
          })
          .select()
          .single();

        if (tenantError) {
          console.error('❌ Failed to create tenant record:', tenantError);
          // Try to update existing tenant record if creation failed
          console.log('🔄 Attempting to update existing tenant record...');
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              user_id: authData.user.id,
              is_active: true
            })
            .eq('apartment_id', invitation.apartment_id)
            .eq('user_id', null);

          if (updateError) {
            console.error('❌ Failed to update existing tenant record:', updateError);
            throw new Error('Failed to create or update tenant record');
          } else {
            console.log('✅ Existing tenant record updated successfully');
          }
        } else {
          console.log('✅ Tenant record created successfully:', tenantData);
        }

        // Mark apartment as occupied
        console.log('🔄 Marking apartment as occupied...');
        const { error: apartmentError } = await supabase
          .from('apartments')
          .update({ is_occupied: true })
          .eq('id', invitation.apartment_id);

        if (apartmentError) {
          console.error('❌ Failed to mark apartment as occupied:', apartmentError);
          throw new Error('Failed to mark apartment as occupied');
        } else {
          console.log('✅ Apartment marked as occupied');
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Your invitation has been accepted and your account is ready.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded grid grid-cols-2 gap-0.5">
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Tenant Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You've been invited to join as a tenant in our property management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Invitation Details */}
          {invitation && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Invitation Details</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Name:</strong> {invitation.first_name} {invitation.last_name}</p>
                <p><strong>Email:</strong> {invitation.email}</p>
                {invitation.message && (
                  <p><strong>Message:</strong> {invitation.message}</p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed as it's linked to your invitation</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default InvitationSignupForm;
