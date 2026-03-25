'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getJobsAPI, User, getNotifications } from '@/lib/store'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.status !== 'approved') {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const loadData = async () => {
      const allJobs = await getJobsAPI()
      setJobs(allJobs)
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  if (!user) return null

  const myJobs = jobs.filter(j => j.posterId === user.id)
  const availableJobs = jobs.filter(j => j.status === 'open' && j.posterId !== user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">TradeSource Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome back, {user.fullName}</span>
            <button onClick={() => { localStorage.removeItem('tradesource_user'); router.push('/') }} className="text-sm hover:underline">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-[#1e3a5f]">{myJobs.length}</p>
              <p className="text-sm text-gray-500">My Active Jobs</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">{availableJobs.length}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">{jobs.filter(j => j.status === 'completed').length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600">{user.status === 'approved' ? '✓ Verified' : 'Pending'}</p>
              <p className="text-sm text-gray-500">Profile Status</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT - Primary */}
          <div className="col-span-2 space-y-6">
            {/* My Active Jobs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">My Active Jobs</h2>
              {myJobs.length === 0 ? (
                <p className="text-gray-500">No active jobs. Post one to get started!</p>
              ) : (
                <div className="space-y-3">
                  {myJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg hover:border-[#1e3a5f] transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.location} • ${job.budget_min}-${job.budget_max}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-800' : job.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>{job.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Opportunities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Opportunities</h2>
              {availableJobs.length === 0 ? (
                <p className="text-gray-500">No new opportunities available.</p>
              ) : (
                <div className="space-y-3">
                  {availableJobs.slice(0, 5).map(job => (
                    <div key={job.id} className="p-4 border rounded-lg hover:border-[#1e3a5f] transition cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.location} • ${job.budget_min}-${job.budget_max}</p>
                        </div>
                        <button className="text-sm text-[#1e3a5f] font-medium hover:underline">Express Interest →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT - Secondary */}
          <div className="space-y-6">
            {/* Network Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Network Activity</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contractors online</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jobs posted today</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jobs awarded today</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </div>

            {/* Profile Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">Email verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${user.licenseNumber ? 'text-green-500' : 'text-yellow-500'}`}>{user.licenseNumber ? '✓' : '!'}</span>
                  <span className="text-sm">{user.licenseNumber ? 'License on file' : 'Add license'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-sm">Verified contractor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
