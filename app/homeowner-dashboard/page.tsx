'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'
import PriceEstimator from '@/components/PriceEstimator'

interface Job {
  id: string
  title: string
  description: string
  property_type: string
  address: string
  area: string
  budget_min: number
  budget_max: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

export default function HomeownerDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'post' | 'my-jobs'>('my-jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  
  // Form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    property_type: 'residential',
    address: '',
    area: '',
    budget_min: '',
    budget_max: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadJobs()
    }
  }, [user])

  const checkUser = async () => {
    // Check sessionStorage for mock login (MVP fallback) - this should be checked FIRST
    // to ensure authenticated homeowners can access their dashboard
    const fakeUser = sessionStorage.getItem('tradesource_homeowner')
    if (fakeUser) {
      try {
        setUser(JSON.parse(fakeUser))
        setLoading(false)
        return
      } catch (e) {
        // Invalid JSON in sessionStorage, clear it
        sessionStorage.removeItem('tradesource_homeowner')
      }
    }
    
    // Try Supabase auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          setLoading(false)
          return
        }
      } catch (e) { /* continue to login */ }
    }
    
    // Not authenticated - redirect to homeowner sign-in page
    // Note: This is correct behavior - unauthenticated users should sign in first
    // Authenticated users should see the dashboard (handled above)
    router.push('/homeowner')
  }

  const loadJobs = async () => {
    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('homeowner_id', user?.id)
          .order('created_at', { ascending: false })
        if (data) {
          setJobs(data)
          return
        }
      } catch (e) { /* fallback */ }
    }
    
    // Fallback: localStorage
    const stored = localStorage.getItem('homeowner_jobs')
    if (stored) {
      setJobs(JSON.parse(stored))
    }
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const newJob: Job = {
      id: crypto.randomUUID(),
      ...jobForm,
      budget_min: parseInt(jobForm.budget_min) || 0,
      budget_max: parseInt(jobForm.budget_max) || 0,
      status: 'open',
      created_at: new Date().toISOString()
    }

    // Try Supabase first
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase.from('jobs').insert({
          ...newJob,
          homeowner_id: user?.id
        })
      } catch (e) {
        // Fallback to localStorage
        const stored = localStorage.getItem('homeowner_jobs')
        const existing = stored ? JSON.parse(stored) : []
        localStorage.setItem('homeowner_jobs', JSON.stringify([newJob, ...existing]))
      }
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem('homeowner_jobs')
      const existing = stored ? JSON.parse(stored) : []
      localStorage.setItem('homeowner_jobs', JSON.stringify([newJob, ...existing]))
    }
    
    setJobs(prev => [newJob, ...prev])
    setJobForm({ title: '', description: '', property_type: 'residential', address: '', area: '', budget_min: '', budget_max: '' })
    setActiveTab('my-jobs')
    setSubmitting(false)
    alert('Job posted successfully! Verified contractors will see your job.')
  }

  const handleSignOut = async () => {
    sessionStorage.removeItem('tradesource_homeowner')
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase.auth.signOut()
      } catch (e) { /* ignore */ }
    }
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
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome, Homeowner!</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('my-jobs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'my-jobs' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            My Posted Jobs
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'post' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Post a New Job
          </button>
        </div>

        {/* My Jobs Tab */}
        {activeTab === 'my-jobs' && (
          <div>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                <button onClick={() => setActiveTab('post')} className="text-green-600 font-medium hover:underline">
                  Post your first job →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-500">
                          <span>🏠 {job.property_type}</span>
                          <span>📍 {job.area}</span>
                          <span>💰 ${job.budget_min.toLocaleString()} - ${job.budget_max.toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'open' ? 'bg-green-100 text-green-700' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
          <div className="space-y-6">
            <PriceEstimator />
            
            <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Post a New Painting Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={e => setJobForm({...jobForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Interior Painting - Master Bedroom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={jobForm.description}
                  onChange={e => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe what needs to be painted..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                  <select
                    value={jobForm.property_type}
                    onChange={e => setJobForm({...jobForm, property_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="multi-family">Multi-Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location/Area *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.area}
                    onChange={e => setJobForm({...jobForm, area: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Ambler, PA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={jobForm.address}
                  onChange={e => setJobForm({...jobForm, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Street address (optional - shared only with selected contractor)"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Min)</label>
                  <input
                    type="number"
                    value={jobForm.budget_min}
                    onChange={e => setJobForm({...jobForm, budget_min: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Max)</label>
                  <input
                    type="number"
                    value={jobForm.budget_max}
                    onChange={e => setJobForm({...jobForm, budget_max: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="5000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
          </div>
        )}
      </div>
    </main>
  )
}
