import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('contractors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform Supabase data to match our User interface
    const users = (data || []).map(contractor => ({
      id: contractor.id,
      fullName: contractor.name,
      businessName: contractor.company || '',
      email: contractor.email,
      phone: contractor.phone || '',
      licenseNumber: contractor.license_number || '',
      yearsExperience: 0,
      reviewLink: contractor.external_reviews || '',
      w9Data: null,
      insuranceData: null,
      status: contractor.status === 'approved' ? 'approved' : contractor.status === 'rejected' ? 'rejected' : 'pending',
      createdAt: contractor.created_at,
      documents: {
        w9: contractor.w9_url ? { name: 'W-9', data: contractor.w9_url, uploadedAt: contractor.updated_at } : undefined,
        insurance: contractor.insurance_url ? { name: 'Insurance', data: contractor.insurance_url, uploadedAt: contractor.updated_at } : undefined
      }
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const user = await request.json()

    const { data, error } = await supabaseAdmin
      .from('contractors')
      .insert([{
        name: user.fullName,
        email: user.email,
        company: user.businessName,
        phone: user.phone,
        license_number: user.licenseNumber,
        external_reviews: user.reviewLink,
        status: user.status || 'pending_review'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      ...user, 
      id: data.id,
      createdAt: data.created_at 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}