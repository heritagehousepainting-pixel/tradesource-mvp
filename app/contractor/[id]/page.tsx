'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Contractor {
  id: string
  name: string
  email: string
  company: string
  phone: string
  license_number: string
  external_reviews: string
  status: string
  created_at: string
}

export default function ContractorProfilePage() {
  const searchParams = useSearchParams()
  const contractorId = searchParams.get('id')
  
  const [contractor, setContractor] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (contractorId) {
      loadContractor()
    }
  }, [contractorId])

  const loadContractor = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', contractorId)
        .eq('status', 'approved')
        .single()
      
      if (data) {
        setContractor(data)
      } else {
        setNotFound(true)
      }
    } catch (e) {
      // Try localStorage fallback
      const stored = localStorage.getItem('contractor_profiles')
      if (stored) {
        const profiles = JSON.parse(stored)
        const found = profiles.find((p: Contractor) => p.id === contractorId)
        if (found && found.status === 'approved') {
          setContractor(found)
        } else {
          setNotFound(true)
        }
      } else {
        setNotFound(true)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (notFound || !contractor) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contractor Not Found</h1>
            <p className="text-gray-600">This contractor may not exist or is not verified.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar + Name */}
            <div className="flex items-end mt-[-48px] mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {contractor.company?.charAt(0) || contractor.name.charAt(0)}
                </span>
              </div>
              <div className="ml-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{contractor.company}</h1>
                <p className="text-gray-600">{contractor.name}</p>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Contractor
              </span>
              <span className="text-gray-500 text-sm">Montgomery County, PA</span>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Contact</h3>
                <p className="text-gray-900">{contractor.email}</p>
                <p className="text-gray-900">{contractor.phone || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">License</h3>
                <p className="text-gray-900 font-mono">{contractor.license_number}</p>
              </div>
            </div>

            {/* External Reviews */}
            {contractor.external_reviews && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-2">External Reviews</h3>
                <a 
                  href={contractor.external_reviews} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  View on {new URL(contractor.external_reviews).hostname}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section (Placeholder) */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet.</p>
            <p className="text-sm mt-1">Reviews will appear here after completed jobs.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Need Painting Services?</h2>
          <p className="text-gray-600 mb-4">Post your job and get connected with verified contractors.</p>
          <a 
            href="/homeowner"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Post a Job
          </a>
        </div>
      </div>
    </main>
  )
}
