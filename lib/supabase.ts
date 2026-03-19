import { createBrowserClient } from '@supabase/ssr'

// Browser client for client-side usage
// This is used throughout the app for client-side operations
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a client with placeholder values - will fall back to localStorage
      browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
      )
    } else {
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
  }
  return browserClient
}

// For backward compatibility - use the browser client
export const supabase = getSupabaseBrowserClient()

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// Get contractor verification status
export async function getContractorVerificationStatus(email: string): Promise<'approved' | 'pending' | 'rejected' | 'not_found'> {
  if (!isSupabaseConfigured()) {
    // Check localStorage for MVP demo
    if (typeof window !== 'undefined') {
      const approved = JSON.parse(localStorage.getItem('approved_contractors') || '[]')
      const found = approved.find((c: any) => c.email === email && c.status === 'approved')
      if (found) return 'approved'
    }
    return 'not_found'
  }
  
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Check approved contractors table
    const { data: contractor } = await supabase
      .from('contractors')
      .select('status')
      .eq('email', email)
      .single()
    
    if (contractor) {
      return contractor.status as 'approved' | 'pending' | 'rejected'
    }
    
    // Check applications
    const { data: app } = await supabase
      .from('contractor_applications')
      .select('status')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (app) {
      return app.status as 'approved' | 'pending' | 'rejected'
    }
    
    return 'not_found'
  } catch {
    return 'not_found'
  }
}