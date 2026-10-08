-- ====================================================================
-- TAXPRO MALAYSIA — COMPLETE SUPABASE DATABASE MIGRATIONS
-- Phase 2: Multi-Tenant LHDN Borang B (Sec 4a & Sec 4d), Assets & Vehicles
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Tenants / Workspaces Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  category TEXT NOT NULL,
  ssm_number TEXT,
  tin_number TEXT,
  regime TEXT NOT NULL,
  theme_palette TEXT DEFAULT 'warm',
  currency TEXT DEFAULT 'MYR',
  storage_bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. Vehicles Fleet & Mileage Table (Sec 39 Apportionment)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  workspace_id TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  vehicle_name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  vehicle_type TEXT DEFAULT 'Commercial 4x4 / Passenger',
  default_business_percentage INTEGER DEFAULT 80 CHECK (default_business_percentage >= 0 AND default_business_percentage <= 100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Logbook Table
CREATE TABLE IF NOT EXISTS public.mileage_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  trip_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  distance_km NUMERIC(8, 2) NOT NULL,
  benchmark_rate_myr NUMERIC(4, 2) DEFAULT 0.60,
  deduction_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. Capital Allowance (CA) Asset Register (Schedule 3)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.capital_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Kitchen Plant', 'ICT Hardware', 'Vehicles', 'Office Furniture'
  acquisition_date DATE NOT NULL,
  qualifying_cost NUMERIC(12, 2) NOT NULL,
  initial_allowance_rate NUMERIC(5, 2) DEFAULT 20.00, -- 20% IA standard
  annual_allowance_rate NUMERIC(5, 2) NOT NULL,       -- 14% plant, 40% ICT, 20% vehicles, 10% furniture
  year_acquired INTEGER NOT NULL,
  disposal_date DATE,
  disposal_value NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Annual Tax Written Down Value (TWDV) Schedules
CREATE TABLE IF NOT EXISTS public.capital_allowance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.capital_assets(id) ON DELETE CASCADE,
  year_of_assessment INTEGER NOT NULL,
  opening_twdv NUMERIC(12, 2) NOT NULL,
  initial_allowance_claim NUMERIC(12, 2) DEFAULT 0.00,
  annual_allowance_claim NUMERIC(12, 2) NOT NULL,
  total_allowance_claimed NUMERIC(12, 2) NOT NULL,
  closing_twdv NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. Business Expenses Ledger
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  merchant TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  
  -- Tax Treatment
  equipment_nature TEXT CHECK (equipment_nature IN ('new_purchase', 'repair', NULL)),
  is_capital_allowance BOOLEAN DEFAULT FALSE,
  is_allowable_deduction BOOLEAN DEFAULT TRUE,
  asset_subtype TEXT,
  
  -- Apportionment
  private_use_pct INTEGER DEFAULT 0 CHECK (private_use_pct >= 0 AND private_use_pct <= 100),
  claimable_amount NUMERIC(12, 2) NOT NULL,
  private_amount NUMERIC(12, 2) DEFAULT 0.00,
  tax_rule_applied TEXT,
  
  -- LHDN File Storage & Verification
  receipt_image_url TEXT,
  lhdn_file_name TEXT,
  is_myinvois_verified BOOLEAN DEFAULT FALSE,
  myinvois_uuid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. Review Queue (Asynchronous OCR & LHDN QR Pipeline)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipt_queue (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  merchant_detected TEXT,
  amount_detected NUMERIC(12, 2),
  date_detected DATE,
  category_suggested TEXT,
  ocr_confidence INTEGER DEFAULT 90,
  is_myinvois_verified BOOLEAN DEFAULT FALSE,
  storage_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  thumbnail_url TEXT,
  raw_ocr_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. Supabase Storage Buckets
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('munchieskk-receipts-4a', 'munchieskk-receipts-4a', true),
  ('rental-receipts-4d', 'rental-receipts-4d', true)
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------
-- 7. Row Level Security (RLS)
-- --------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_allowance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Allow all on vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow all on mileage_trips" ON public.mileage_trips FOR ALL USING (true);
CREATE POLICY "Allow all on capital_assets" ON public.capital_assets FOR ALL USING (true);
CREATE POLICY "Allow all on capital_allowance_schedules" ON public.capital_allowance_schedules FOR ALL USING (true);
CREATE POLICY "Allow all on expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Allow all on receipt_queue" ON public.receipt_queue FOR ALL USING (true);

-- --------------------------------------------------------------------
-- 8. Seed Initial Malaysian Data
-- --------------------------------------------------------------------
-- Workspaces
INSERT INTO public.workspaces (id, name, short_name, category, ssm_number, tin_number, regime, theme_palette, storage_bucket)
VALUES 
  ('munchieskk', 'MUNCHIESKK (Food & Beverage)', 'MUNCHIESKK', 'Food & Beverage / Restaurant', 'SSM: 202303124567 (00348219-X)', 'TIN: C 2849102801', 'Borang B / Sole Proprietor F&B (Sec 4a)', 'warm', 'munchieskk-receipts-4a'),
  ('rental', 'Rental Properties', 'Rental Portfolio', 'Real Estate / Residential & Commercial', 'SSM: Non-Registered / Individual Form B', 'TIN: SG 1938472904', 'Section 4(d) Rental Income / Form B', 'cool', 'rental-receipts-4d')
ON CONFLICT (id) DO NOTHING;

-- Vehicles Seed
INSERT INTO public.vehicles (id, vehicle_name, registration_number, vehicle_type, default_business_percentage)
VALUES 
  ('a1b2c3d4-0001-0000-0000-000000000001', 'Isuzu D-Max RT50', 'SAB 4812 E', 'Commercial 4x4 (F&B Transport)', 80),
  ('a1b2c3d4-0002-0000-0000-000000000002', 'Perodua Ativa', 'SAC 9123 X', 'Compact SUV (Property Runabout)', 50)
ON CONFLICT (registration_number) DO NOTHING;
