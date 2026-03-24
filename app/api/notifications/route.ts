import { NextResponse } from 'next/server'

// In-memory notifications store for MVP
// In production, use Supabase or another database
let notifications: any[] = []

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    let filtered = notifications
    
    if (userId) {
      filtered = notifications.filter(n => n.userId === userId)
    }

    return NextResponse.json(filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const notification = await request.json()
    
    const newNotification = {
      ...notification,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: new Date().toISOString(),
      read: false
    }

    notifications.unshift(newNotification)
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50)
    }

    return NextResponse.json(newNotification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}