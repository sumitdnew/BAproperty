import React from 'react'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    userType: string
  }
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      <main className="p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
}

export default Layout