import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, password, name, company } = body

    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if user already exists by listing users (admin API)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users?.users.find(u => u.email === email)

    if (existingUser) {
      // For existing users, we need to update via the admin API
      // Using type assertion to access the method
      const adminClient = supabaseAdmin.auth.admin as any
      
      // Try to update user - if this fails, we'll create a new one
      try {
        await adminClient.updateUser(existingUser.id, { password })
        
        // Update contractor status
        await supabaseAdmin
          .from('contractors')
          .update({ status: 'approved', password_set: true })
          .eq('email', email)

        return NextResponse.json({ success: true })
      } catch (updateError) {
        console.error('Update user error:', updateError)
        // If update fails, try to create a new user
      }
    }

    // Create new user with admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name,
        company
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (data.user) {
      // Update contractors table with user_id
      await supabaseAdmin
        .from('contractors')
        .update({ 
          user_id: data.user.id,
          status: 'approved',
          password_set: true
        })
        .eq('email', email)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  } catch (error) {
    console.error('Password setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}