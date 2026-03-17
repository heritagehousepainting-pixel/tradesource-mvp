'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      setLoading(false)
    }
  }

  const loadJobs = async () => {
    // Try Supabase first, fallback to localStorage
    try {
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
    
    // Fallback: localStorage
    const stored = localStorage.getItem('contractor_jobs')
    if (stored) {
      setJobs(JSON.parse(stored))
    }
  }

  const loadContractor = async () => {
    try {
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

    try {
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

    setJobs(prev => [newJob, ...prev])
    setJobForm({ title: '', description: '', property_type: 'residential', area: '', budget_min: '', budget_max: '' })
    setActiveTab('jobs')
    setSubmitting(false)
    alert('Job posted successfully!')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
                    <p className="text-xs text-gray-400 mt-3">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-lg text-gray-900 mb-6">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4">
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Job'}
              </button>
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
