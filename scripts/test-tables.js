// Direct table creation script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://faykkxqvegzmprdoevvi.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheWtreHF2ZWd6bXByZG9ldnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc1NzQxNSwiZXhwIjoyMDg5MzMzNDE1fQ.2a9l6O2P6h_pDIFIS0UNtfC5lFOz1zVoKKSlklmfXUA';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTables() {
  console.log('Connecting to Supabase and creating tables...\n');
  
  // Test connection
  const { data: testData, error: testError } = await supabase.from('contractor_applications').select('count').maybeSingle();
  console.log('Connection test:', testError?.message || 'OK');
  
  // Create users table via SQL
  const usersSQL = `
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
  `;
  
  // Use postgrest to create table - try inserting to trigger creation if not exists
  // Actually, we need to use storage or execute raw SQL
  
  // Alternative: Try to insert into users - if table doesn't exist, we'll see
  console.log('\nAttempting to access users table...');
  const { error: usersError } = await supabase.from('users').select('*').limit(1);
  console.log('Users table error:', usersError?.message || 'Table exists');
  
  // Try jobs table
  console.log('\nAttempting to access jobs table...');
  const { error: jobsError } = await supabase.from('jobs').select('*').limit(1);
  console.log('Jobs table error:', jobsError?.message || 'Table exists');
  
  if (usersError?.code === 'PGRST116' || jobsError?.code === 'PGRST116') {
    console.log('\n⚠️  Tables do not exist. Need to create via Supabase dashboard:');
    console.log('Go to: https://supabase.com/dashboard/project/faykkxqvegzmprdoevvi/query');
    console.log('Run the SQL from: tradesource-mvp/supabase/fix-tables.sql');
  }
}

createTables().catch(console.error);