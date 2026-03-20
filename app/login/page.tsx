'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, setCurrentUser, getUserByEmail, User } from '@/lib/store'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      router.push('/')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simple lookup by email - in production would use proper auth
      const user = getUserByEmail(email)
      
      if (!user) {
        // For demo: create a test approved user
        const testUser: User = {
          id: 'demo-' + Date.now(),
          fullName: 'Demo Painter',
          businessName: 'Demo Painting Co',
          email: email,
          phone: '(215) 555-0100',
          licenseNumber: 'PA12345',
          yearsExperience: 5,
          reviewLink: 'https://example.com/reviews',
          w9Data: null,
          insuranceData: null,
          status: 'approved',
          createdAt: new Date().toISOString()
        }
        // Save and login
        // For MVP demo, just set current user
      }

      if (user) {
        setCurrentUser(user)
        if (user.status === 'pending') {
          router.push('/pending')
        } else if (user.status === 'rejected') {
          setError('Your account has been rejected. Contact support.')
        } else {
          router.push('/')
        }
      } else {
        // Demo mode: create temp user
        const demoUser: User = {
          id: 'demo-' + Date.now(),
          fullName: 'Demo User',
          businessName: 'Demo Painting',
          email: email,
          phone: '(215) 555-0100',
          licenseNumber: 'PA00000',
          yearsExperience: 3,
          reviewLink: 'https://example.com',
          w9Data: null,
          insuranceData: null,
          status: 'approved',
          createdAt: new Date().toISOString()
        }
        setCurrentUser(demoUser)
        router.push('/')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.push('/')} className="icon-btn -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Sign In</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-6">
            Enter your email to access your TradeSource account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-4">
            New here? <button onClick={() => router.push('/apply')} className="text-gray-900 font-medium">Apply now</button>
          </p>
        </div>
      </main>
    </div>
  )
}
