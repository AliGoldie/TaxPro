-- ====================================================================
-- TAXPRO MALAYSIA — MULTI-TENANT SUPABASE DATABASE SCHEMA
-- Malaysian Borang B Income Tax Act 1967 (Sec 33, Sec 39, Schedule 3)
-- ====================================================================

-- 1. Tenants / Workspaces Table
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Business Expenses & Asset Register Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  merchant TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  
  -- Tax Treatment Classifications
  equipment_nature TEXT CHECK (equipment_nature IN ('new_purchase', 'repair', NULL)),
  is_capital_allowance BOOLEAN DEFAULT FALSE,
  is_allowable_deduction BOOLEAN DEFAULT TRUE,
  asset_subtype TEXT,
  
  -- Apportionment (Sec 39(1) Private add-backs)
  private_use_pct INTEGER DEFAULT 0 CHECK (private_use_pct >= 0 AND private_use_pct <= 100),
  claimable_amount NUMERIC(12, 2) NOT NULL,
  private_amount NUMERIC(12, 2) DEFAULT 0.00,
  tax_rule_applied TEXT,
  
  receipt_image_url TEXT,
  audit_status TEXT DEFAULT 'audited',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Asynchronous Receipt Scanner Review Queue
CREATE TABLE IF NOT EXISTS public.receipt_queue (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  merchant_detected TEXT,
  amount_detected NUMERIC(12, 2),
  date_detected DATE,
  category_suggested TEXT,
  ocr_confidence INTEGER DEFAULT 90,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  image_url TEXT,
  raw_ocr_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_queue ENABLE ROW LEVEL SECURITY;

-- Default public policies for prototype (can be tightened with auth.uid())
CREATE POLICY "Allow read access to all workspaces" ON public.workspaces FOR SELECT USING (true);
CREATE POLICY "Allow all access to expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Allow all access to receipt_queue" ON public.receipt_queue FOR ALL USING (true);

-- 5. Seed Initial Malaysian Tenant Profiles
INSERT INTO public.workspaces (id, name, short_name, category, ssm_number, tin_number, regime, theme_palette)
VALUES 
  ('munchieskk', 'MUNCHIESKK (Food & Beverage)', 'MUNCHIESKK', 'Food & Beverage / Restaurant', 'SSM: 202303124567 (00348219-X)', 'TIN: C 2849102801', 'Borang B / Sole Proprietor F&B', 'warm'),
  ('rental', 'Rental Properties', 'Rental Portfolio', 'Real Estate / Residential & Commercial', 'SSM: Non-Registered / Individual Form B', 'TIN: SG 1938472904', 'Section 4(d) Rental Income / Form B', 'cool')
ON CONFLICT (id) DO NOTHING;
