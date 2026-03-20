'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getJobs, User, Job } from '@/lib/store'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    if (currentUser.status !== 'approved') {
      router.push('/pending')
      return
    }

    const allJobs = getJobs()
    const userJobs = allJobs.filter(j => j.posterId === currentUser.id)
    setJobs(userJobs)
    setLoading(false)
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
          <h1 className="text-xl font-bold text-gray-900 ml-2">Profile</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
              <p className="text-gray-500">{user.businessName}</p>
              <span className="trust-badge mt-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified Painter
              </span>
            </div>
          </div>

          {/* Trust Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 pt-4 border-t">Trust Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Experience</p>
                <p className="font-semibold">{user.yearsExperience}+ years</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">License</p>
                <p className="font-semibold text-sm truncate">{user.licenseNumber}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Verified Reviews</p>
              <a 
                href={user.reviewLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                External Reviews
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Member Since</p>
              <p className="font-semibold">{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-600">{user.phone}</span>
            </div>
          </div>
        </div>

        {/* My Posted Jobs */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">My Posted Jobs ({jobs.length})</h3>
          
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No jobs posted yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium text-gray-900">{job.title}</p>
                  <p className="text-sm text-gray-500">
                    {job.status === 'open' ? (
                      <span className="text-green-600">{job.interested.length} interested</span>
                    ) : job.status === 'assigned' ? (
                      <span className="text-blue-600">Assigned</span>
                    ) : (
                      <span className="text-gray-500">Completed</span>
                    )}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
