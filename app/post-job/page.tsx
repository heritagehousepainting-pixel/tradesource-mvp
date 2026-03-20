'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, saveJob, Job, User, generateId } from '@/lib/store'

export default function PostJobPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    timing: ''
  })

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

    setLoading(false)
  }, [router])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.timing.trim()) newErrors.timing = 'Timing is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !user) return

    setIsSubmitting(true)

    try {
      const job: Job = {
        id: generateId(),
        posterId: user.id,
        posterName: user.fullName,
        posterBusiness: user.businessName,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        timing: formData.timing,
        status: 'open',
        interested: [],
        createdAt: new Date().toISOString()
      }

      saveJob(job)
      router.push('/jobs')
    } catch (error) {
      console.error('Error posting job:', error)
      setErrors({ submit: 'Failed to post job. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.push('/')} className="icon-btn -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900 ml-2">Post a Job</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-6">
            Need help? Post a job and let other painters know you're available.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Interior painting - 3 bedroom house"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="2500"
                min="0"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Norristown, PA"
              />
              {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Timing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timing</label>
              <input
                type="text"
                value={formData.timing}
                onChange={e => setFormData({ ...formData, timing: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., This week, Flexible"
              />
              {errors.timing && <p className="text-red-600 text-sm mt-1">{errors.timing}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Describe the job details..."
                rows={4}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {errors.submit && (
              <p className="text-red-600 text-sm">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
