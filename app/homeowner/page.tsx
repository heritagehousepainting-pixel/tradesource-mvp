'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'

function HomeownerPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Check for signup mode - read from URL on mount to handle initial render
  const [isSignUp, setIsSignUp] = useState(false)
  
  // Initialize from URL search params on mount
  useEffect(() => {
    const mode = searchParams.get('mode')
    console.log('Search params mode:', mode)
    if (mode === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Use localStorage fallback for MVP
        if (isSignUp) {
          const homeowners = JSON.parse(localStorage.getItem('homeowners') || '[]')
          homeowners.push({
            ...formData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          })
          localStorage.setItem('homeowners', JSON.stringify(homeowners))
          
          // Store in session
          sessionStorage.setItem('tradesource_homeowner', JSON.stringify({
            email: formData.email,
            name: formData.name
          }))
          
          setSuccess('Account created! You can now post jobs.')
          setFormData({ name: '', email: '', password: '', phone: '' })
          router.push('/homeowner-dashboard')
        } else {
          // Login - check localStorage
          const homeowners = JSON.parse(localStorage.getItem('homeowners') || '[]')
          const user = homeowners.find((h: any) => h.email === formData.email && h.password === formData.password)
          
          if (user) {
            sessionStorage.setItem('tradesource_homeowner', JSON.stringify({
              email: user.email,
              name: user.name
            }))
            router.push('/homeowner-dashboard')
          } else {
            setError('Invalid email or password')
          }
        }
        setLoading(false)
        return
      }

      // Real Supabase auth
      const supabase = getSupabaseBrowserClient()
      
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        })
        
        if (signUpError) {
          setError(signUpError.message)
        } else if (data.user) {
          // Create homeowner profile
          await supabase.from('homeowners').insert({
            user_id: data.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null
          })
          setSuccess('Account created! Check your email to confirm, then you can post jobs.')
          setFormData({ name: '', email: '', password: '', phone: '' })
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          setError(signInError.message)
        } else if (data.user) {
          router.push('/homeowner-dashboard')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </a>
          <a href="/" className="text-sm text-gray-600 hover:text-primary">
            ← Back to Home
          </a>
        </div>
      </nav>

      <div className="pt-32 px-4 pb-16">
        <div className="max-w-md mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Homeowner Sign Up' : 'Homeowner Sign In'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isSignUp 
                ? 'Create an account to post painting jobs and get instant AI pricing estimates.'
                : 'Sign in to view your jobs and connected contractors.'}
            </p>
          </div>

          {/* Benefits for Homeowners */}
          <div className="bg-green-50 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Why Homeowners Love TradeSource</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Post jobs for <strong>free</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Get <strong>instant AI pricing</strong> estimates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Connect with <strong>verified, insured</strong> pros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>No obligation, no pressure</span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{success}</p>
                <button onClick={() => setSuccess('')} className="mt-4 text-primary hover:underline text-sm">
                  Back to form
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="John Smith"
                      required={isSignUp}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="(215) 555-0123"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setIsSignUp(false); setError(''); }} className="text-green-600 hover:underline font-medium">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  New to TradeSource?{' '}
                  <button onClick={() => { setIsSignUp(true); setError(''); }} className="text-green-600 hover:underline font-medium">
                    Create Account
                  </button>
                </>
              )}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            Contractors?{' '}
            <a href="/#join" className="text-primary hover:underline">
              Apply to join our network
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function HomeownerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <HomeownerPageContent />
    </Suspense>
  )
}
