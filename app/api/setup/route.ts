import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role
const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST() {
  try {
    // Create users table
    const { error: usersError } = await supabaseAdmin.rpc('pg_catalog.execute', {
      query: `
        CREATE TABLE IF NOT EXISTS public.users (
          id TEXT PRIMARY KEY,
          "fullName" TEXT,
          "businessName" TEXT,
          email TEXT,
          phone TEXT,
          "licenseNumber" TEXT,
          "yearsExperience" INTEGER,
          "reviewLink" TEXT,
          "w9Data" TEXT,
          "insuranceData" TEXT,
          status TEXT DEFAULT 'pending',
          "createdAt" TEXT,
          "passwordHash" TEXT,
          "userType" TEXT,
          "availabilityStatus" TEXT,
          "lastActiveAt" TEXT,
          "hasSeenApprovalNotification" BOOLEAN DEFAULT FALSE,
          "lastApprovedAt" TEXT
        );
      `
    });

    // Create jobs table
    const { error: jobsError } = await supabaseAdmin.rpc('pg_catalog.execute', {
      query: `
        CREATE TABLE IF NOT EXISTS public.jobs (
          id TEXT PRIMARY KEY,
          "posterId" TEXT,
          "posterName" TEXT,
          "posterBusiness" TEXT,
          title TEXT,
          description TEXT,
          price REAL,
          location TEXT,
          timing TEXT,
          status TEXT DEFAULT 'open',
          interested TEXT[],
          "createdAt" TEXT,
          "expiresAt" TEXT,
          "isUrgent" BOOLEAN DEFAULT FALSE,
          "urgentResponseDeadline" INTEGER
        );
      `
    });

    return NextResponse.json({ 
      success: true, 
      usersError: usersError?.message || null,
      jobsError: jobsError?.message || null
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}