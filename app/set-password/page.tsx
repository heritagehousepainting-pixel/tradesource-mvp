'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { setCurrentUser, getUserById, User } from '@/lib/store'

function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Validate token from URL
    const token = searchParams.get('token')
    const userIdParam = searchParams.get('userId')
    
    if (!token || !userIdParam) {
      setError('Invalid link. Please check your email for the correct URL.')
      return
    }

    // In a real app, you'd validate the token against a backend
    // For MVP, we'll validate that:
    // 1. The token exists in localStorage tokens
    // 2. The user exists
    // 3. The token hasn't expired
    
    const tokens = JSON.parse(localStorage.getItem('tradesource_password_tokens') || '{}')
    const tokenData = tokens[token]
    
    if (!tokenData) {
      setError('Invalid link. This token may have expired or already been used.')
      return
    }
    
    // Check if token is for this user
    if (tokenData.userId !== userIdParam) {
      setError('Invalid link. Token does not match user.')
      return
    }
    
    // Check if token has expired (24 hours)
    const tokenAge = Date.now() - tokenData.createdAt
    if (tokenAge > 24 * 60 * 60 * 1000) {
      setError('This link has expired. Please request a new password setup link.')
      return
    }
    
    // Check if user exists
    const user = getUserById(userIdParam)
    if (!user) {
      setError('User not found. Please contact support.')
      return
    }
    
    setUserId(userIdParam)
    setValidToken(true)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // In a real app, this would call a backend API
      // For MVP, we'll update localStorage directly
      
      if (userId) {
        const user = getUserById(userId)
        if (user) {
          // Store the password hash (in real app, never store plain text)
          const tokens = JSON.parse(localStorage.getItem('tradesource_password_tokens') || '{}')
          const token = searchParams.get('token')
          if (token) {
            delete tokens[token]
          }
          localStorage.setItem('tradesource_password_tokens', JSON.stringify(tokens))
          
          // Update user with password (in real app, this would be hashed)
          user.passwordHash = password // For demo purposes
          const { saveUser } = await import('@/lib/store')
          saveUser(user)
          
          // Log the user in
          setCurrentUser(user)
          router.push('/')
        } else {
          setError('User not found. Please contact support.')
        }
      }
    } catch (err) {
      setError('Failed to set password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Surface detection for responsive design
  const [surface, setSurface] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateSurface = () => {
      const width = window.innerWidth
      if (width >= 1024) setSurface('desktop')
      else if (width >= 768) setSurface('tablet')
      else setSurface('mobile')
    }
    updateSurface()
    window.addEventListener('resize', updateSurface)
    return () => window.removeEventListener('resize', updateSurface)
  }, [])

  const getContainerClass = () => {
    switch (surface) {
      case 'desktop': return 'max-w-md mx-auto px-4 py-8'
      case 'tablet': return 'max-w-md mx-auto px-4 py-8'
      default: return 'max-w-md mx-auto px-4 py-6'
    }
  }

  if (!validToken && error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center">
            <button onClick={() => router.push('/')} className="icon-btn -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-2">Invalid Link</h1>
          </div>
        </header>

        <main className={getContainerClass()}>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/login')}
                className="text-gray-900 font-medium hover:underline"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </main>
      </div>
    )
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
          <h1 className="text-xl font-bold text-gray-900 ml-2">Set Your Password</h1>
        </div>
      </header>

      <main className={getContainerClass()}>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-6">
            Create a secure password for your TradeSource account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !validToken}
              className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Setting password...' : 'Set Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="spinner"></div>
    </div>
  )
}

export default function SetPassword() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SetPasswordContent />
    </Suspense>
  )
}