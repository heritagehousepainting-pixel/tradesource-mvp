'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, saveJob, Job, User, generateId, notifyContractorsOfNewJob } from '@/lib/store'

// Surface detection hook for responsive layout
function useSurface() {
  const [surface, setSurface] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateSurface = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setSurface('desktop')
      } else if (width >= 768) {
        setSurface('tablet')
      } else {
        setSurface('mobile')
      }
    }

    updateSurface()
    window.addEventListener('resize', updateSurface)
    return () => window.removeEventListener('resize', updateSurface)
  }, [])

  return surface
}

export default function PostJobPage() {
  const router = useRouter()
  const surface = useSurface()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    timing: '',
    isUrgent: false
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

  // Responsive container classes
  const getContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'max-w-2xl mx-auto px-6 py-6'
      case 'tablet':
        return 'max-w-2xl mx-auto px-6 py-6'
      default:
        return 'max-w-md mx-auto px-4 py-6'
    }
  }

  const getHeaderContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'max-w-2xl mx-auto px-6'
      case 'tablet':
        return 'max-w-2xl mx-auto px-6'
      default:
        return 'max-w-md mx-auto px-4'
    }
  }

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
      const now = Date.now()
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
        createdAt: new Date().toISOString(),
        isUrgent: formData.isUrgent,
        urgentResponseDeadline: formData.isUrgent ? now + 15 * 60 * 1000 : undefined // 15 minutes
      }

      saveJob(job)
      
      // Notify contractors about new job
      notifyContractorsOfNewJob(job)
      
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
        <div className={getHeaderContainerClass()}>
          <div className="py-4 flex items-center">
            <button onClick={() => router.push('/')} className="icon-btn -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-2">Post a Job</h1>
          </div>
        </div>
      </header>

      <main className={getContainerClass()}>
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

            {/* Urgent Toggle */}
            <div className={`p-4 rounded-lg border-2 ${formData.isUrgent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">URGENT — Need help ASAP</p>
                    <p className="text-sm text-gray-500">Contractors will see this prioritized</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={e => setFormData({ ...formData, isUrgent: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${formData.isUrgent ? 'bg-red-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${formData.isUrgent ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>
              </label>
              {formData.isUrgent && (
                <p className="mt-2 text-sm text-red-600">
                  ⚡ Responses expected within 15 minutes
                </p>
              )}
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