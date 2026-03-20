'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUsers, getPendingUsers, saveUser, User } from '@/lib/store'

// Simple admin code for MVP
const ADMIN_CODE = 'TSADMIN2024'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'vetting' | 'users'>('vetting')

  const loadUsers = () => {
    setPendingUsers(getPendingUsers())
    setAllUsers(getUsers())
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Invalid admin code')
    }
  }

  const handleApprove = (userId: string) => {
    const user = getUsers().find(u => u.id === userId)
    if (user) {
      user.status = 'approved'
      saveUser(user)
      loadUsers()
    }
  }

  const handleReject = (userId: string) => {
    const user = getUsers().find(u => u.id === userId)
    if (user) {
      user.status = 'rejected'
      saveUser(user)
      loadUsers()
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">TradeSource Admin</h1>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-gray-600 mb-6">Enter admin code to access the dashboard.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Code</label>
                <input
                  type="password"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter admin code"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800"
              >
                Access Dashboard
              </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-4">
              Demo code: {ADMIN_CODE}
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm text-gray-600"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('vetting')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium ${
              activeTab === 'vetting'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Vetting ({pendingUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium ${
              activeTab === 'users'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All Users ({allUsers.length})
          </button>
        </div>

        {activeTab === 'vetting' && (
          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-gray-500">No pending applications</p>
              </div>
            ) : (
              pendingUsers.map(user => (
                <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                      <p className="text-sm text-gray-500">{user.businessName}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <p><span className="text-gray-500">Email:</span> {user.email}</p>
                    <p><span className="text-gray-500">Phone:</span> {user.phone}</p>
                    <p><span className="text-gray-500">License:</span> {user.licenseNumber}</p>
                    <p><span className="text-gray-500">Experience:</span> {user.yearsExperience} years</p>
                    <p><span className="text-gray-500">Reviews:</span> <a href={user.reviewLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></p>
                    <p><span className="text-gray-500">Applied:</span> {formatDate(user.createdAt)}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {allUsers.map(user => (
              <div key={user.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.businessName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    user.status === 'approved' ? 'bg-green-100 text-green-800' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
