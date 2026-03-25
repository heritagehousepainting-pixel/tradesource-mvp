// Table setup script - run with service role
// Usage: node scripts/create-tables.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://faykkxqvegzmprdoevvi.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheWtreHF2ZWd6bXByZG9ldnZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc1NzQxNSwiZXhwIjoyMDg5MzMzNDE1fQ.2a9l6O2P6h_pDIFIS0UNtfC5lFOz1zVoKKSlklmfXUA';

const supabase = createClient(supabaseUrl, serviceKey);

async function createTables() {
  console.log('Creating tables...');
  
  // Create users table
  const { error: usersError } = await supabase.rpc('create_users_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
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
  
  console.log('Users table result:', usersError || 'Created');
  
  // Create jobs table  
  const { error: jobsError } = await supabase.rpc('create_jobs_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS jobs (
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
  
  console.log('Jobs table result:', jobsError || 'Created');
}

createTables().catch(console.error);