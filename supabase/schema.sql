-- TradeSource Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CONTRACTOR APPLICATIONS (pending approvals)
-- ============================================
CREATE TABLE IF NOT EXISTS contractor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100),
  external_reviews TEXT,
  status VARCHAR(50) DEFAULT 'pending_review', -- pending_review, approved, rejected
  verified_w9 BOOLEAN DEFAULT FALSE,
  verified_insurance BOOLEAN DEFAULT FALSE,
  verified_license BOOLEAN DEFAULT FALSE,
  verified_external BOOLEAN DEFAULT FALSE,
  w9_url TEXT,
  insurance_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTRACTORS (approved/active contractors)
-- ============================================
CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Links to Supabase Auth user
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  company VARCHAR(255),
  phone VARCHAR(50),
  license_number VARCHAR(100),
  external_reviews TEXT,
  status VARCHAR(50) DEFAULT 'approved', -- approved, suspended
  verified_w9 BOOLEAN DEFAULT FALSE,
  verified_insurance BOOLEAN DEFAULT FALSE,
  verified_license BOOLEAN DEFAULT FALSE,
  verified_external BOOLEAN DEFAULT FALSE,
  w9_url TEXT,
  insurance_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HOMEOWNERS
-- ============================================
CREATE TABLE IF NOT EXISTS homeowners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Links to Supabase Auth user
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOBS
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- residential, commercial, industrial, multi-family
  area VARCHAR(255), -- location like "Ambler, PA"
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, completed, cancelled
  contractor_id UUID REFERENCES contractors(id),
  homeowner_id UUID REFERENCES homeowners(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOB INTERESTS (contractors expressing interest)
-- ============================================
CREATE TABLE IF NOT EXISTS job_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS job_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id),
  contractor_id UUID REFERENCES contractors(id),
  homeowner_id UUID REFERENCES homeowners(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contractor_applications_email ON contractor_applications(email);
CREATE INDEX IF NOT EXISTS idx_contractor_applications_status ON contractor_applications(status);
CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractors(email);
CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);
CREATE INDEX IF NOT EXISTS idx_homeowners_email ON homeowners(email);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_contractor ON jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_jobs_homeowner ON jobs(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_job ON job_interests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_contractor ON job_interests(contractor_id);
CREATE INDEX IF NOT EXISTS idx_job_reviews_job ON job_reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_job_reviews_contractor ON job_reviews(contractor_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE contractor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeowners ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reviews ENABLE ROW LEVEL SECURITY;

-- Contractors can read their own data, admins can read all
CREATE POLICY "Contractors can view their own profile" ON contractors
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- Contractors can read jobs
CREATE POLICY "Anyone can view jobs" ON jobs
  FOR SELECT USING (true);

-- Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Contractors can update their own jobs
CREATE POLICY "Contractors can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = contractor_id OR auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- STORAGE BUCKETS (for document uploads)
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('contractor-docs', 'contractor-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for contractor documents
CREATE POLICY "Public can view contractor documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'contractor-docs');

-- Admin can upload contractor documents
CREATE POLICY "Admins can upload contractor documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contractor-docs' AND auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- TRIGGERS (auto-timestamps)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contractor_applications_updated_at
  BEFORE UPDATE ON contractor_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_homeowners_updated_at
  BEFORE UPDATE ON homeowners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();