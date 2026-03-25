'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, User } from '@/lib/store'

export default function Pending() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/apply')
      return
    }
    setUser(currentUser)
    
    // Check if user has been approved (polling - in real app would use push)
    const interval = setInterval(() => {
      const updatedUser = getCurrentUser()
      if (updatedUser?.status === 'approved') {
        setUser(updatedUser)
        router.push('/')
      } else if (updatedUser?.status === 'rejected') {
        setUser(updatedUser)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (user.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Application Status</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, your application to join TradeSource was not approved at this time.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            For questions, please contact support.
          </p>
          <button
            onClick={() => router.push('/')}
            className="py-3 px-6 bg-gray-900 text-white font-semibold rounded-xl"
          >
            Back to Home
          </button>
        </main>
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
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-600 mb-4">
            Your application to join TradeSource is being reviewed by our team.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong><br/>
              You'll receive an email within 1-2 business days with a decision on your application. Once approved, you'll be able to post jobs and find work in the network.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm text-left">
            <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Review
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            This page will update automatically. We'll email you when a decision has been made.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            ✓ Page polls every 5 seconds. Keep this window open to see real-time status updates.
          </p>

          {/* Navigation and help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Need help? Contact support or return home.</p>
            <div className="flex gap-3">
              <button onClick={() => router.push('/')} className="flex-1 py-2 px-4 bg-[#1e3a5f] text-white rounded-lg font-medium">
                Return Home
              </button>
              <button onClick={() => router.push('/')} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
