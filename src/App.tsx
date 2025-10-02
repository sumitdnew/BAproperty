// App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import Layout from './components/Layout/Layout'
import { BuildingProvider } from './context/BuildingContext'
import LoginForm from './components/Auth/LoginForm'
import SignupForm from './components/Auth/SignupForm'
import InvitationSignupForm from './components/Auth/InvitationSignupForm'
import Dashboard from './pages/Dashboard'
import Buildings from './pages/Buildings'
import Apartments from './pages/Apartments'
import Maintenance from './pages/Maintenance'
import Tenants from './pages/Tenants'
import Vendors from './pages/Vendors'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Invitations from './pages/Invitations'
import Community from './pages/Community'
import TenantDashboard from './pages/TenantDashboard'
import TenantMainDashboard from './pages/TenantMainDashboard'
import TenantMaintenance from './pages/TenantMaintenance'
import AuthTest from './pages/AuthTest'
import HomePage from './pages/HomePage'
import './lib/i18n'

// rest of your code...

// Placeholder components for other pages







function App() {
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Initialize language from saved preference
  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng') || sessionStorage.getItem('i18nextLng')
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang)
    }
  }, [i18n])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state change:', _event, session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Separate effect to fetch user profile when user changes
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_type')
            .eq('id', user.id)
            .single()
          
          console.log('User profile data:', profile)
          setUserProfile(profile)
        } catch (error) {
          console.log('No user profile found or error:', error)
          setUserProfile(null)
        }
      }
      
      fetchUserProfile()
    } else {
      setUserProfile(null)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-white rounded grid grid-cols-2 gap-0.5">
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
              <div className="bg-blue-600 rounded-sm"></div>
            </div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }


  const userData = user ? {
    name: user.user_metadata?.first_name ? 
      `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() :
      user.email?.split('@')[0] || t('user'),
    email: user.email || '',
    userType: userProfile?.user_type || user.user_metadata?.user_type || 'tenant' // Use profile data first, then metadata, then default to tenant
  } : null

  // Debug logging
  console.log('App.tsx - User:', user)
  console.log('App.tsx - UserProfile:', userProfile)
  console.log('App.tsx - UserData:', userData)
  console.log('App.tsx - Loading:', loading)

  return (
    <Router>
      <BuildingProvider>
        {user ? (
          <Layout user={userData || undefined}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/apartments" element={<Apartments />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/community" element={<Community />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/invitations" element={<Invitations />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/tenant-dashboard" element={<TenantDashboard />} />
              <Route path="/tenant-main-dashboard" element={<TenantMainDashboard />} />
              <Route path="/tenant-maintenance" element={<TenantMaintenance />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/auth-test" element={<AuthTest />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/invite" element={<InvitationSignupForm />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        )}
      </BuildingProvider>
    </Router>
  )
}

export default App