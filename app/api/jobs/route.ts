import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform Supabase data to match our Job interface
    const jobs = (data || []).map(job => ({
      id: job.id,
      posterId: job.homeowner_id || '',
      posterName: '',
      posterBusiness: '',
      title: job.title,
      description: job.description,
      price: job.budget_max || 0,
      location: job.area || '',
      timing: 'Flexible',
      status: job.status === 'completed' ? 'completed' : job.status === 'in_progress' ? 'assigned' : 'open',
      interested: [],
      createdAt: job.created_at
    }))

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const job = await request.json()

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert([{
        title: job.title,
        description: job.description,
        area: job.location,
        budget_min: job.price * 0.8,
        budget_max: job.price,
        status: 'open',
        homeowner_id: job.posterId
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      ...job, 
      id: data.id,
      createdAt: data.created_at 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}