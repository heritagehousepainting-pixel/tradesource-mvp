'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, getJobById, saveJob, Job, User } from '@/lib/store'

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [interested, setInterested] = useState(false)

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

    const jobId = params.id as string
    const foundJob = getJobById(jobId)
    
    if (!foundJob) {
      router.push('/jobs')
      return
    }

    setJob(foundJob)
    setInterested(foundJob.interested.includes(currentUser.id))
    setLoading(false)
  }, [router, params.id])

  const handleInterest = () => {
    if (!job || !user) return

    const newInterested = interested
      ? job.interested.filter(id => id !== user.id)
      : [...job.interested, user.id]

    const updatedJob = { ...job, interested: newInterested }
    saveJob(updatedJob)
    setJob(updatedJob)
    setInterested(!interested)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading || !user || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  const isOwnJob = job.posterId === user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.push('/jobs')} className="icon-btn -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Job Details</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          {/* Trust indicators */}
          <div className="flex items-center gap-2 mb-4">
            <span className="trust-badge">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified Painter
            </span>
          </div>

          {/* Poster info */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
              {job.posterName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{job.posterName}</p>
              <p className="text-sm text-gray-500">{job.posterBusiness}</p>
            </div>
          </div>

          {/* Job details */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
          
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {formatPrice(job.price)}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{job.timing}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Posted {formatDate(job.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          {/* Interest count */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            {job.interested.length} painters interested
          </div>

          {/* Actions */}
          {isOwnJob ? (
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/chat/${job.id}`)}
                className="w-full py-4 px-6 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                View Messages
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleInterest}
                className={`w-full py-4 px-6 font-semibold rounded-xl flex items-center justify-center gap-2 ${
                  interested
                    ? 'bg-green-100 text-green-800 border-2 border-green-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {interested ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interested
                  </>
                ) : (
                  <>
                    I'm Interested
                  </>
                )}
              </button>
              
              <button
                onClick={() => router.push(`/chat/${job.id}`)}
                className="w-full py-4 px-6 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message Poster
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
