'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUsersAPI, saveUser, User, getUserDocuments, UserDocuments, updateUserStatusAPI } from '@/lib/store'

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
  const [notification, setNotification] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [viewingDocument, setViewingDocument] = useState<{ name: string; data: string } | null>(null)

  const loadUsers = async () => {
    console.log('Loading users from API...')
    try {
      const users = await getUsersAPI()
      console.log('Got users:', users.length)
      const pending = users.filter((u: User) => u.status === 'pending')
      console.log('Pending:', pending.length)
      setPendingUsers(pending)
      setAllUsers(users)
    } catch (e) {
      console.error('Error loading users:', e)
    }
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

  const handleApprove = async (userId: string) => {
    const user = await updateUserStatusAPI(userId, 'approved')
    if (user) {
      setNotification(`✅ Approved ${(user as any).name || (user as any).email}`)
      setTimeout(() => setNotification(null), 3000)
      loadUsers()
    }
  }

  const handleReject = async (userId: string) => {
    const user = await updateUserStatusAPI(userId, 'rejected')
    if (user) {
      setNotification(`❌ Rejected ${(user as any).name || (user as any).email}`)
      setTimeout(() => setNotification(null), 3000)
      loadUsers()
    }
  }

  const handleRevoke = async (userId: string) => {
    const user = await updateUserStatusAPI(userId, 'rejected')
    if (user) {
      setNotification(`🔄 Revoked access for ${(user as any).fullName || (user as any).email}`)
      setTimeout(() => setNotification(null), 3000)
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

  const getUserDocStatus = (user: User): UserDocuments => {
    // First check new documents field
    if (user.documents) {
      return user.documents
    }
    // Fall back to legacy fields
    const docs: UserDocuments = {}
    if (user.w9Data) {
      docs.w9 = { name: 'W-9 Document', data: user.w9Data, uploadedAt: user.createdAt }
    }
    if (user.insuranceData) {
      docs.insurance = { name: 'Insurance Document', data: user.insuranceData, uploadedAt: user.createdAt }
    }
    return docs
  }

  const hasDocuments = (user: User): boolean => {
    const docs = getUserDocStatus(user)
    return !!(docs.insurance || docs.w9 || docs.license)
  }

  const renderDocumentStatus = (user: User) => {
    const docs = getUserDocStatus(user)
    const docTypes = [
      { key: 'insurance' as const, label: 'Insurance' },
      { key: 'w9' as const, label: 'W-9' },
      { key: 'license' as const, label: 'License' }
    ]
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
        <div className="space-y-2">
          {docTypes.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{label}:</span>
              {docs[key] ? (
                <button
                  onClick={() => setViewingDocument({ name: docs[key]!.name, data: docs[key]!.data })}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Uploaded ({docs[key]!.name})
                </button>
              ) : (
                <span className="text-gray-400">Not submitted</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Document viewer modal
  const documentViewerModal = viewingDocument ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingDocument(null)}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{viewingDocument.name}</h3>
          <button onClick={() => setViewingDocument(null)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {viewingDocument.data.startsWith('data:application/pdf') ? (
            <iframe
              src={viewingDocument.data}
              className="w-full h-[70vh] border-0"
              title="Document viewer"
            />
          ) : viewingDocument.data.startsWith('data:image') ? (
            <img src={viewingDocument.data} alt={viewingDocument.name} className="max-w-full h-auto" />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Document cannot be previewed</p>
              <a href={viewingDocument.data} download={viewingDocument.name} className="mt-2 inline-block text-blue-600 hover:underline">
                Download Document
              </a>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <a href={viewingDocument.data} download={viewingDocument.name} className="flex-1 py-2 px-4 bg-gray-900 text-white text-center rounded-lg font-medium hover:bg-gray-800">
            Download
          </a>
          <button onClick={() => setViewingDocument(null)} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null

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

  // Notification banner
  const notificationBanner = notification ? (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
      {notification}
    </div>
  ) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {notificationBanner}
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
        {/* Metrics Row */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{allUsers.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{allUsers.filter((u: User) => u.status === 'approved').length}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{allUsers.filter((u: User) => u.status === 'rejected').length}</div>
            <div className="text-xs text-gray-500">Rejected</div>
          </div>
        </div>

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
              pendingUsers.map(user => {
                const userHasDocuments = hasDocuments(user)
                return (
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

                  {/* Document Status */}
                  {renderDocumentStatus(user)}
                  
                  {/* Warning for no documents */}
                  {!userHasDocuments && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        ⚠️ No documents submitted - verify manually before approving
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
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
              )})
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
                <p className="text-sm text-gray-500 mb-3">{user.email}</p>
                
                {/* Action buttons based on status */}
                <div className="flex gap-2">
                  {user.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="flex-1 py-2 px-3 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="flex-1 py-2 px-3 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {user.status === 'approved' && (
                    <button
                      onClick={() => handleRevoke(user.id)}
                      className="flex-1 py-2 px-3 bg-orange-600 text-white text-sm rounded-lg font-medium hover:bg-orange-700"
                    >
                      Revoke Access
                    </button>
                  )}
                  {user.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="flex-1 py-2 px-3 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700"
                    >
                      Re-approve
                    </button>
                  )}
                </div>
                
                {/* Documents for All Users */}
                {renderDocumentStatus(user)}
              </div>
            ))}
          </div>
        )}
      </main>
      {documentViewerModal}
    </div>
  )
}
