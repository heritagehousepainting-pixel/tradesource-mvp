'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Blog posts data
const blogPosts = [
  {
    slug: 'why-verify-your-painting-business',
    title: 'Why Verify Your Painting Business in Montgomery County',
    excerpt: 'Learn how verification builds trust and gets you more quality leads in your local area.',
    date: '2026-03-15',
    category: 'Business Tips'
  },
  {
    slug: 'ai-pricing-guide-2026',
    title: 'AI Pricing Estimates: What Homeowners Need to Know',
    excerpt: 'Understanding how our AI pricing tool helps both homeowners and contractors.',
    date: '2026-03-10',
    category: 'Technology'
  },
  {
    slug: 'montgomery-county-paint-trends',
    title: 'Interior Paint Trends in Montgomery County for 2026',
    excerpt: 'Popular colors and finishes trending in homes across the Main Line and surrounding areas.',
    date: '2026-03-05',
    category: 'Design'
  }
]

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    license_number: '',
    external_reviews: ''
  })
  const [w9File, setW9File] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [formStatus, setFormStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Try to upload files to Supabase Storage
      let w9Path: string | null = null
      let insurancePath: string | null = null
      
      if (w9File || insuranceFile) {
        try {
          if (w9File) {
            const w9Ext = w9File.name.split('.').pop()
            const w9Name = `${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}_w9_${Date.now()}.${w9Ext}`
            const { data: w9Data, error: w9Error } = await supabase.storage
              .from('contractor-docs')
              .upload(w9Name, w9File)
            if (!w9Error && w9Data) w9Path = w9Data.path
          }
          
          if (insuranceFile) {
            const insExt = insuranceFile.name.split('.').pop()
            const insName = `${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}_insurance_${Date.now()}.${insExt}`
            const { data: insData, error: insError } = await supabase.storage
              .from('contractor-docs')
              .upload(insName, insuranceFile)
            if (!insError && insData) insurancePath = insData.path
          }
        } catch (uploadError) {
          console.log('Upload attempt completed (may have failed silently)')
        }
      }

      // Save application to Supabase
      const { data, error } = await supabase
        .from('contractor_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone || null,
          license_number: formData.license_number || null,
          external_reviews: formData.external_reviews || null,
          w9_doc_path: w9Path,
          insurance_doc_path: insurancePath,
          status: 'pending',
        })
      
      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Success! Application submitted. We will verify your info and contact you within 48 hours.')
        setFormData({ name: '', email: '', company: '', phone: '', license_number: '', external_reviews: '' })
        setW9File(null)
        setInsuranceFile(null)
      }
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">TradeSource</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-gray-600">
            <a href="#how-it-works" className="hover:text-primary">How It Works</a>
            <a href="#benefits" className="hover:text-primary">Benefits</a>
            <a href="#blog" className="hover:text-primary">Blog</a>
            <a href="#join" className="hover:text-primary">Join Network</a>
          </div>
          <div className="flex gap-2">
            <a href="/login" className="text-gray-600 px-4 py-2 text-sm font-medium hover:text-primary">
              Sign In
            </a>
            <a href="#join" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Get Started
            </a>
            <a href="/homeowner" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              For Homeowners
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-100 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
            Montgomery County, PA Only
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Verified Painting<br />Network
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with trusted, verified painting professionals in Montgomery County. 
            Contractors fill overflow jobs; homeowners get instant AI pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#join" className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700">
              Join Verified Network
            </a>
            <a href="/about" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50">
              Learn More
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Currently serving: Ambler, Blue Bell, Bryn Mawr, Conshohocken, Fort Washington, Gladwyne, Horsham, King of Prussia, Lansdale, Lower Gwynedd, Maple Glen, North Wales, Plymouth Meeting, Spring House, Willow Grove, & more.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* For Contractors */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Contractors</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Post overflow painting jobs
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Set fixed rates for services
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Review interested painters
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Connect directly with matches
                </li>
              </ul>
            </div>

            {/* For Homeowners */}
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">For Homeowners</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Post painting jobs for free
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Get AI instant pricing estimate
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  See interested verified painters
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Choose with confidence
                </li>
              </ul>
            </div>

            {/* Verification */}
            <div className="bg-purple-50 rounded-2xl p-8">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verification</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Business license verified
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Insurance coverage confirmed
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  References checked
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary">✓</span>
                  Background screened
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why TradeSource?</h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Built specifically for Montgomery County painting professionals and homeowners.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Local Only</div>
              <p className="text-gray-600">Verified contractors in Montgomery County means faster response times</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Fixed Rates</div>
              <p className="text-gray-600">Contractors set prices upfront—no haggling or surprises</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">AI Pricing</div>
              <p className="text-gray-600">Instant estimates help homeowners budget and contractors win jobs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100% Free</div>
              <p className="text-gray-600">Homeowners post and connect at no cost</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Latest from Our Blog</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section - Contractor Sign Up */}
      <section id="join" className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Join the Verified Network</h2>
            <p className="text-gray-400">
              Apply to become a verified painting contractor in Montgomery County
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8">
            {formStatus ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{formStatus}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Smith Painting LLC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="(215) 555-0123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload W-9 (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setW9File(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Insurance (optional)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setInsuranceFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="License #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">External Review Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.external_reviews}
                    onChange={(e) => setFormData({ ...formData, external_reviews: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://google.com/maps/..."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-xl text-white">TradeSource</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 TradeSource. Montgomery County, PA.
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
