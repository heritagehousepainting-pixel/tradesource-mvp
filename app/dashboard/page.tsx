'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase'

interface Job {
  id: string
  title: string
  description: string
  property_type: string
  area: string
  budget_min: number
  budget_max: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at?: string
}

interface Contractor {
  id: string
  name: string
  email: string
  company: string
  phone: string
  license_number: string
  status: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'jobs' | 'post' | 'profile'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('unknown')
  
  // Form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    property_type: 'residential',
    area: '',
    budget_min: '',
    budget_max: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadJobs()
      loadContractor()
    }
  }, [user])

  const checkUser = async () => {
    // Try real Supabase auth first
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          // Check contractor verification status in database
          const { data: contractor } = await supabase
            .from('contractors')
            .select('status, name, email, company, phone, license_number')
            .eq('email', user.email)
            .single()

          if (contractor) {
            setContractor(contractor)
            setVerificationStatus(contractor.status)
          } else {
            const { data: app } = await supabase
              .from('contractor_applications')
              .select('status')
              .eq('email', user.email)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            
            if (app?.status) {
              setVerificationStatus(app.status)
            } else {
              setVerificationStatus('not_found')
            }
          }
          
          setLoading(false)
          return
        }
      } catch (e) {
        console.error('Supabase auth error:', e)
      }
    }
    
    // Fallback: Check sessionStorage for fake login (MVP)
    const fakeUser = sessionStorage.getItem('tradesource_user')
    if (fakeUser) {
      const userData = JSON.parse(fakeUser)
      setUser({ email: userData.email })
      
      // Check if approved
      const approved = JSON.parse(localStorage.getItem('approved_contractors') || '[]')
      const contractor = approved.find((c: any) => c.email === userData.email && c.status === 'approved')
      
      if (contractor) {
        setVerificationStatus('approved')
        setContractor(contractor)
      } else {
        setVerificationStatus('pending_review')
      }
      
      setLoading(false)
      return
    }
    
    router.push('/login')
  }

  const loadJobs = async () => {
    // Try Supabase first, fallback to localStorage
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('contractor_id', user?.id)
          .order('created_at', { ascending: false })
        if (data) {
          setJobs(data)
          return
        }
      } catch (e) { /* fallback */ }
    }
    
    // Fallback: localStorage
    const stored = localStorage.getItem('contractor_jobs')
    if (stored) {
      setJobs(JSON.parse(stored))
    }
  }

  const loadContractor = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase
          .from('contractors')
          .select('*')
          .eq('email', user?.email)
          .single()
        if (data) {
          setContractor(data)
          return
        }
      } catch (e) { /* fallback */ }
    }
    
    // Fallback: localStorage
    const stored = localStorage.getItem('contractor_profile')
    if (stored) {
      setContractor(JSON.parse(stored))
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

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase.from('jobs').insert({
          ...newJob,
          contractor_id: user?.id
        })
      } catch (e) {
        // Fallback to localStorage
        const stored = localStorage.getItem('contractor_jobs')
        const existing = stored ? JSON.parse(stored) : []
        localStorage.setItem('contractor_jobs', JSON.stringify([newJob, ...existing]))
      }
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem('contractor_jobs')
      const existing = stored ? JSON.parse(stored) : []
      localStorage.setItem('contractor_jobs', JSON.stringify([newJob, ...existing]))
    }

    setJobs(prev => [newJob, ...prev])
    setJobForm({ title: '', description: '', property_type: 'residential', area: '', budget_min: '', budget_max: '' })
    setActiveTab('jobs')
    setSubmitting(false)
    alert('Job posted successfully!')
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      description: job.description,
      property_type: job.property_type,
      area: job.area,
      budget_min: job.budget_min.toString(),
      budget_max: job.budget_max.toString()
    })
    setActiveTab('post')
  }

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingJob) return
    
    setSubmitting(true)
    
    const updatedJob: Job = {
      ...editingJob,
      title: jobForm.title,
      description: jobForm.description,
      property_type: jobForm.property_type,
      area: jobForm.area,
      budget_min: parseInt(jobForm.budget_min) || 0,
      budget_max: parseInt(jobForm.budget_max) || 0,
      updated_at: new Date().toISOString()
    }

    // Update local state
    setJobs(prev => prev.map(j => j.id === editingJob.id ? updatedJob : j))
    
    // Update localStorage
    const stored = localStorage.getItem('contractor_jobs')
    if (stored) {
      const existing = JSON.parse(stored)
      const updated = existing.map((j: Job) => j.id === editingJob.id ? updatedJob : j)
      localStorage.setItem('contractor_jobs', JSON.stringify(updated))
    }
    
    setEditingJob(null)
    setJobForm({ title: '', description: '', property_type: 'residential', area: '', budget_min: '', budget_max: '' })
    setActiveTab('jobs')
    setSubmitting(false)
    alert('Job updated successfully!')
  }

  const handleDeleteJob = (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    setJobs(prev => prev.filter(j => j.id !== jobId))
    
    const stored = localStorage.getItem('contractor_jobs')
    if (stored) {
      const existing = JSON.parse(stored)
      const updated = existing.filter((j: Job) => j.id !== jobId)
      localStorage.setItem('contractor_jobs', JSON.stringify(updated))
    }
  }

  const handleSignOut = async () => {
    sessionStorage.removeItem('tradesource_user')
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient()
        await supabase.auth.signOut()
      } catch (e) { /* ignore */ }
    }
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  // Show pending verification screen if not approved
  if (verificationStatus !== 'approved') {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span className="font-bold text-xl text-gray-900">TradeSource</span>
            </div>
            <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
              Sign Out
            </button>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h1>
            <p className="text-gray-600 mb-4">
              Your contractor application is currently under review.
            </p>
            <p className="text-sm text-gray-500">
              Status: <span className="font-medium text-yellow-700">{verificationStatus || 'pending_review'}</span>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              We typically verify applications within 48 hours. You'll receive an email once approved.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Contractor Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            My Jobs
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'post' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Post a Job
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            My Profile
          </button>
        </div>

        {/* Jobs List Tab */}
        {activeTab === 'jobs' && (
          <div>
            {jobs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
                <button onClick={() => setActiveTab('post')} className="text-blue-600 font-medium hover:underline">
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
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditJob(job)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        title="Edit this job"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                        title="Delete this job"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">
              {editingJob ? 'Edit Job' : 'Post a New Job'}
            </h2>
            <form onSubmit={editingJob ? handleUpdateJob : handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={e => setJobForm({...jobForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Interior Painting - 4 Bedroom House"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={jobForm.description}
                  onChange={e => setJobForm({...jobForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the job details..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                  <select
                    value={jobForm.property_type}
                    onChange={e => setJobForm({...jobForm, property_type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Ambler, PA"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Min) *</label>
                  <input
                    type="number"
                    required
                    value={jobForm.budget_min}
                    onChange={e => setJobForm({...jobForm, budget_min: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Max) *</label>
                  <input
                    type="number"
                    required
                    value={jobForm.budget_max}
                    onChange={e => setJobForm({...jobForm, budget_max: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {editingJob && (
                  <button
                    type="button"
                    onClick={() => { setEditingJob(null); setJobForm({ title: '', description: '', property_type: 'residential', area: '', budget_min: '', budget_max: '' }); }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (editingJob ? 'Updating...' : 'Posting...') : (editingJob ? 'Update Job' : 'Post Job')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && contractor && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">My Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{contractor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{contractor.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                <p className="text-gray-900 font-medium">{contractor.company}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{contractor.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">License #</label>
                <p className="text-gray-900">{contractor.license_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  contractor.status === 'approved' ? 'bg-green-100 text-green-700' :
                  contractor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {contractor.status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
