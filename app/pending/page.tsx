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
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-600 mb-8">
            Your application is being reviewed by our team. We'll notify you once a decision has been made.
          </p>

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
            This page will update automatically. Typical review time: 1-2 business days.
          </p>
        </div>
      </main>
    </div>
  )
}
