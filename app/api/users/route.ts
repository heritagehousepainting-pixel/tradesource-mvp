import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    // Fallback to localStorage for MVP
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('tradesource_users') || '[]')
      return NextResponse.json(users)
    }
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    // Read from contractor_applications table (not contractors)
    const { data, error } = await supabaseAdmin
      .from('contractor_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform Supabase data to match our User interface
    const users = (data || []).map(app => ({
      id: app.id,
      fullName: app.name,
      businessName: app.company || '',
      email: app.email,
      phone: app.phone || '',
      licenseNumber: app.license_number || '',
      yearsExperience: 0,
      reviewLink: app.external_reviews || '',
      w9Data: null,
      insuranceData: null,
      status: app.status === 'approved' ? 'approved' : app.status === 'rejected' ? 'rejected' : 'pending',
      createdAt: app.created_at,
      documents: {
        w9: app.w9_doc_path ? { name: 'W-9', data: app.w9_doc_path, uploadedAt: app.created_at } : undefined,
        insurance: app.insurance_doc_path ? { name: 'Insurance', data: app.insurance_doc_path, uploadedAt: app.created_at } : undefined
      }
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const user = await request.json()

    // Insert into contractor_applications table
    const { data, error } = await supabaseAdmin
      .from('contractor_applications')
      .insert([{
        name: user.fullName,
        email: user.email,
        company: user.businessName,
        phone: user.phone,
        license_number: user.licenseNumber,
        external_reviews: user.reviewLink,
        status: user.status || 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      throw error
    }

    return NextResponse.json({ 
      ...user, 
      id: data.id,
      createdAt: data.created_at 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user', details: String(error) }, { status: 500 })
  }
}
