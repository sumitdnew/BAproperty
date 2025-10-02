import React, { useState, useRef } from 'react'
import emailjs from '@emailjs/browser'

const EmailTest: React.FC = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const form = useRef<HTMLFormElement>(null)
  
  // Force the correct Public Key
  const envKey = import.meta.env.VITE_EMAILJS_USER_ID
  const emailjsPublicKey = envKey === 'E0G-u44Ys9PBcy6gP' ? '2eD5KJ_H_t0llmv08' : envKey
  const emailjsPrivateKey = import.meta.env.VITE_EMAILJS_PRIVATE_KEY

  const sendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')

    try {
      console.log('📧 Environment variable VITE_EMAILJS_USER_ID:', envKey)
      console.log('📧 Using Public Key (forced if needed):', emailjsPublicKey)
      console.log('📧 Private Key available:', !!emailjsPrivateKey)
      console.log('📧 Service ID:', 'service_7n6g698')
      console.log('📧 Template ID:', 'template_ln74jmx')
      
      // Send email using official EmailJS React pattern (exactly like the example)
      await emailjs.sendForm(
        'service_7n6g698', // Your actual EmailJS Service ID
        'template_ln74jmx', // Your actual EmailJS Template ID
        form.current!, // Form reference
        {
          publicKey: emailjsPublicKey,
        }
      ).then(
        () => {
          console.log('✅ SUCCESS!')
          setResult('✅ SUCCESS! Email sent successfully!')
        },
        (error) => {
          console.log('❌ FAILED...', error.text)
          setResult(`❌ FAILED: ${error.text}`)
        }
      )

    } catch (error: any) {
      console.error('❌ EmailJS error:', error)
      setResult(`❌ ERROR: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          EmailJS Test Page
        </h1>
        
        <form ref={form} onSubmit={sendTestEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="user_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="user_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Custom message for the test email..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !name}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-3 rounded-md ${
            result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">Configuration:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Public Key: {emailjsPublicKey || 'Not set'}</div>
            <div>Private Key: {emailjsPrivateKey ? '✅ Set' : '❌ Not set'}</div>
            <div>Service ID: service_7n6g698</div>
            <div>Template ID: template_ln74jmx</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailTest
