// App.tsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import Layout from './components/Layout/Layout'
import LoginForm from './components/Auth/LoginForm'
import Dashboard from './pages/Dashboard'
import Maintenance from './pages/Maintenance'
import Tenants from './pages/Tenants'
import Payments from './pages/Payments'
import Analytics from './pages/Analytics'
import Invitations from './pages/Invitations'
import Community from './pages/Community'
import './lib/i18n'

// rest of your code...

// Placeholder components for other pages







function App() {
  const { t } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  if (!user) {
    return <LoginForm />
  }

  const userData = {
    name: user.user_metadata?.first_name ? 
      `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() :
      user.email?.split('@')[0] || t('user'),
    email: user.email || '',
    userType: user.user_metadata?.user_type || 'admin'
  }

  return (
    <Router>
      <Layout user={userData}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App