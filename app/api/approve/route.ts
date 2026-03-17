import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  const body = await request.json()
  const { applicationId, email, name, company } = body

  if (!supabaseServiceKey) {
    return Response.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  try {
    // Create auth user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: tempPassword,
      user_metadata: {
        name,
        company
      }
    })

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 })
    }

    // Create contractor profile
    const { error: contractorError } = await supabaseAdmin
      .from('contractors')
      .insert({
        id: authData.user.id,
        name,
        email,
        company,
        status: 'active'
      })

    if (contractorError) {
      return Response.json({ error: contractorError.message }, { status: 400 })
    }

    // Update application status
    await supabaseAdmin
      .from('contractor_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId)

    return Response.json({ 
      success: true, 
      message: 'Contractor approved and account created',
      tempPassword // In production, send via email instead
    })

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
