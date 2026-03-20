// localStorage-based data store for MVP

export interface User {
  id: string
  fullName: string
  businessName: string
  email: string
  phone: string
  licenseNumber: string
  yearsExperience: number
  reviewLink: string
  w9Data: string | null
  insuranceData: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Job {
  id: string
  posterId: string
  posterName: string
  posterBusiness: string
  title: string
  description: string
  price: number
  location: string
  timing: string
  status: 'open' | 'assigned' | 'completed'
  interested: string[]
  createdAt: string
  expiresAt?: string // Optional expiration date for urgency
}

export interface Message {
  id: string
  jobId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

const STORAGE_KEYS = {
  USERS: 'tradesource_users',
  JOBS: 'tradesource_jobs',
  MESSAGES: 'tradesource_messages',
  CURRENT_USER: 'tradesource_current_user',
  NOTIFICATIONS: 'tradesource_notifications',
  LAST_VISIT: 'tradesource_last_visit'
}

export interface Notification {
  id: string
  type: 'job_new' | 'job_expiring' | 'interest_received' | 'message' | 'job_matched'
  title: string
  body: string
  jobId?: string
  read: boolean
  createdAt: string
}

// Generate UUID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Users
export function getUsers(): User[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function saveUser(user: User): void {
  const users = getUsers()
  const existing = users.findIndex(u => u.id === user.id)
  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function getPendingUsers(): User[] {
  return getUsers().filter(u => u.status === 'pending')
}

// Jobs
export function getJobs(): Job[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.JOBS)
  return data ? JSON.parse(data) : []
}

export function saveJob(job: Job): void {
  const jobs = getJobs()
  const existing = jobs.findIndex(j => j.id === job.id)
  if (existing >= 0) {
    jobs[existing] = job
  } else {
    jobs.push(job)
  }
  localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs))
}

export function getJobById(id: string): Job | undefined {
  return getJobs().find(j => j.id === id)
}

export function getOpenJobs(): Job[] {
  return getJobs().filter(j => j.status === 'open').sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// Messages
export function getMessages(jobId: string): Message[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES)
  const allMessages: Message[] = data ? JSON.parse(data) : []
  return allMessages.filter(m => m.jobId === jobId).sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

export function saveMessage(message: Message): void {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES)
  const messages: Message[] = data ? JSON.parse(data) : []
  messages.push(message)
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
}

// Current User Session
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
}

// Notifications
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  return data ? JSON.parse(data) : []
}

export function saveNotification(notification: Notification): void {
  const notifications = getNotifications()
  notifications.unshift(notification)
  // Keep only last 20 notifications
  if (notifications.length > 20) {
    notifications.length = 20
  }
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function markNotificationRead(id: string): void {
  const notifications = getNotifications()
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  }
}

export function markAllNotificationsRead(): void {
  const notifications = getNotifications()
  notifications.forEach(n => n.read = true)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
}

export function getUnreadNotificationCount(): number {
  return getNotifications().filter(n => !n.read).length
}

// Activity Tracking for Habit Formation
export function getLastVisit(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.LAST_VISIT)
}

export function updateLastVisit(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.LAST_VISIT, new Date().toISOString())
}

export function getActivitySummary(): { newJobsToday: number; newJobsLastHour: number; activeContractors: number; expiringJobs: number } {
  const jobs = getOpenJobs()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  
  // Count jobs posted today
  const newJobsToday = jobs.filter(j => new Date(j.createdAt) >= todayStart).length
  
  // Count jobs posted in last hour (urgent!)
  const newJobsLastHour = jobs.filter(j => new Date(j.createdAt) >= oneHourAgo).length
  
  // Count approved contractors (active)
  const activeContractors = getUsers().filter(u => u.status === 'approved').length
  
  // Count jobs expiring soon (simulated: jobs older than 3 days considered "expiring soon")
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const expiringJobs = jobs.filter(j => new Date(j.createdAt) <= threeDaysAgo).length
  
  return { newJobsToday, newJobsLastHour, activeContractors, expiringJobs }
}

