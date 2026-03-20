'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, getJobById, getMessages, saveMessage, Job, User, Message } from '@/lib/store'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    const jobId = params.id as string
    const foundJob = getJobById(jobId)
    
    if (!foundJob) {
      router.push('/jobs')
      return
    }

    setJob(foundJob)
    setMessages(getMessages(jobId))
    setLoading(false)
  }, [router, params.id])

  // Auto-refresh messages
  useEffect(() => {
    if (!job) return
    
    const interval = setInterval(() => {
      setMessages(getMessages(job.id))
    }, 3000)

    return () => clearInterval(interval)
  }, [job])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !job) return

    const message: Message = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      jobId: job.id,
      senderId: user.id,
      senderName: user.fullName,
      content: newMessage.trim(),
      createdAt: new Date().toISOString()
    }

    saveMessage(message)
    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (loading || !user || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button onClick={() => router.back()} className="icon-btn -ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-gray-900">{job.posterName}</h1>
            <p className="text-sm text-gray-500">{job.title}</p>
          </div>
        </div>
      </header>

      {/* Job context */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            Discussing: <span className="font-medium">{job.title}</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map(message => {
              const isMe = message.senderId === user.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? 'bg-gray-900 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-medium text-gray-500 mb-1">{message.senderName}</p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-gray-900 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
