import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/contractor_applications?select=*&order=created_at.desc`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    
    if (!response.ok) {
      const err = await response.text()
      console.error('READ ERROR:', err)
      return NextResponse.json({ error: err }, { status: 500 })
    }
    
    const data = await response.json()
    
    const users = (data || []).map((app: any) => ({
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
    
    const insertData = {
      name: user.fullName || user.fullName || 'Unknown',
      email: user.email,
      company: user.businessName || '',
      phone: user.phone || '',
      license_number: user.licenseNumber || '',
      external_reviews: user.reviewLink || '',
      status: 'pending'
    }

    console.log('INSERTING:', JSON.stringify(insertData))

    const response = await fetch(`${supabaseUrl}/rest/v1/contractor_applications`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(insertData)
    })

    const responseText = await response.text()
    console.log('RESPONSE STATUS:', response.status)
    console.log('RESPONSE BODY:', responseText)

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: responseText,
        status: response.status
      }, { status: 500 })
    }

    const data = JSON.parse(responseText)
    return NextResponse.json({ 
      ...user, 
      id: data[0]?.id || 'unknown',
      createdAt: data[0]?.created_at || new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('POST EXCEPTION:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
