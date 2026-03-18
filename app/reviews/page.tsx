'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Review {
  id: string
  job_id: string
  reviewer_type: 'contractor' | 'homeowner'
  reviewer_name: string
  rating: number
  comment: string
  created_at: string
}

export default function JobReviewsPage() {
  const router = useRouter()
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    // Try localStorage
    const stored = localStorage.getItem('job_reviews')
    if (stored) {
      setReviews(JSON.parse(stored))
    }
    setLoading(false)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const newReview: Review = {
      id: crypto.randomUUID(),
      job_id: 'general',
      reviewer_type: 'homeowner', // Simplified for MVP
      reviewer_name: 'Homeowner',
      rating: formData.rating,
      comment: formData.comment,
      created_at: new Date().toISOString()
    }

    // Save to localStorage
    const stored = localStorage.getItem('job_reviews')
    const existing = stored ? JSON.parse(stored) : []
    localStorage.setItem('job_reviews', JSON.stringify([newReview, ...existing]))
    
    setReviews(prev => [newReview, ...prev])
    setShowForm(false)
    setFormData({ rating: 5, comment: '' })
    setSubmitting(false)
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Leave Review'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Leave a Review</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className="text-2xl"
                    >
                      {star <= formData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  rows={3}
                  value={formData.comment}
                  onChange={e => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience..."
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{'⭐'.repeat(review.rating)}</span>
                  <span className="text-sm text-gray-500">{review.reviewer_name}</span>
                  <span className="text-xs text-gray-400">• {new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