// Check and generate notifications based on activity (simulated for MVP)
export function checkAndGenerateNotifications(userId: string): void {
  const lastVisit = getLastVisit()
  const jobs = getOpenJobs()
  const users = getUsers()
  const currentUser = users.find(u => u.id === userId)
  
  if (!lastVisit || !currentUser) return
  
  const lastVisitDate = new Date(lastVisit)
  const now = new Date()
  
  // Check for new jobs since last visit
  const newJobsSinceVisit = jobs.filter(j => new Date(j.createdAt) > lastVisitDate)
  if (newJobsSinceVisit.length > 0) {
    // Check if there's a job matching user's skills (simplified: any new job)
    const skillMatchJob = newJobsSinceVisit[0]
    saveNotification({
      id: generateId(),
      type: 'job_matched',
      title: 'New jobs match your skills!',
      body: `${newJobsSinceVisit.length} new job${newJobsSinceVisit.length > 1 ? 's' : ''} posted since your last visit`,
      jobId: skillMatchJob.id,
      read: false,
      createdAt: now.toISOString()
    })
  }
  
  // Check for jobs expiring soon
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const expiringJobs = jobs.filter(j => new Date(j.createdAt) <= threeDaysAgo)
  if (expiringJobs.length > 0) {
    saveNotification({
      id: generateId(),
      type: 'job_expiring',
      title: 'Jobs expiring soon!',
      body: `${expiringJobs.length} job${expiringJobs.length > 1 ? 's have' : ' has'} been open for 3+ days - apply now!`,
      jobId: expiringJobs[0].id,
      read: false,
      createdAt: now.toISOString()
    })
  }
}

// Demo seed data for MVP
const SEED_JOBS: Job[] = [
  {
    id: 'demo-job-1',
    posterId: 'demo-user-1',
    posterName: 'Mike Thompson',
    posterBusiness: 'Thompson Painting LLC',
    title: 'Interior Painting - 3 Bedroom Ranch',
    description: 'Looking for an experienced painter to paint the interior of our 3 bedroom ranch home in King of Prussia. Walls are in good condition, just needs fresh paint. Owner will move furniture. Prefer white or off-white finish.',
    price: 1800,
    location: 'King of Prussia, PA',
    timing: 'This week - Flexible',
    status: 'open',
    interested: ['demo-user-2', 'demo-user-3'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'demo-job-2',
    posterId: 'demo-user-2',
    posterName: 'Sarah Williams',
    posterBusiness: 'Williams Home Services',
    title: 'Exterior Trim Paint - Colonial Home',
    description: 'Need to repaint the exterior trim on my 2-story colonial in Ardmore. Approximately 200 linear feet of trim, plus fascia boards. Wood is in good shape, just peeling paint. Would like it done in white.',
    price: 1200,
    location: 'Ardmore, PA',
    timing: 'Next 2 weeks',
    status: 'open',
    interested: ['demo-user-1'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'demo-job-3',
    posterId: 'demo-user-3',
    posterName: 'Robert Chen',
    posterBusiness: 'Chen Renovations',
    title: 'Kitchen Cabinet Refinishing',
    description: 'Seeking painter to refinish 15 upper and lower kitchen cabinets in a Bryn Mawr home. Current finish is dark stain, want to go to a light gray. Will need to sand, prime, and paint. Quality work required.',
    price: 2200,
    location: 'Bryn Mawr, PA',
    timing: 'Flexible - Next month',
    status: 'open',
    interested: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'demo-job-4',
    posterId: 'demo-user-1',
    posterName: 'Mike Thompson',
    posterBusiness: 'Thompson Painting LLC',
    title: 'Master Bedroom Accent Wall',
    description: 'Need an accent wall painted in master bedroom. Approximately 14ft wide by 9ft tall. Want a deep navy blue color. Wall has one window and a door. Quick job, half day work.',
    price: 350,
    location: 'King of Prussia, PA',
    timing: 'This weekend',
    status: 'open',
    interested: ['demo-user-2'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  }
]

const SEED_USERS: User[] = [
  {
    id: 'demo-user-1',
    fullName: 'Mike Thompson',
    businessName: 'Thompson Painting LLC',
    email: 'mike@thompsonpainting.com',
    phone: '(610) 555-0101',
    licenseNumber: 'PA123456',
    yearsExperience: 12,
    reviewLink: 'https://www.google.com/reviews/example1',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-user-2',
    fullName: 'Sarah Williams',
    businessName: 'Williams Home Services',
    email: 'sarah@williamshome.com',
    phone: '(610) 555-0102',
    licenseNumber: 'PA234567',
    yearsExperience: 8,
    reviewLink: 'https://www.google.com/reviews/example2',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-user-3',
    fullName: 'Robert Chen',
    businessName: 'Chen Renovations',
    email: 'robert@chenrenovations.com',
    phone: '(610) 555-0103',
    licenseNumber: 'PA345678',
    yearsExperience: 15,
    reviewLink: 'https://www.google.com/reviews/example3',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Initialize seed data if none exists
export function initializeSeedData(): void {
  if (typeof window === 'undefined') return
  
  const existingJobs = getJobs()
  if (existingJobs.length === 0) {
    // Seed demo jobs
    SEED_JOBS.forEach(job => saveJob(job))
  }
  
  const existingUsers = getUsers()
  if (existingUsers.length === 0) {
    // Seed demo users
    SEED_USERS.forEach(user => saveUser(user))
  }
}
