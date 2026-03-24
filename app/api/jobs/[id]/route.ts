import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const updates = await request.json()

    const dbUpdates: any = {}
    if (updates.title) dbUpdates.title = updates.title
    if (updates.description) dbUpdates.description = updates.description
    if (updates.location) dbUpdates.area = updates.location
    if (updates.price) {
      dbUpdates.budget_min = updates.price * 0.8
      dbUpdates.budget_max = updates.price
    }
    if (updates.status) {
      dbUpdates.status = updates.status === 'completed' ? 'completed' : 
                        updates.status === 'assigned' ? 'in_progress' : 'open'
    }
    if (updates.interested) {
      // Store interested contractors in a separate table or JSON field
      // For now, we'll need job_interests table
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    
    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}