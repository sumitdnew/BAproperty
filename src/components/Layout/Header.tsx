import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import LanguageSwitcher from '../LanguageSwitcher'
import Logo from '../Brand/Logo'
import { useBuildingContext } from '../../context/BuildingContext'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  user?: {
    name: string
    email: string
    userType: string
  }
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { buildings, selectedBuildingId, setSelectedBuildingId, loading } = useBuildingContext()
  

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Different navigation items based on user type
  const navigationItems = user?.userType === 'tenant' ? [
    // Tenant navigation
    { name: t('mainDashboard'), href: '/tenant-main-dashboard', icon: HomeIcon },
    { name: t('community'), href: '/community', icon: UserGroupIcon },
    { name: t('myPayments'), href: '/tenant-dashboard', icon: CreditCardIcon },
    { name: t('maintenance'), href: '/tenant-maintenance', icon: WrenchScrewdriverIcon },
  ] : [
    // Admin/Manager navigation
    { name: t('mainDashboard'), href: '/', icon: HomeIcon },
    { name: t('buildings'), href: '/buildings', icon: BuildingOfficeIcon },
    { name: t('apartments'), href: '/apartments', icon: HomeIcon },
    { name: t('tenants'), href: '/tenants', icon: UsersIcon },
    { name: t('invitations'), href: '/invitations', icon: EnvelopeIcon },
    { name: t('vendors'), href: '/vendors', icon: UsersIcon },
    { name: t('payments'), href: '/payments', icon: CreditCardIcon },
    { name: t('maintenance'), href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: t('community'), href: '/community', icon: UserGroupIcon },
    { name: t('analytics'), href: '/analytics', icon: ChartBarIcon },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Top bar with logo and user info */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white">
        <div className="flex items-center">
          <div className="mr-2 -ml-1 flex items-center">
            <Logo size="md" pinColor="#FF385C" textColor="#111827" />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Building selector - only show for admins/managers */}
          {user?.userType !== 'tenant' && (
            <div className="hidden sm:block">
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value as any)}
                className="bg-white text-gray-700 border border-blue-200 rounded-md px-2 py-1 text-sm"
                disabled={loading}
              >
                <option value="all">{t('all')}</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <LanguageSwitcher />
          
          <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></span>
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors sm:hidden"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>

          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || t('adminUser')}
              </p>
              <p className="text-xs text-gray-500">
                {user?.userType === 'tenant' ? t('tenant') : t('administrator')}
              </p>
            </div>
            <UserCircleIcon className="w-8 h-8 text-gray-600" />
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              title={t('logout')}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar - Desktop */}
      <nav className="hidden sm:block px-6 py-2 bg-white">
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <nav className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </div>
          
          {/* Mobile user info */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || t('adminUser')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.userType === 'tenant' ? t('tenant') : t('administrator')}
                  </p>
                </div>
              </div>
              {/* Building selector mobile - only show for admins/managers */}
              {user?.userType !== 'tenant' && (
                <div>
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value as any)}
                    className="bg-white text-gray-700 border border-gray-300 rounded-md px-2 py-2 text-sm"
                    disabled={loading}
                  >
                    <option value="all">{t('all')}</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={t('logout')}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header