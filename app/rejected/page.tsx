'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/lib/store'

export default function Rejected() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Check if user has been re-approved (polling - in real app would use push)
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser()
      if (updatedUser?.status === 'approved') {
        setUser(updatedUser)
        router.push('/')
      } else if (updatedUser?.status === 'pending') {
        setUser(updatedUser)
        router.push('/pending')
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    // Clear session and redirect to login
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Application Status</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
          <p className="text-gray-600 mb-4">
            Unfortunately, your application to join TradeSource was not approved at this time.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>Why was I rejected?</strong><br/>
              Your application did not meet our current requirements for the TradeSource network. This could be due to incomplete information, verification issues, or capacity constraints.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Application</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="font-medium">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Business</dt>
                <dd className="font-medium">{user.businessName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Rejected
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              For questions about your application, please contact our support team.
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}