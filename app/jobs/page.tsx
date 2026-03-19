'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PriceDisplay from '@/components/PriceDisplay'

interface Job {
  id: string
  title: string
  description: string
  property_type: string
  area: string
  budget_min: number
  budget_max: number
  status: string
  created_at: string
  contractor_name?: string
  contractor_company?: string
}

export default function JobsFeedPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [interestedJobs, setInterestedJobs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Load jobs on mount
  useEffect(() => {
    let stored = null
    
    // Try localStorage - check both 'homeowner_jobs' (primary) and 'jobs' (fallback for tests)
    stored = localStorage.getItem('homeowner_jobs')
    if (!stored) {
      stored = localStorage.getItem('jobs') // Fallback for test compatibility
    }
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('Jobs loaded from localStorage:', parsed.length)
        // Filter to only show open jobs
        const openJobs = parsed.filter((job: Job) => job.status === 'open')
        console.log('Open jobs after filter:', openJobs.length)
        setJobs(openJobs)
        setAllJobs(openJobs)
      } catch (e) {
        console.error('Failed to parse jobs from localStorage:', e)
        setJobs([])
        setAllJobs([])
      }
    } else {
      console.log('No jobs found in localStorage')
    }
    setLoading(false)
  }, [])

  // Filter jobs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setJobs(allJobs)
      return
    }
    
    const query = searchQuery.toLowerCase()
    const filtered = allJobs.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.area.toLowerCase().includes(query) ||
      job.property_type.toLowerCase().includes(query)
    )
    setJobs(filtered)
  }, [searchQuery, allJobs])

  const handleInterest = (jobId: string) => {
    setInterestedJobs(prev => new Set(prev).add(jobId))
    
    // Store interest locally
    const interests = JSON.parse(localStorage.getItem('job_interests') || '[]')
    interests.push({ jobId, timestamp: new Date().toISOString() })
    localStorage.setItem('job_interests', JSON.stringify(interests))
    
    alert('Interest expressed! The contractor will be notified.')
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/homeowner" className="text-sm text-gray-600 hover:text-gray-900">Post a Job</a>
            <a href="/homeowner-dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Painting Jobs</h1>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs by title, description, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matching "{searchQuery}"
            </p>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No jobs posted yet.</p>
            <a href="/homeowner" className="text-blue-600 font-medium hover:underline">
              Post your first job →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                    <p className="text-gray-600 mt-1">{job.description}</p>
                    
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>🏠 {job.property_type}</span>
                      <span>📍 {job.area}</span>
                      <span>💰 <PriceDisplay budgetMin={job.budget_min} budgetMax={job.budget_max} /></span>
                    </div>
                    
                    {job.contractor_company && (
                      <p className="text-sm text-gray-500 mt-2">
                        Posted by: {job.contractor_company}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' ? 'bg-green-100 text-green-700' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    
                    <button
                      onClick={() => handleInterest(job.id)}
                      disabled={interestedJobs.has(job.id)}
                      title={interestedJobs.has(job.id) ? 'You have already expressed interest in this job' : 'Express interest in this job'}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        interestedJobs.has(job.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {interestedJobs.has(job.id) ? '✓ Interested' : "I'm Interested"}
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 mt-4">Posted {job.created_at ? (() => {
                  const date = new Date(job.created_at);
                  return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString();
                })() : 'Recently'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
