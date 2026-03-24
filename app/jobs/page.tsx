'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getOpenJobs, Job, User } from '@/lib/store'

// Surface detection hook for responsive layout
function useSurface() {
  const [surface, setSurface] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateSurface = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setSurface('desktop')
      } else if (width >= 768) {
        setSurface('tablet')
      } else {
        setSurface('mobile')
      }
    }

    updateSurface()
    window.addEventListener('resize', updateSurface)
    return () => window.removeEventListener('resize', updateSurface)
  }, [])

  return surface
}

export default function JobsPage() {
  const router = useRouter()
  const surface = useSurface()
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

    setJobs(getOpenJobs())
    setLoading(false)
  }, [router])

  // Responsive container classes
  const getContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'w-full px-6 py-6'
      case 'tablet':
        return 'w-full px-6 py-6'
      default:
        return 'w-full px-4 py-4'
    }
  }

  const getHeaderContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'w-full px-6'
      case 'tablet':
        return 'w-full px-6'
      default:
        return 'w-full px-4'
    }
  }

  const getGridClass = () => {
    switch (surface) {
      case 'desktop':
        return 'grid grid-cols-3 gap-4'
      case 'tablet':
        return 'grid grid-cols-2 gap-4'
      default:
        return 'space-y-4'
    }
  }

  const formatPrice = (price: number, userStatus: string) => {
    // Non-approved contractors see blurred prices
    if (userStatus !== 'approved') {
      return (
        <span className="blur-sm select-none text-gray-400" aria-label="Price hidden for non-vetted contractors">
          $_,___
        </span>
      )
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Check if job is urgent (posted more than 3 days ago)
  const isJobUrgent = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours > 72 // 3 days = 72 hours
  }

  // Get urgency message
  const getUrgencyMessage = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 1) return { text: 'Just posted!', color: 'bg-green-100 text-green-800' }
    if (diffHours < 24) return { text: 'Posted today', color: 'bg-green-100 text-green-800' }
    if (diffHours < 48) return { text: 'Last chance!', color: 'bg-orange-100 text-orange-800' }
    if (diffHours < 72) return { text: 'Expiring soon', color: 'bg-red-100 text-red-800' }
    return { text: 'May be filled', color: 'bg-gray-100 text-gray-600' }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className={getHeaderContainerClass()}>
          <div className="py-4 flex items-center justify-between">
            <button onClick={() => router.push('/')} className="icon-btn -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Find Work</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <main className={getContainerClass()}>
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Available</h2>
            <p className="text-gray-500 mb-4">Check back later for new opportunities.</p>
            <button
              onClick={() => router.push('/')}
              className="text-gray-900 font-medium"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className={getGridClass()}>
            {jobs.map(job => {
              const urgency = getUrgencyMessage(job.createdAt)
              const urgent = isJobUrgent(job.createdAt)
              return (
                <button
                  key={job.id}
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className={`job-card w-full text-left p-4 ${urgent ? 'border-l-4 border-l-red-500' : ''}`}
                >
                  {/* Trust indicators */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="trust-badge">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified
                    </span>
                    <span className="text-xs text-gray-500">
                      {job.posterBusiness}
                    </span>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${urgency.color}`}>
                      {urgency.text}
                    </span>
                  </div>

                {/* Job title */}
                <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>

                {/* Price - blurred for non-approved users */}
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {formatPrice(job.price, user.status)}
                </p>

                {/* Location & Timing */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {job.timing}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{formatDate(job.createdAt)}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    {job.interested.length} interested
                  </span>
                </div>
              </button>
            )})}
          </div>
        )}
      </main>
    </div>
  )
}