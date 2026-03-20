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
  CURRENT_USER: 'tradesource_current_user'
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
