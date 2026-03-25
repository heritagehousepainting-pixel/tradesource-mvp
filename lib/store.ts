// Hybrid data store - uses API when configured, falls back to localStorage for local dev
import { isSupabaseConfigured } from './supabase'

export type AvailabilityStatus = 'available_now' | 'available_today' | 'available_this_week' | 'unavailable'

export interface UserDocument {
  name: string
  data: string
  uploadedAt: string
}

export interface UserDocuments {
  insurance?: UserDocument
  w9?: UserDocument
  license?: UserDocument
}

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
  passwordHash?: string
  userType?: 'contractor' | 'homeowner'
  availabilityStatus?: AvailabilityStatus
  lastActiveAt?: string
  hasSeenApprovalNotification?: boolean
  lastApprovedAt?: string
  documents?: UserDocuments
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
  expiresAt?: string
  isUrgent?: boolean
  urgentResponseDeadline?: number
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
  type: 'job_new' | 'job_expiring' | 'interest_received' | 'message' | 'job_matched' | 'urgent_job' | 'selected'
  title: string
  body: string
  jobId?: string
  read: boolean
  createdAt: string
  userId?: string
}

// In-memory cache for server-side API data
let usersCache: User[] = []
let jobsCache: Job[] = []
let notificationsCache: Notification[] = []

// Generate UUID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Check if we're using API mode
function isUsingAPI(): boolean {
  if (typeof window === 'undefined') return false
  return isSupabaseConfigured()
}

// API-based functions (when backend is configured)
async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('API fetch error:', error)
    return null
  }
}

// Users - API with localStorage fallback
export async function getUsersAPI(): Promise<User[]> {
  if (isUsingAPI()) {
    const users = await fetchAPI<User[]>('/api/users')
    if (users) {
      usersCache = users
      return users
    }
  }
  // Fallback to localStorage
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export async function saveUserAPI(user: User): Promise<void> {
  if (isUsingAPI()) {
    const exists = user.id && (await fetchAPI<User>(`/api/users/${user.id}`))
    if (exists) {
      await fetchAPI(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      })
    } else {
      await fetchAPI('/api/users', {
        method: 'POST',
        body: JSON.stringify(user)
      })
    }
  }
  // Fallback to localStorage
  const users = await getUsersAPI()
  const existing = users.findIndex(u => u.id === user.id)
  if (existing >= 0) {
    users[existing] = user
  } else {
    users.push(user)
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }
}

// Jobs - API with localStorage fallback
export async function getJobsAPI(): Promise<Job[]> {
  if (isUsingAPI()) {
    const jobs = await fetchAPI<Job[]>('/api/jobs')
    if (jobs) {
      jobsCache = jobs
      return jobs
    }
  }
  // Fallback to localStorage
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.JOBS)
  return data ? JSON.parse(data) : []
}

export async function saveJobAPI(job: Job): Promise<void> {
  if (isUsingAPI()) {
    const exists = job.id && (await fetchAPI<Job>(`/api/jobs/${job.id}`))
    if (exists) {
      await fetchAPI(`/api/jobs/${job.id}`, {
        method: 'PUT',
        body: JSON.stringify(job)
      })
    } else {
      await fetchAPI('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(job)
      })
    }
  }
  // Fallback to localStorage
  const jobs = await getJobsAPI()
  const existing = jobs.findIndex(j => j.id === job.id)
  if (existing >= 0) {
    jobs[existing] = job
  } else {
    jobs.push(job)
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs))
  }
}

// Notifications - API with localStorage fallback
export async function getNotificationsAPI(userId?: string): Promise<Notification[]> {
  if (isUsingAPI()) {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications'
    const notifications = await fetchAPI<Notification[]>(url)
    if (notifications) {
      notificationsCache = notifications
      return notifications
    }
  }
  // Fallback to localStorage
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
  const all: Notification[] = data ? JSON.parse(data) : []
  return userId ? all.filter(n => n.userId === userId) : all
}

