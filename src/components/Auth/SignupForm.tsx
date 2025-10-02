import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import LanguageSwitcher from '../LanguageSwitcher';
import { useNavigate } from 'react-router-dom';
import Logo from '../Brand/Logo';

interface SignupFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onLoginClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<'admin' | 'property_manager' | 'building_owner'>('property_manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (authData.user) {
        console.log('✅ User created in auth.users:', authData.user.id);

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            user_type: userType, // Use selected user type for admin/manager signups
            first_name: firstName,
            last_name: lastName
          });

        if (profileError) {
          console.error('❌ Failed to create user profile:', profileError);
          // Don't throw here, continue with the process
        } else {
          console.log('✅ User profile created successfully');
        }

        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          // Navigate to login page after successful signup
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" pinColor="#FF385C" textColor="#1F2937" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('createAdminManagerAccount')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('managersSignupDescription')}
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>{t('note')}</strong> {t('tenantsMustUseInvite')}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('accountCreatedSuccessfully')}</h3>
            <p className="text-gray-600 mb-4">
              {t('verifyEmailNotice', { accountType: userType.replace('_', ' ') })}
            </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t('firstName')}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t('lastName')}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                {t('accountType')}
              </label>
              <select
                id="userType"
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'admin' | 'property_manager' | 'building_owner')}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="property_manager">{t('propertyManager')}</option>
                <option value="building_owner">{t('buildingOwner')}</option>
                <option value="admin">{t('systemAdministrator')}</option>
              </select>
            </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={false}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('creatingAccount') : t('createAccount')}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  {t('alreadyHaveAccountSignIn')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

export default SignupForm;
