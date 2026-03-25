'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout, User, getNotifications, markAllNotificationsRead, getUnreadNotificationCount, updateLastVisit, getActivitySummary, checkAndGenerateNotifications, Notification, getPlatformStats, TESTIMONIALS } from '@/lib/store'

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

export default function Home() {
  const router = useRouter()
  const surface = useSurface()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activity, setActivity] = useState({ newJobsToday: 0, newJobsLastHour: 0, activeContractors: 0, expiringJobs: 0 })
  const [stats, setStats] = useState({ totalPainters: 0, activeToday: 0, workingNow: 0, jobsCompleted: 0, avgJobValue: 0 })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    // Update last visit for habit tracking
    updateLastVisit()
    
    // Check for new notifications if user is logged in
    if (currentUser && currentUser.status === 'approved') {
      checkAndGenerateNotifications(currentUser.id)
    }
    
    // Load activity summary
    setActivity(getActivitySummary())
    
    // Load platform stats
    setStats(getPlatformStats())
    
    // Load notifications
    setNotifications(getNotifications())
    setUnreadCount(getUnreadNotificationCount())
    
    setLoading(false)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    setNotifications(getNotifications())
    setUnreadCount(0)
  }

  // Get time-based greeting for habit hooks
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { title: 'Good morning!', subtitle: 'Start your day with new opportunities' }
    if (hour < 17) return { title: 'Good afternoon!', subtitle: 'Check out the latest jobs' }
    return { title: 'Good evening!', subtitle: 'Wrap up your day - any updates?' }
  }

  const greeting = getTimeBasedGreeting()

  // Responsive container classes
  const getContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'w-full px-6 py-8'
      case 'tablet':
        return 'w-full px-6 py-8'
      default:
        return 'w-full px-4 py-8'
    }
  }

  // Header container classes
  const getHeaderContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'w-full px-6'
      case 'tablet':
        return 'w-full px-6'
      default:
        return 'w-full px-4'
    }
  }

  // Notification dropdown container classes
  const getNotificationContainerClass = () => {
    switch (surface) {
      case 'desktop':
        return 'w-full px-6'
      case 'tablet':
        return 'w-full px-6'
      default:
        return 'w-full px-4'
    }
  }

  // Grid classes for desktop multi-column layout
  const getMainGridClass = () => {
    switch (surface) {
      case 'desktop':
        return 'grid grid-cols-12 gap-6'
      case 'tablet':
        return 'grid grid-cols-2 gap-4'
      default:
        return 'space-y-6'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className={getHeaderContainerClass()}>
          <div className="py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Paint brush icon */}
              <svg className="w-8 h-8 text-[#1e3a5f]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71 5.63l-2.34-2.34a1 1 0 00-1.41 0l-3.12 3.12-1.42-1.41-1.41 1.41 1.41 1.41-1.42 1.42a1 1 0 00-.29.71V19a1 1 0 001 1h2.83a1 1 0 00.71-.29l1.42-1.42 1.41 1.41 1.42-1.41-1.41-1.41 3.12-3.12a1 1 0 000-1.42zM7 17a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
              <h1 className="text-xl font-bold text-[#1e3a5f]">TradeSource</h1>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Dropdown */}
      {showNotifications && user && (
        <div className="bg-white border-b border-gray-200 shadow-lg">
          <div className={getNotificationContainerClass()}>
            <div className="py-3 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-sm text-[#1e3a5f] hover:text-[#2d5a87]"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="pb-4 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No notifications yet</p>
              ) : (
                notifications.slice(0, 5).map(notif => (
                  <div 
                    key={notif.id}
                    className={`py-3 border-b border-gray-100 last:border-0 ${!notif.read ? 'bg-blue-50' : ''}`}
                  >
                    <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className={getContainerClass()}>
        {!user ? (
          // Not logged in - show clear value proposition with social proof
          <div className={surface === 'desktop' ? 'grid grid-cols-2 gap-8' : surface === 'tablet' ? 'grid grid-cols-2 gap-6' : 'space-y-6'}>
            {/* Left column - Stats & Value prop (full width on desktop grid) */}
            <div className={surface === 'desktop' ? 'col-span-1' : ''}>
              {/* Platform stats banner - Enhanced with density signals */}
              <div className="bg-gradient-to-r from-[#1e3a5f] via-[#234b7a] to-[#1e3a5f] rounded-xl p-5 text-white shadow-xl mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm font-semibold">🔥 Live Network</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="font-medium">4.9/5 avg rating</span>
                  </div>
                </div>
                
                {/* Primary stats - Larger, more prominent */}
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-3xl font-bold">{stats.activeToday}</p>
                    <p className="text-xs text-blue-200 font-medium">painters online</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-3xl font-bold">{stats.workingNow}</p>
                    <p className="text-xs text-blue-200 font-medium">working now</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-3xl font-bold">{stats.totalPainters}</p>
                    <p className="text-xs text-blue-200 font-medium">in network</p>
                  </div>
                </div>
                
                {/* Density signals - Scale indicators */}
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  <span className="bg-green-500/20 text-green-100 px-2 py-1 rounded-full">✓ {activity.newJobsToday} new today</span>
                  <span className="bg-blue-500/20 text-blue-100 px-2 py-1 rounded-full">✓ {stats.jobsCompleted.toLocaleString()}+ jobs done</span>
                  <span className="bg-purple-500/20 text-purple-100 px-2 py-1 rounded-full">✓ Growing daily</span>
                </div>
              </div>

              {/* Hero section - Strong headline with urgency */}
              <div className="text-center mb-6">
                {/* Urgency badge */}
                <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-semibold text-red-700">
                    {activity.newJobsLastHour > 0 ? `${activity.newJobsLastHour} jobs posted in the last hour` : '47 painters available now'}
                  </span>
                </div>
                
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                  <span className="text-[#1e3a5f]">Trusted Painters.</span>
                  <br />
                  <span className="text-[#2563eb]">Available Now.</span>
                </h2>
                <p className="text-gray-600 mb-4 text-lg">
                  When your crew doesn't show or you've got more work than you can handle — get <span className="font-semibold text-[#1e3a5f]">vetted, local painters</span> in minutes. Not hours.
                </p>
                
                {/* Problem/Solution tags */}
                <div className="flex flex-wrap justify-center gap-2 text-sm mb-4">
                  <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full font-medium">⚡ Crew didn't show?</span>
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium">📋 Overwhelmed with work?</span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-medium">💼 Need steady work?</span>
                </div>
                
                {/* Volume indicator */}
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>1,247 jobs completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </div>

              {/* Paint swatches - Visual authority */}
              <div className="flex justify-center gap-2 py-3">
                <div className="paint-swatch w-8 h-8 rounded-lg shadow-md" style={{background: '#2563eb'}}></div>
                <div className="paint-swatch w-8 h-8 rounded-lg shadow-md" style={{background: '#059669'}}></div>
                <div className="paint-swatch w-8 h-8 rounded-lg shadow-md" style={{background: '#ea580c'}}></div>
                <div className="paint-swatch w-8 h-8 rounded-lg shadow-md" style={{background: '#7c3aed'}}></div>
                <div className="paint-swatch w-8 h-8 rounded-lg shadow-md" style={{background: '#dc2626'}}></div>
                <span className="text-xs text-gray-400 self-center ml-2">Professional painters</span>
              </div>

              {/* Primary action: Contractors who need painters - High visibility */}
              <div className="relative mb-6">
                <button
                  onClick={() => router.push('/apply')}
                  className="w-full py-5 px-6 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white font-bold rounded-xl text-lg hover:from-[#2d5a87] hover:to-[#3d7ab5] transition shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    I Need Painters — Get Help Now
                  </span>
                </button>
                {/* Urgency indicator */}
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {activity.newJobsToday > 0 ? `🔥 ${activity.newJobsToday} today` : 'Available'}
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500 font-medium">or</span>
                </div>
              </div>

              {/* Secondary action: Painters looking for work - Enhanced */}
              <div className="relative">
                <button
                  onClick={() => router.push('/apply')}
                  className="w-full py-5 px-6 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold rounded-xl text-lg hover:bg-[#f0f7ff] transition shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    I'm a Painter — Find Work
                  </span>
                </button>
                {/* Work availability indicator */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  💼 {activity.newJobsToday > 0 ? `${activity.newJobsToday} jobs` : 'Active'}
                </div>
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">or</span>
                </div>
              </div>

              {/* Homeowner signup - Simple account creation */}
              <button
                onClick={() => router.push('/signup')}
                className="w-full mt-4 py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </span>
              </button>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500">already a member?</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full mt-6 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
              >
                Sign In
              </button>
            </div>

            {/* Right column - Testimonials & Trust (desktop only) */}
            {surface === 'desktop' && (
              <div className="col-span-1 space-y-6">
                {/* Trust indicators - Enhanced with visual authority */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Vetted</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Local</span>
                    </div>
                  </div>
                </div>

                {/* Testimonials section - Enhanced with visual authority */}
                <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">What painters say</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{TESTIMONIALS.length} reviews</span>
                  </div>
                  <div className="space-y-4">
                    {TESTIMONIALS.map((testimonial) => (
                      <div key={testimonial.id} className="testimonial-card p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-[#1e3a5f] transition">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 italic">"{testimonial.quote}"</p>
                        <p className="text-xs text-gray-500 mt-2 font-semibold">{testimonial.author}</p>
                        <p className="text-xs text-gray-400">{testimonial.business}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jobs completed counter */}
                <div className="text-center py-4 bg-white rounded-xl shadow-md">
                  <p className="text-3xl font-bold text-[#1e3a5f]">{stats.jobsCompleted.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500">jobs completed through TradeSource</p>
                </div>
              </div>
            )}

            {/* Mobile/tablet: inline testimonials after value prop */}
            {(surface === 'mobile' || surface === 'tablet') && (
              <>
                {/* Trust indicators - Enhanced with visual authority */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-green-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Vetted</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      </div>
                      <span className="font-semibold">Local</span>
                    </div>
                  </div>
                </div>

                {/* Testimonials section - Enhanced with visual authority */}
                <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">What painters say</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{TESTIMONIALS.length} reviews</span>
                  </div>
                  <div className="space-y-4">
                    {TESTIMONIALS.map((testimonial) => (
                      <div key={testimonial.id} className="testimonial-card p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-[#1e3a5f] transition">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-700 italic">"{testimonial.quote}"</p>
                        <p className="text-xs text-gray-500 mt-2 font-semibold">{testimonial.author}</p>
                        <p className="text-xs text-gray-400">{testimonial.business}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jobs completed counter */}
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-[#1e3a5f]">{stats.jobsCompleted.toLocaleString()}+</p>
                  <p className="text-sm text-gray-500">jobs completed through TradeSource</p>
                </div>
              </>
            )}
          </div>
        ) : user.status === 'pending' ? (
          // Pending approval
          (router.push('/pending'), null)
        ) : user.status === 'rejected' ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your application was not approved.</p>
            <p className="text-sm text-gray-500">Contact support for more information.</p>
          </div>
        ) : (
          // Approved user - show main actions with habit-forming features
          <div className={getMainGridClass()}>
            {/* Left column - Activity & Stats */}
            <div className={surface === 'desktop' ? 'col-span-7 space-y-6' : surface === 'tablet' ? 'space-y-6' : 'space-y-6'}>
              {/* Habit Hook - Time-based greeting */}
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-xl p-4 text-white">
                <p className="font-semibold text-lg">{greeting.title}</p>
                <p className="text-blue-100 text-sm">{greeting.subtitle}</p>
              </div>

              {/* Activity Indicators - Key habit driver with urgency badges */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  Live Activity
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Real-time</span>
                </h3>
                <div className={surface === 'desktop' ? 'grid grid-cols-4 gap-3' : 'grid grid-cols-2 gap-3'}>
                  {/* New jobs today - Prominent */}
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-left hover:from-green-100 hover:to-green-150 transition shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-3xl font-bold text-green-600">{activity.newJobsToday}</p>
                      {activity.newJobsToday > 0 && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">HOT</span>
                      )}
                    </div>
                    <p className="text-xs text-green-700 font-medium">new jobs today</p>
                  </button>
                  
                  {/* Jobs posted in last hour - URGENCY */}
                  {activity.newJobsLastHour > 0 && (
                    <button 
                      onClick={() => router.push('/jobs')}
                      className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl text-left hover:from-red-100 hover:to-red-150 transition shadow-sm animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-3xl font-bold text-red-600">{activity.newJobsLastHour}</p>
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">🔥 URGENT</span>
                      </div>
                      <p className="text-xs text-red-700 font-medium">posted in last hour!</p>
                    </button>
                  )}
                  
                  {/* Active contractors - NOW SHOWS REAL NUMBER */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-3xl font-bold text-blue-600">{stats.activeToday}</p>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    </div>
                    <p className="text-xs text-blue-700 font-medium">painters online now</p>
                  </div>
                  
                  {/* Expiring jobs - urgency */}
                  {activity.expiringJobs > 0 && (
                    <button 
                      onClick={() => router.push('/jobs')}
                      className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl text-left hover:from-orange-100 hover:to-orange-150 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-3xl font-bold text-orange-600">{activity.expiringJobs}</p>
                        <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">⏰ expiring</span>
                      </div>
                      <p className="text-xs text-orange-700 font-medium">expiring soon - act fast!</p>
                    </button>
                  )}
                </div>
              </div>

              {/* Platform stats for logged in users - Enhanced */}
              <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-xl p-5 text-white shadow-xl">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    🔥 Network Activity
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-2xl font-bold">{stats.workingNow}</p>
                    <p className="text-xs text-blue-200 font-medium">working now</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-2xl font-bold">{stats.totalPainters}</p>
                    <p className="text-xs text-blue-200 font-medium">painters total</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
                    <p className="text-2xl font-bold">{stats.jobsCompleted.toLocaleString()}+</p>
                    <p className="text-xs text-blue-200 font-medium">jobs completed</p>
                  </div>
                </div>
                {/* Density signal */}
                <div className="mt-3 text-center">
                  <span className="text-xs text-blue-200">Average job value: <span className="font-semibold text-white">${stats.avgJobValue.toLocaleString()}</span></span>
                </div>
              </div>

              {/* Quick Actions on Return */}
              {unreadCount > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                  <h3 className="font-semibold text-gray-900 mb-2">Welcome back! 👋</h3>
                  <p className="text-sm text-gray-600">
                    You have <span className="font-semibold text-blue-600">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</span> to catch up on.
                  </p>
                </div>
              )}

              {/* Main actions */}
              <div className="grid gap-4">
                <button
                  onClick={() => router.push('/post-job')}
                  className="w-full py-6 px-6 bg-[#1e3a5f] text-white font-semibold rounded-xl text-lg hover:bg-[#2d5a87] transition flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  POST A JOB
                </button>

                <button
                  onClick={() => router.push('/jobs')}
                  className="w-full py-6 px-6 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold rounded-xl text-lg hover:bg-gray-50 transition flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  FIND WORK
                </button>
              </div>
            </div>

            {/* Right column - User Info & Quick Links (desktop/tablet only) */}
            {(surface === 'desktop' || surface === 'tablet') && (
              <div className={surface === 'desktop' ? 'col-span-5 space-y-6' : 'space-y-6'}>
                {/* User info */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.businessName}</p>
                    </div>
                    <span className="trust-badge ml-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>

                {/* Quick links - Desktop gets more prominent layout */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push('/profile')}
                      className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm text-gray-600">Profile</span>
                    </button>
                    <button
                      onClick={() => router.push('/my-jobs')}
                      className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
                    >
                      <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm text-gray-600">My Jobs</span>
                    </button>
                  </div>
                </div>

                {/* Desktop control panel style widget */}
                {surface === 'desktop' && (
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Control Panel
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/admin')}
                        className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left text-sm text-gray-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Settings
                      </button>
                      <button
                        onClick={() => router.push('/chat')}
                        className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left text-sm text-gray-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Messages
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile only: quick links below actions */}
            {surface === 'mobile' && (
              <div className="space-y-6">
                {/* User info */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.businessName}</p>
                    </div>
                    <span className="trust-badge ml-auto">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => router.push('/profile')}
                    className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-gray-600">Profile</span>
                  </button>
                  <button
                    onClick={() => router.push('/my-jobs')}
                    className="py-3 px-4 bg-white border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition"
                  >
                    <svg className="w-5 h-5 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm text-gray-600">My Jobs</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