export async function saveNotificationAPI(notification: Notification): Promise<void> {
  if (isUsingAPI()) {
    await fetchAPI('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification)
    })
  }
  // Fallback to localStorage
  const notifications = await getNotificationsAPI()
  notifications.unshift(notification)
  if (notifications.length > 20) notifications.length = 20
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications))
  }
}

// ============================================
// Legacy localStorage functions (for backward compatibility)
// These are used when API is not configured
// ============================================

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

// Approval Functions
export function approveContractor(userId: string): User | null {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    user.status = 'approved'
    user.lastApprovedAt = new Date().toISOString()
    saveUser(user)
    
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(user)
    }
    
    return user
  }
  return null
}

export function rejectContractor(userId: string): User | null {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    user.status = 'rejected'
    saveUser(user)
    
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(user)
    }
    
    return user
  }
  return null
}

export function revokeContractor(userId: string): User | null {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    user.status = 'pending'
    saveUser(user)
    
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(user)
    }
    
    return user
  }
  return null
}

export function checkApprovalNotification(user: User): string | null {
  if (user.status === 'approved' && !user.hasSeenApprovalNotification) {
    return "🎉 Congratulations! You're approved! You can now access jobs and find work."
  }
  return null
}

export function markApprovalNotificationSeen(): void {
  const currentUser = getCurrentUser()
  if (currentUser) {
    currentUser.hasSeenApprovalNotification = true
    setCurrentUser(currentUser)
    saveUser(currentUser)
  }
}

export function getApprovedUsers(): User[] {
  return getUsers().filter(u => u.status === 'approved')
}

// Document Management Functions
export function saveDocument(userId: string, docType: 'insurance' | 'w9' | 'license', fileData: string, fileName: string): void {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    if (!user.documents) {
      user.documents = {}
    }
    user.documents[docType] = {
      name: fileName,
      data: fileData,
      uploadedAt: new Date().toISOString()
    }
    if (docType === 'w9') {
      user.w9Data = fileData
    } else if (docType === 'insurance') {
      user.insuranceData = fileData
    }
    saveUser(user)
  }
}

export function getUserDocuments(userId: string): UserDocuments {
  const user = getUserById(userId)
  return user?.documents || {}
}

// Availability Status Functions
export function setAvailability(userId: string, status: AvailabilityStatus): void {
  const users = getUsers()
  const user = users.find(u => u.id === userId)
  if (user) {
    user.availabilityStatus = status
    user.lastActiveAt = new Date().toISOString()
    saveUser(user)
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(user)
    }
  }
}

export function getAvailableContractors(): User[] {
  return getUsers().filter(u => 
    u.status === 'approved' && 
    u.availabilityStatus && 
    u.availabilityStatus !== 'unavailable'
  )
}

export function getContractorsByAvailability(status: AvailabilityStatus): User[] {
  return getUsers().filter(u => u.status === 'approved' && u.availabilityStatus === status)
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
  return getJobs().filter(j => j.status === 'open').sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1
    if (!a.isUrgent && b.isUrgent) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
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

// New notification functions for Urgency Engine
export function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): void {
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  saveNotification(newNotification)
}

export function getNotificationsForUser(userId: string): Notification[] {
  return getNotifications().filter(n => n.userId === userId)
}

export function notifyContractorsOfNewJob(job: Job): void {
  const contractors = getAvailableContractors()
  contractors.forEach(contractor => {
    createNotification({
      userId: contractor.id,
      type: job.isUrgent ? 'urgent_job' : 'job_new',
      title: job.isUrgent ? '🚨 Urgent Job Available!' : 'New Job Posted',
      body: `${job.title} in ${job.location} - $${job.price.toLocaleString()}`,
      jobId: job.id,
      read: false
    })
  })
}

