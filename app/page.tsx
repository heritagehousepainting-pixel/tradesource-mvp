'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, logout, User, getNotifications, markAllNotificationsRead, getUnreadNotificationCount, updateLastVisit, getActivitySummary, checkAndGenerateNotifications, Notification, getPlatformStats, TESTIMONIALS } from '@/lib/store'

export default function Home() {
  const router = useRouter()
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
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
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
      </header>

      {/* Notification Dropdown */}
      {showNotifications && user && (
        <div className="bg-white border-b border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
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
          <div className="max-w-md mx-auto px-4 pb-4 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No notifications yet</p>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <div 
                  key={notif.id}
                  className={`py-3 border-b border-gray-100 last:border-0 ${!notif.read ? 'bg-blue-50 -mx-4 px-4' : ''}`}
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
      )}

      <main className="max-w-md mx-auto px-4 py-8">
        {!user ? (
          // Not logged in - show clear value proposition with social proof
          <div className="space-y-6">
            {/* Platform stats banner */}
            <div className="bg-[#1e3a5f] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="live-indicator"></span>
                  <span className="text-sm font-medium">Live Network</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span>4.9/5 avg rating</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{stats.activeToday}</p>
                  <p className="text-xs text-blue-200">painters online</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.workingNow}</p>
                  <p className="text-xs text-blue-200">working now</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPainters}</p>
                  <p className="text-xs text-blue-200">total network</p>
                </div>
              </div>
            </div>

            {/* Hero section */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Need painters? Get help in minutes.
              </h2>
              <p className="text-gray-600 mb-4">
                When your crew doesn't show or you've got more work than you can handle — tap into a network of trusted, vetted painters in Montgomery County.
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">🚀 Need help fast?</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">📋 Too much work?</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">💼 Looking for work?</span>
              </div>
            </div>

            {/* Paint swatches decoration */}
            <div className="flex justify-center gap-2 py-2">
              <div className="paint-swatch" style={{background: '#2563eb'}}></div>
              <div className="paint-swatch" style={{background: '#059669'}}></div>
              <div className="paint-swatch" style={{background: '#ea580c'}}></div>
              <div className="paint-swatch" style={{background: '#7c3aed'}}></div>
              <div className="paint-swatch" style={{background: '#dc2626'}}></div>
            </div>

            {/* Primary action: Contractors who need painters */}
            <button
              onClick={() => router.push('/apply')}
              className="w-full py-5 px-6 bg-[#1e3a5f] text-white font-semibold rounded-xl text-lg hover:bg-[#2d5a87] transition shadow-lg"
            >
              I Need Painters — Get Help Now
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or</span>
              </div>
            </div>

            {/* Secondary action: Painters looking for work */}
            <button
              onClick={() => router.push('/apply')}
              className="w-full py-5 px-6 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold rounded-xl text-lg hover:bg-gray-50 transition"
            >
              I'm a Painter — Find Work
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">already a member?</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
            >
              Sign In
            </button>

            {/* Trust indicators with paint theme */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Vetted</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-2 text-orange-700">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span>Local</span>
                </div>
              </div>
            </div>

            {/* Testimonials section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">What painters say</h3>
              <div className="space-y-4">
                {TESTIMONIALS.map((testimonial) => (
                  <div key={testimonial.id} className="testimonial-card p-4 rounded-lg">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 italic">"{testimonial.quote}"</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{testimonial.author}</p>
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
          <div className="space-y-6">
            {/* Habit Hook - Time-based greeting */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] rounded-xl p-4 text-white">
              <p className="font-semibold text-lg">{greeting.title}</p>
              <p className="text-blue-100 text-sm">{greeting.subtitle}</p>
            </div>

            {/* Activity Indicators - Key habit driver */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live Activity
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* New jobs today */}
                <button 
                  onClick={() => router.push('/jobs')}
                  className="p-3 bg-green-50 rounded-lg text-left hover:bg-green-100 transition"
                >
                  <p className="text-2xl font-bold text-green-600">{activity.newJobsToday}</p>
                  <p className="text-xs text-green-700">new jobs today</p>
                </button>
                
                {/* Jobs posted in last hour - urgency */}
                {activity.newJobsLastHour > 0 && (
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="p-3 bg-red-50 rounded-lg text-left hover:bg-red-100 transition animate-pulse"
                  >
                    <p className="text-2xl font-bold text-red-600">{activity.newJobsLastHour}</p>
                    <p className="text-xs text-red-700">posted in last hour!</p>
                  </button>
                )}
                
                {/* Active contractors - NOW SHOWS REAL NUMBER */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{stats.activeToday}</p>
                  <p className="text-xs text-blue-700">painters online</p>
                </div>
                
                {/* Expiring jobs - urgency */}
                {activity.expiringJobs > 0 && (
                  <button 
                    onClick={() => router.push('/jobs')}
                    className="p-3 bg-orange-50 rounded-lg text-left hover:bg-orange-100 transition"
                  >
                    <p className="text-2xl font-bold text-orange-600">{activity.expiringJobs}</p>
                    <p className="text-xs text-orange-700">expiring soon</p>
                  </button>
                )}
              </div>
            </div>

            {/* Platform stats for logged in users too */}
            <div className="bg-[#1e3a5f] rounded-xl p-4 text-white">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center gap-1">
                  <span className="live-indicator"></span>
                  Network Activity
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold">{stats.workingNow}</p>
                  <p className="text-xs text-blue-200">working now</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalPainters}</p>
                  <p className="text-xs text-blue-200">painters</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.jobsCompleted}+</p>
                  <p className="text-xs text-blue-200">jobs done</p>
                </div>
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
      </main>
    </div>
  )
}
