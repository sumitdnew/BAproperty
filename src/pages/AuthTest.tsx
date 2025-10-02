import React, { useState } from 'react'
import { testAuthAdmin, testCreateUser } from '../utils/testAuthAdmin'
import { testApartmentLinking, simulateSignupProcess } from '../utils/testApartmentLinking'
import { testSignup, testDatabaseAccess } from '../utils/testSignup'
import { testTenantCreation, testTenantRetrieval } from '../utils/testTenantCreation'
import { supabase } from '../lib/supabase'

const AuthTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])
    
    addResult('🚀 Starting authentication tests...')
    
    // Test 1: Check environment variables
    addResult('📋 Checking environment variables...')
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    addResult(`Service Key: ${serviceKey ? '✅ Configured' : '❌ Missing'}`)
    addResult(`Supabase URL: ${supabaseUrl ? '✅ Configured' : '❌ Missing'}`)
    addResult(`Anon Key: ${anonKey ? '✅ Configured' : '❌ Missing'}`)
    
    // Test 2: Test admin client
    addResult('🔧 Testing admin client...')
    const adminTest = await testAuthAdmin()
    addResult(`Admin Client: ${adminTest ? '✅ Working' : '❌ Failed'}`)
    
    // Test 3: Test regular client
    addResult('🔧 Testing regular client...')
    try {
      const { data, error } = await supabase.from('buildings').select('count').limit(1)
      addResult(`Regular Client: ${error ? '❌ Failed - ' + error.message : '✅ Working'}`)
    } catch (err) {
      addResult(`Regular Client: ❌ Failed - ${err}`)
    }
    
    // Test 4: Test user creation
    addResult('👤 Testing user creation...')
    const adminTestEmail = `test-${Date.now()}@example.com`
    const userTest = await testCreateUser(adminTestEmail, 'Test', 'User')
    addResult(`User Creation: ${userTest.success ? '✅ Success' : '❌ Failed - ' + userTest.error}`)
    
    if (userTest.success && userTest.userId) {
      // Test 5: Test user profile creation
      addResult('👤 Testing user profile creation...')
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userTest.userId,
            user_type: 'tenant',
            first_name: 'Test',
            last_name: 'User'
          })
        
        addResult(`User Profile: ${profileError ? '❌ Failed - ' + profileError.message : '✅ Success'}`)
      } catch (err) {
        addResult(`User Profile: ❌ Failed - ${err}`)
      }
    }
    
    // Test 6: Test database access
    addResult('🗄️ Testing database access...')
    const dbAccessTest = await testDatabaseAccess()
    addResult(`Database Access: ${dbAccessTest ? '✅ Success' : '❌ Failed'}`)
    
    // Test 7: Test signup process
    addResult('👤 Testing signup process...')
    const signupTestEmail = `test-signup-${Date.now()}@example.com`
    const signupTest = await testSignup(signupTestEmail, 'TestPass123!', 'Test', 'User')
    addResult(`Signup Process: ${signupTest.success ? '✅ Success' : '❌ Failed - ' + signupTest.error}`)
    
    // Test 8: Test apartment linking (if there are any invitations)
    addResult('🏠 Testing apartment linking...')
    try {
      const { data: invitations } = await supabase
        .from('invitations')
        .select('email')
        .limit(1)
      
      if (invitations && invitations.length > 0) {
        const linkingTestEmail = invitations[0].email
        const linkingTest = await testApartmentLinking(linkingTestEmail)
        addResult(`Apartment Linking: ${linkingTest ? '✅ Success' : '❌ Failed'}`)
      } else {
        addResult('Apartment Linking: ⚠️ No invitations found to test')
      }
    } catch (err) {
      addResult(`Apartment Linking: ❌ Failed - ${err}`)
    }
    
    // Test 9: Test tenant creation
    addResult('🏠 Testing tenant creation...')
    try {
      // Get a test apartment and user
      const { data: apartments } = await supabase
        .from('apartments')
        .select('id')
        .limit(1)
      
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_type', 'tenant')
        .limit(1)
      
      if (apartments && apartments.length > 0 && users && users.length > 0) {
        const tenantTest = await testTenantCreation(users[0].id, apartments[0].id)
        addResult(`Tenant Creation: ${tenantTest.success ? '✅ Success' : '❌ Failed - ' + tenantTest.error}`)
        
        if (tenantTest.success) {
          // Test tenant retrieval
          const retrievalTest = await testTenantRetrieval(users[0].id)
          addResult(`Tenant Retrieval: ${retrievalTest.success ? '✅ Success' : '❌ Failed - ' + retrievalTest.error}`)
        }
      } else {
        addResult('Tenant Creation: ⚠️ No apartments or tenant users found to test')
      }
    } catch (err) {
      addResult(`Tenant Creation: ❌ Failed - ${err}`)
    }
    
    addResult('🏁 Tests completed!')
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Test Results:</h2>
        <div className="space-y-1 font-mono text-sm">
          {testResults.map((result, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {result}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-yellow-700 space-y-1">
          <li>Click "Run Tests" to start the diagnostic</li>
          <li>Check the results above for any ❌ failures</li>
          <li>Look at your browser's console (F12) for additional error details</li>
          <li>Share the results if you need help troubleshooting</li>
        </ol>
      </div>
    </div>
  )
}

export default AuthTest
