import React from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  UserGroupIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const Sidebar: React.FC = () => {
  const { t } = useTranslation()

  const navigationItems = [
    { name: t('mainDashboard'), href: '/', icon: HomeIcon },
    { name: t('maintenance'), href: '/maintenance', icon: WrenchScrewdriverIcon },
    { name: t('community'), href: '/community', icon: UserGroupIcon },
    { name: t('tenants'), href: '/tenants', icon: UsersIcon },
    { name: t('invitations'), href: '/invitations', icon: EnvelopeIcon },
    { name: t('payments'), href: '/payments', icon: CreditCardIcon },
    { name: t('analytics'), href: '/analytics', icon: ChartBarIcon },
    
  ]

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <div className="w-6 h-6 bg-blue-600 rounded grid grid-cols-2 gap-0.5">
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
              <div className="bg-white rounded-sm"></div>
            </div>
          </div>
          <span className="text-white font-bold text-lg">BA Property Manager</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar