'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Application {
  id: string
  name: string
  email: string
  company: string
  phone: string | null
  status: string
  verified_w9: boolean
  verified_insurance: boolean
  verified_license: boolean
  verified_external: boolean
  created_at: string
}

const ADMIN_EMAIL = 'heritagehousepainting@gmail.com'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('tradesource_admin')
    if (stored === 'authenticated') {
      setIsAuthenticated(true)
      fetchApplications()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password) {
      sessionStorage.setItem('tradesource_admin', 'authenticated')
      setIsAuthenticated(true)
      fetchApplications()
    } else {
      setError('Invalid credentials')
    }
  }

  const fetchApplications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data && data.length > 0) {
      setApplications(data)
    } else {
      // Fallback: read from localStorage
      const stored = localStorage.getItem('contractor_applications')
      if (stored) {
        setApplications(JSON.parse(stored))
      }
    }
    setLoading(false)
  }

  const updateVerification = async (id: string, field: string, value: boolean) => {
    const { error } = await supabase
      .from('contractor_applications')
      .update({ [field]: value })
      .eq('id', id)

    if (!error) {
      setApplications(applications.map(app => 
        app.id === id ? { ...app, [field]: value } : app
      ))
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, [field]: value })
      }
    }
  }

  const approveApplication = async (app: Application) => {
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          email: app.email,
          name: app.name,
          company: app.company
        })
      })
      const result = await res.json()
      if (result.error) {
        alert('Error: ' + result.error)
      } else {
        await supabase.from('contractor_applications').update({ status: 'approved' }).eq('id', app.id)
        alert('Success! Contractor account created.\nTemp password: ' + result.tempPassword)
        fetchApplications()
        setSelectedApp(null)
      }
    } catch (e) {
      alert('Error creating account')
    }
  }

  const rejectApplication = async (id: string) => {
    await supabase.from('contractor_applications').update({ status: 'rejected' }).eq('id', id)
    fetchApplications()
    setSelectedApp(null)
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('tradesource_admin')
    setIsAuthenticated(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>
      case 'rejected': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>
      default: return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
    }
  }

  const CheckIcon = ({ checked }: { checked: boolean }) => (
    <button
      onClick={(e) => { e.stopPropagation() }}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
        checked ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
      }`}
    >
      {checked && <span className="text-white text-sm">✓</span>}
    </button>
  )

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">TradeSource Contractor Approvals</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700">Sign In</button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource Admin</span>
          </div>
          <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">Sign Out</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contractor Applications</h1>
          <button onClick={fetchApplications} className="text-sm text-primary hover:underline">Refresh</button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500">No applications yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">W-9</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ins.</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lic.</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ext.</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr 
                      key={app.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="px-3 py-3 font-medium text-gray-900 text-sm">{app.name}</td>
                      <td className="px-3 py-3 text-gray-600 text-sm">{app.company}</td>
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateVerification(app.id, 'verified_w9', !app.verified_w9)}>
                          <CheckIcon checked={app.verified_w9} />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateVerification(app.id, 'verified_insurance', !app.verified_insurance)}>
                          <CheckIcon checked={app.verified_insurance} />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateVerification(app.id, 'verified_license', !app.verified_license)}>
                          <CheckIcon checked={app.verified_license} />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => updateVerification(app.id, 'verified_external', !app.verified_external)}>
                          <CheckIcon checked={app.verified_external} />
                        </button>
                      </td>
                      <td className="px-3 py-3">{getStatusBadge(app.status)}</td>
                      <td className="px-3 py-3 text-right">
                        {app.status === 'pending' && (
                          <span className="text-xs text-gray-400">Click to review →</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedApp.name}</h2>
                <p className="text-gray-600">{selectedApp.company}</p>
                <p className="text-gray-500 text-sm">{selectedApp.email}</p>
                {selectedApp.phone && <p className="text-gray-500 text-sm">{selectedApp.phone}</p>}
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Verification Checklist</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button 
                    onClick={() => updateVerification(selectedApp.id, 'verified_w9', !selectedApp.verified_w9)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedApp.verified_w9 ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedApp.verified_w9 && <span className="text-white text-sm">✓</span>}
                  </button>
                  <span className="text-sm text-gray-700">W-9 (Tax ID)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button 
                    onClick={() => updateVerification(selectedApp.id, 'verified_insurance', !selectedApp.verified_insurance)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedApp.verified_insurance ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedApp.verified_insurance && <span className="text-white text-sm">✓</span>}
                  </button>
                  <span className="text-sm text-gray-700">Proof of Insurance ($1M+ liability)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button 
                    onClick={() => updateVerification(selectedApp.id, 'verified_license', !selectedApp.verified_license)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedApp.verified_license ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedApp.verified_license && <span className="text-white text-sm">✓</span>}
                  </button>
                  <span className="text-sm text-gray-700">Business License</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button 
                    onClick={() => updateVerification(selectedApp.id, 'verified_external', !selectedApp.verified_external)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedApp.verified_external ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {selectedApp.verified_external && <span className="text-white text-sm">✓</span>}
                  </button>
                  <span className="text-sm text-gray-700">External Reviews (Google, Yelp, etc.)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => rejectApplication(selectedApp.id)}
                className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200"
              >
                Reject
              </button>
              <button
                onClick={() => approveApplication(selectedApp)}
                disabled={selectedApp.status !== 'pending'}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Approve & Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