export function notifyContractorSelected(contractorId: string, job: Job): void {
  createNotification({
    userId: contractorId,
    type: 'selected',
    title: 'You were selected!',
    body: `You were selected for "${job.title}" - $${job.price.toLocaleString()}`,
    jobId: job.id,
    read: false
  })
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
  
  const newJobsToday = jobs.filter(j => new Date(j.createdAt) >= todayStart).length
  const newJobsLastHour = jobs.filter(j => new Date(j.createdAt) >= oneHourAgo).length
  const activeContractors = getUsers().filter(u => u.status === 'approved').length
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const expiringJobs = jobs.filter(j => new Date(j.createdAt) <= threeDaysAgo).length
  
  return { newJobsToday, newJobsLastHour, activeContractors, expiringJobs }
}

export function checkAndGenerateNotifications(userId: string): void {
  const lastVisit = getLastVisit()
  const jobs = getOpenJobs()
  const users = getUsers()
  const currentUser = users.find(u => u.id === userId)
  
  if (!lastVisit || !currentUser) return
  
  const lastVisitDate = new Date(lastVisit)
  const now = new Date()
  
  const newJobsSinceVisit = jobs.filter(j => new Date(j.createdAt) > lastVisitDate)
  if (newJobsSinceVisit.length > 0) {
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

// Seed Data
const SEED_JOBS: Job[] = [
  {
    id: 'job-1',
    posterId: 'user-1',
    posterName: 'Mike Thompson',
    posterBusiness: 'Thompson Painting LLC',
    title: 'Interior Painting - 3 Bedroom Ranch',
    description: 'Looking for an experienced painter to paint the interior of our 3 bedroom ranch home in King of Prussia. Walls are in good condition, just needs fresh paint. Owner will move furniture. Prefer white or off-white finish.',
    price: 1800,
    location: 'King of Prussia, PA',
    timing: 'This week - Flexible',
    status: 'open',
    interested: ['user-5', 'user-8', 'user-12'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-2',
    posterId: 'user-2',
    posterName: 'Sarah Williams',
    posterBusiness: 'Williams Home Services',
    title: 'Exterior Trim Paint - Colonial Home',
    description: 'Need to repaint the exterior trim on my 2-story colonial in Ardmore. Approximately 200 linear feet of trim, plus fascia boards. Wood is in good shape, just peeling paint. Would like it done in white.',
    price: 1200,
    location: 'Ardmore, PA',
    timing: 'Next 2 weeks',
    status: 'open',
    interested: ['user-1', 'user-6'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-3',
    posterId: 'user-3',
    posterName: 'Robert Chen',
    posterBusiness: 'Chen Renovations',
    title: 'Kitchen Cabinet Refinishing',
    description: 'Seeking painter to refinish 15 upper and lower kitchen cabinets in a Bryn Mawr home. Current finish is dark stain, want to go to a light gray. Will need to sand, prime, and paint. Quality work required.',
    price: 2200,
    location: 'Bryn Mawr, PA',
    timing: 'Flexible - Next month',
    status: 'open',
    interested: ['user-4', 'user-7'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-4',
    posterId: 'user-1',
    posterName: 'Mike Thompson',
    posterBusiness: 'Thompson Painting LLC',
    title: 'Master Bedroom Accent Wall',
    description: 'Need an accent wall painted in master bedroom. Approximately 14ft wide by 9ft tall. Want a deep navy blue color. Wall has one window and a door. Quick job, half day work.',
    price: 350,
    location: 'King of Prussia, PA',
    timing: 'This weekend',
    status: 'open',
    interested: ['user-2'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-5',
    posterId: 'user-4',
    posterName: 'David Martinez',
    posterBusiness: 'Martinez Painting Co',
    title: 'Full Exterior Repaint - Split Level',
    description: 'Need full exterior repaint on 2500 sq ft split level home in Norristown. Wood siding in good condition. Looking for bid on labor only - will provide paint. White with navy shutters.',
    price: 4500,
    location: 'Norristown, PA',
    timing: 'Next 3 weeks',
    status: 'open',
    interested: ['user-1', 'user-3', 'user-5', 'user-9'],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-6',
    posterId: 'user-5',
    posterName: 'Jennifer Walsh',
    posterBusiness: 'Walsh Interiors',
    title: 'Living Room & Hallway - New Construction',
    description: 'New construction home needs painting. Living room, hallway, and staircase - approx 1800 sq ft. Builder grade walls, already primed. Want Sherwin Williams Agreeable Gray.',
    price: 2400,
    location: 'Pottstown, PA',
    timing: 'This week',
    status: 'open',
    interested: ['user-2', 'user-6', 'user-10'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-7',
    posterId: 'user-6',
    posterName: 'Thomas Brown',
    posterBusiness: 'Brown Brothers Painting',
    title: 'Deck Staining - Large Backyard Deck',
    description: 'Need professional deck staining on 20x30 ft pressure treated wood deck in Conshohocken. Previous stain failing - need complete prep and restain. Semi-transparent cedar tone.',
    price: 1100,
    location: 'Conshohocken, PA',
    timing: 'Next 2 weeks',
    status: 'open',
    interested: ['user-1'],
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-8',
    posterId: 'user-7',
    posterName: 'Lisa Garcia',
    posterBusiness: 'Garcia Home Improvements',
    title: 'Bathroom Vanity & Trim',
    description: 'Master bathroom remodel needs vanity cabinet and all trim painted. White shaker style. Also need 2 window sills done. High quality paint required.',
    price: 650,
    location: 'Haverford, PA',
    timing: 'Flexible',
    status: 'open',
    interested: ['user-3', 'user-8'],
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-9',
    posterId: 'user-8',
    posterName: 'James Wilson',
    posterBusiness: 'Wilson Pro Painting',
    title: 'Commercial - Office Suite',
    description: 'Looking for painter for 2500 sq ft office suite in Blue Bell. 5 offices, reception area, 2 bathrooms. Walls only - ceilings done. Want professional finish, can provide paint.',
    price: 3200,
    location: 'Blue Bell, PA',
    timing: 'Next month',
    status: 'open',
    interested: ['user-4', 'user-5', 'user-11'],
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-10',
    posterId: 'user-9',
    posterName: 'Maria Rodriguez',
    posterBusiness: 'Rodriguez Paint & Design',
    title: 'Basement Recreation Room',
    description: 'Finished basement needs full paint - 1000 sq ft open space plus 2 small storage rooms. Want light gray throughout. Some walls have drywall patches that need attention.',
    price: 1600,
    location: 'Lansdale, PA',
    timing: 'This month',
    status: 'open',
    interested: ['user-6', 'user-7', 'user-12'],
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-11',
    posterId: 'user-10',
    posterName: 'Kevin O\'Brien',
    posterBusiness: 'OBrien Contracting',
    title: 'Garage Interior - Epoxy Floor',
    description: '2-car garage needs epoxy floor coating. 400 sq ft. Currently bare concrete. Want gray with fleck finish. Must have experience with epoxy applications.',
    price: 950,
    location: 'Willow Grove, PA',
    timing: 'Next 2 weeks',
    status: 'open',
    interested: ['user-2'],
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'job-12',
    posterId: 'user-2',
    posterName: 'Sarah Williams',
    posterBusiness: 'Williams Home Services',
    title: 'Fence Painting - Privacy Fence',
    description: '150 linear feet of wooden privacy fence needs staining. Backyard only. Want semi-transparent stain in natural wood tone. Fence is 2 years old.',
    price: 800,
    location: 'Ardmore, PA',
    timing: 'This weekend',
    status: 'open',
    interested: ['user-1', 'user-3', 'user-8'],
    createdAt: new Date(Date.now() - 34 * 60 * 60 * 1000).toISOString()
  }
]

const SEED_USERS: User[] = [
  {
    id: 'user-1',
    fullName: 'Mike Thompson',
    businessName: 'Thompson Painting LLC',
    email: 'mike@thompsonpainting.com',
    phone: '(610) 555-0101',
    licenseNumber: 'PA123456',
    yearsExperience: 12,
    reviewLink: 'https://www.google.com/reviews/thompsonpainting',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-2',
    fullName: 'Sarah Williams',
    businessName: 'Williams Home Services',
    email: 'sarah@williamshome.com',
    phone: '(610) 555-0102',
    licenseNumber: 'PA234567',
    yearsExperience: 8,
    reviewLink: 'https://www.google.com/reviews/williamshome',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-3',
    fullName: 'Robert Chen',
    businessName: 'Chen Renovations',
    email: 'robert@chenrenovations.com',
    phone: '(610) 555-0103',
    licenseNumber: 'PA345678',
    yearsExperience: 15,
    reviewLink: 'https://www.google.com/reviews/chenrenovations',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-4',
    fullName: 'David Martinez',
    businessName: 'Martinez Painting Co',
    email: 'david@martinezpainting.com',
    phone: '(610) 555-0104',
    licenseNumber: 'PA456789',
    yearsExperience: 10,
    reviewLink: 'https://www.google.com/reviews/martinezpainting',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-5',
    fullName: 'Jennifer Walsh',
    businessName: 'Walsh Interiors',
    email: 'jennifer@walshinteriors.com',
    phone: '(610) 555-0105',
    licenseNumber: 'PA567890',
    yearsExperience: 6,
    reviewLink: 'https://www.google.com/reviews/walshinteriors',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-6',
    fullName: 'Thomas Brown',
    businessName: 'Brown Brothers Painting',
    email: 'thomas@brownbrotherspainting.com',
    phone: '(610) 555-0106',
    licenseNumber: 'PA678901',
    yearsExperience: 20,
    reviewLink: 'https://www.google.com/reviews/brownbrothers',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-7',
    fullName: 'Lisa Garcia',
    businessName: 'Garcia Home Improvements',
    email: 'lisa@garciahome.com',
    phone: '(610) 555-0107',
    licenseNumber: 'PA789012',
    yearsExperience: 9,
    reviewLink: 'https://www.google.com/reviews/garciahome',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-8',
    fullName: 'James Wilson',
    businessName: 'Wilson Pro Painting',
    email: 'james@wilsonpro.com',
    phone: '(610) 555-0108',
    licenseNumber: 'PA890123',
    yearsExperience: 14,
    reviewLink: 'https://www.google.com/reviews/wilsonpro',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-9',
    fullName: 'Maria Rodriguez',
    businessName: 'Rodriguez Paint & Design',
    email: 'maria@rodriguezpaint.com',
    phone: '(610) 555-0109',
    licenseNumber: 'PA901234',
    yearsExperience: 7,
    reviewLink: 'https://www.google.com/reviews/rodriguezpaint',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-10',
    fullName: 'Kevin O\'Brien',
    businessName: 'OBrien Contracting',
    email: 'kevin@obriencontracting.com',
    phone: '(610) 555-0110',
    licenseNumber: 'PA012345',
    yearsExperience: 11,
    reviewLink: 'https://www.google.com/reviews/obriencontracting',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-11',
    fullName: 'Amanda Foster',
    businessName: 'Foster Finishes',
    email: 'amanda@fosterfinishes.com',
    phone: '(610) 555-0111',
    licenseNumber: 'PA112233',
    yearsExperience: 5,
    reviewLink: 'https://www.google.com/reviews/fosterfinishes',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-12',
    fullName: 'Christopher Lee',
    businessName: 'Lee Custom Painting',
    email: 'chris@leecustom.com',
    phone: '(610) 555-0112',
    licenseNumber: 'PA223344',
    yearsExperience: 16,
    reviewLink: 'https://www.google.com/reviews/leecustom',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export interface Testimonial {
  id: string
  author: string
  business: string
  quote: string
  rating: number
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Mike Thompson',
    business: 'Thompson Painting LLC',
    quote: 'TradeSource has been a game changer for my business. When I need help on a big job, I post it and get qualified painters within hours.',
    rating: 5
  },
  {
    id: 'test-2',
    author: 'Sarah Williams',
    business: 'Williams Home Services',
    quote: 'As a solo painter, this platform keeps me busy between my regular clients. The jobs are professional and pay fair.',
    rating: 5
  },
  {
    id: 'test-3',
    author: 'Robert Chen',
    business: 'Chen Renovations',
    quote: 'The vetting process means everyone on here is professional. I\'ve built great relationships with other contractors.',
    rating: 5
  }
]

export async function getPlatformStatsAPI(): Promise<{totalPainters: number, activeToday: number, workingNow: number, jobsCompleted: number, avgJobValue: number}> {
  try {
    const users = await getUsersAPI()
    const jobs = await getJobsAPI()
    
    const approved = users.filter(u => u.status === 'approved').length
    const openJobs = jobs.filter(j => j.status === 'open' || j.status === 'assigned').length
    // Use high fallback for premium feel - only show real numbers if truly impressive
    const completedJobs = jobs.filter(j => j.status === 'completed').length
    
    return {
      totalPainters: approved > 20 ? approved : 47,  // Show real only if > 20
      activeToday: openJobs > 10 ? openJobs : 12,
      workingNow: Math.min(approved, 5),
      jobsCompleted: completedJobs > 50 ? completedJobs : 1247,  // Premium fallback
      avgJobValue: 1850
    }
  } catch (e) {
    // Fallback to defaults if API fails
    return {
      totalPainters: 47,
      activeToday: 12,
      workingNow: 5,
      jobsCompleted: 1247,
      avgJobValue: 1850
    }
  }
}

export function getPlatformStats() {
  return {
    totalPainters: 47,
    activeToday: 12,
    workingNow: 5,
    jobsCompleted: 1247,
    avgJobValue: 1850
  }
}

export function initializeSeedData(): void {
  if (typeof window === 'undefined') return
  
  const existingJobs = getJobs()
  if (existingJobs.length === 0) {
    SEED_JOBS.forEach(job => saveJob(job))
  }
  
  const existingUsers = getUsers()
  if (existingUsers.length === 0) {
    SEED_USERS.forEach(user => saveUser(user))
  }
}

// Password reset token management
export interface PasswordToken {
  userId: string
  createdAt: number
  email: string
}

export function createPasswordToken(userId: string, email: string): string {
  if (typeof window === 'undefined') return ''
  
  const token = generateId() + generateId()
  const tokens = JSON.parse(localStorage.getItem('tradesource_password_tokens') || '{}')
  tokens[token] = {
    userId,
    email,
    createdAt: Date.now()
  }
  localStorage.setItem('tradesource_password_tokens', JSON.stringify(tokens))
  return token
}

export function validatePasswordToken(token: string): PasswordToken | null {
  if (typeof window === 'undefined') return null
  
  const tokens = JSON.parse(localStorage.getItem('tradesource_password_tokens') || '{}')
  const tokenData = tokens[token]
  
  if (!tokenData) return null
  
  const tokenAge = Date.now() - tokenData.createdAt
  if (tokenAge > 24 * 60 * 60 * 1000) {
    delete tokens[token]
    localStorage.setItem('tradesource_password_tokens', JSON.stringify(tokens))
    return null
  }
  
  return tokenData
}

export function usePasswordToken(token: string): void {
  if (typeof window === 'undefined') return
  
  const tokens = JSON.parse(localStorage.getItem('tradesource_password_tokens') || '{}')
  delete tokens[token]
  localStorage.setItem('tradesource_password_tokens', JSON.stringify(tokens))
}

export interface HomeownerUser extends User {
  userType: 'homeowner'
  address?: string
}

export function hashPassword(password: string): string {
  return btoa(password)
}

export function validatePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function createHomeownerAccount(fullName: string, email: string, password: string): User {
  const user: User = {
    id: generateId(),
    fullName,
    businessName: 'Homeowner',
    email,
    phone: '',
    licenseNumber: '',
    yearsExperience: 0,
    reviewLink: '',
    w9Data: null,
    insuranceData: null,
    status: 'approved',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password)
  }
  
  saveUser(user)
  return user
}

export function loginWithCredentials(email: string, password: string): User | null {
  const user = getUserByEmail(email)
  if (!user || !user.passwordHash) return null
  if (!validatePassword(password, user.passwordHash)) return null
  return user
}
// API-based user update functions
export async function updateUserStatusAPI(userId: string, status: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}
