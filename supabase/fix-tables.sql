-- Run this SQL in Supabase SQL Editor to create required tables
-- This fixes the backend connection

-- Users table (matches app API)
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

-- Jobs table (matches app API)
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

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  title TEXT,
  body TEXT,
  "jobId" TEXT,
  "userId" TEXT,
  "read" BOOLEAN DEFAULT FALSE,
  "createdAt" TEXT
);

-- Enable RLS but allow service role access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated access
CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);