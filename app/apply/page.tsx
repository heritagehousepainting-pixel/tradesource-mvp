'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveUser, setCurrentUser, generateId, User, saveDocument } from '@/lib/store'

export default function Apply() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    yearsExperience: '',
    reviewLink: '',
    w9File: null as File | null,
    insuranceFile: null as File | null,
    licenseFile: null as File | null
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required'
    if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience is required'
    if (!formData.reviewLink.trim()) newErrors.reviewLink = 'Review link is required'
    else if (!formData.reviewLink.startsWith('http')) {
      newErrors.reviewLink = 'Please enter a valid URL'
    }
    if (!formData.w9File) newErrors.w9File = 'W-9 document is required'
    if (!formData.insuranceFile) newErrors.insuranceFile = 'Insurance document is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'w9File' | 'insuranceFile' | 'licenseFile') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, [field]: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    try {
      // Convert files to base64
      const w9Data = formData.w9File ? await readFileAsDataURL(formData.w9File) : null
      const insuranceData = formData.insuranceFile ? await readFileAsDataURL(formData.insuranceFile) : null
      const licenseData = formData.licenseFile ? await readFileAsDataURL(formData.licenseFile) : null

      const user: User = {
        id: generateId(),
        fullName: formData.fullName,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        licenseNumber: formData.licenseNumber,
        yearsExperience: parseInt(formData.yearsExperience),
        reviewLink: formData.reviewLink,
        w9Data,
        insuranceData,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      saveUser(user)
      
      // Save documents using the new document management system
      if (formData.w9File && w9Data) {
        saveDocument(user.id, 'w9', w9Data, formData.w9File.name)
      }
      if (formData.insuranceFile && insuranceData) {
        saveDocument(user.id, 'insurance', insuranceData, formData.insuranceFile.name)
      }
      if (formData.licenseFile && licenseData) {
        saveDocument(user.id, 'license', licenseData, formData.licenseFile.name)
      }
      
      // Refresh user data with documents
      setCurrentUser({ ...user, documents: { w9: formData.w9File ? { name: formData.w9File.name, data: w9Data!, uploadedAt: new Date().toISOString() } : undefined, insurance: formData.insuranceFile ? { name: formData.insuranceFile.name, data: insuranceData!, uploadedAt: new Date().toISOString() } : undefined, license: formData.licenseFile ? { name: formData.licenseFile.name, data: licenseData!, uploadedAt: new Date().toISOString() } : undefined } })
      router.push('/pending')
    } catch (error) {
      console.error('Error submitting application:', error)
      setErrors({ submit: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
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
          <h1 className="text-xl font-bold text-gray-900 ml-2">Join TradeSource</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-gray-600 mb-6">
            Complete the application below to join our vetted network of painters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="John Smith"
              />
              {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Smith Painting LLC"
              />
              {errors.businessName && <p className="text-red-600 text-sm mt-1">{errors.businessName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="john@smithpainting.com"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="(215) 555-0123"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="PA License #"
              />
              {errors.licenseNumber && <p className="text-red-600 text-sm mt-1">{errors.licenseNumber}</p>}
            </div>

            {/* Years Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <select
                value={formData.yearsExperience}
                onChange={e => setFormData({ ...formData, yearsExperience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select experience</option>
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="5">5 years</option>
                <option value="10">10+ years</option>
              </select>
              {errors.yearsExperience && <p className="text-red-600 text-sm mt-1">{errors.yearsExperience}</p>}
            </div>

            {/* Review Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">External Review Link (min 1)</label>
              <input
                type="url"
                value={formData.reviewLink}
                onChange={e => setFormData({ ...formData, reviewLink: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="https://www.google.com/reviews/..."
              />
              {errors.reviewLink && <p className="text-red-600 text-sm mt-1">{errors.reviewLink}</p>}
            </div>

            {/* W-9 Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">W-9 (PDF)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => handleFileChange(e, 'w9File')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:cursor-pointer"
              />
              {errors.w9File && <p className="text-red-600 text-sm mt-1">{errors.w9File}</p>}
            </div>

            {/* Insurance Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Insurance (PDF)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={e => handleFileChange(e, 'insuranceFile')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:cursor-pointer"
              />
              {errors.insuranceFile && <p className="text-red-600 text-sm mt-1">{errors.insuranceFile}</p>}
            </div>

            {/* License Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business License (PDF)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={e => handleFileChange(e, 'licenseFile')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:cursor-pointer"
              />
            </div>

            {errors.submit && (
              <p className="text-red-600 text-sm">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
