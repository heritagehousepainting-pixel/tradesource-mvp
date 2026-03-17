'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomeownerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/homeowner')
    } else {
      setUser(user)
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/homeowner')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TradeSource</span>
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-green-600 font-medium">Homeowner</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Welcome, Homeowner!</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Post a Job */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Post a Painting Job</h3>
            <p className="text-gray-600 text-sm mb-4">Describe your project and get instant AI pricing estimates from verified contractors.</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              Coming Soon
            </button>
          </div>

          {/* My Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">My Posted Jobs</h3>
            <p className="text-gray-600 text-sm mb-4">View your job postings, contractor responses, and AI estimates.</p>
            <button className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2">🚧 Coming Soon</h3>
          <p className="text-yellow-700 text-sm">
            We're building the homeowner experience! Soon you'll be able to post jobs, 
            get instant AI pricing estimates, and connect with verified Montgomery County painters.
          </p>
        </div>
      </div>
    </main>
  )
}
