'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout, User } from '@/lib/store'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">TradeSource</h1>
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {!user ? (
          // Not logged in - show login/apply options
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Private network of vetted painters in Montgomery County, PA
              </p>
            </div>

            <button
              onClick={() => router.push('/apply')}
              className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl text-lg hover:bg-gray-800 transition"
            >
              Join the Network
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-4 px-6 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-xl text-lg hover:bg-gray-50 transition"
            >
              Sign In
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already a member? Sign in to access jobs
            </p>
          </div>
        ) : user.status === 'pending' ? (
          // Pending approval
          (router.push('/pending'), null)
        ) : user.status === 'rejected' ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your application was not approved.</p>
            <p className="text-sm text-gray-500">Contact support for more information.</p>
          </div>
        ) : (
          // Approved user - show main actions
          <div className="space-y-6">
            {/* User info */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-sm text-gray-500">{user.businessName}</p>
                </div>
                <span className="trust-badge ml-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified
                </span>
              </div>
            </div>

            {/* Main actions */}
            <div className="grid gap-4">
              <button
                onClick={() => router.push('/post-job')}
                className="w-full py-6 px-6 bg-gray-900 text-white font-semibold rounded-xl text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                POST A JOB
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className="w-full py-6 px-6 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-xl text-lg hover:bg-gray-50 transition flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                FIND WORK
              </button>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => router.push('/profile')}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm text-gray-600">Profile</span>
              </button>
              <button
                onClick={() => router.push('/jobs')}
                className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-sm text-gray-600">My Jobs</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
