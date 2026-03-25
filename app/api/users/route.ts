import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('READ ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
      documents: {}
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error('READ EXCEPTION:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const user = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Creating user with data:', user)

    const { data, error } = await supabase
      .from('contractor_applications')
      .insert([{
        name: user.fullName || user.fullName,
        email: user.email,
        company: user.businessName || '',
        phone: user.phone || '',
        license_number: user.licenseNumber || '',
        external_reviews: user.reviewLink || '',
        status: user.status || 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('INSERT ERROR:', error)
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }

    console.log('User created:', data)
    return NextResponse.json({ 
      ...user, 
      id: data.id,
      createdAt: data.created_at 
    }, { status: 201 })
  } catch (error) {
    console.error('POST EXCEPTION:', error)
    return NextResponse.json({ error: String(error), stack: error instanceof Error ? error.stack : null }, { status: 500 })
  }
}
