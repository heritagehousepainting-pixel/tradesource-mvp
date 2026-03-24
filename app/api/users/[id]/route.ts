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
      .from('contractors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
    if (updates.fullName) dbUpdates.name = updates.fullName
    if (updates.businessName) dbUpdates.company = updates.businessName
    if (updates.email) dbUpdates.email = updates.email
    if (updates.phone) dbUpdates.phone = updates.phone
    if (updates.licenseNumber) dbUpdates.license_number = updates.licenseNumber
    if (updates.reviewLink) dbUpdates.external_reviews = updates.reviewLink
    if (updates.status) dbUpdates.status = updates.status === 'approved' ? 'approved' : updates.status === 'rejected' ? 'rejected' : 'pending_review'
    if (updates.w9Data) dbUpdates.w9_url = updates.w9Data
    if (updates.insuranceData) dbUpdates.insurance_url = updates.insuranceData

    const { data, error } = await supabaseAdmin
      .from('contractors')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
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
      .from('contractors')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}