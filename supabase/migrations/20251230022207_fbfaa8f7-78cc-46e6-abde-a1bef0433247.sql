-- Add affiliation fields to formations table
ALTER TABLE public.formations
ADD COLUMN affiliation_enabled boolean DEFAULT false,
ADD COLUMN affiliation_type text DEFAULT 'percentage' CHECK (affiliation_type IN ('percentage', 'fixed')),
ADD COLUMN affiliation_value numeric DEFAULT 0;

-- Create affiliations table to track affiliate links and sales
CREATE TABLE public.affiliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  affiliate_code text NOT NULL UNIQUE,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  total_earned numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'inactive')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(formation_id, affiliate_id)
);

-- Create affiliate sales tracking table
CREATE TABLE public.affiliate_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id uuid NOT NULL REFERENCES public.affiliations(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  formation_id uuid NOT NULL REFERENCES public.formations(id) ON DELETE CASCADE,
  sale_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  commission_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliations
CREATE POLICY "Users can view their own affiliations"
ON public.affiliations FOR SELECT
USING (auth.uid() = affiliate_id);

CREATE POLICY "Users can create affiliations for enabled formations"
ON public.affiliations FOR INSERT
WITH CHECK (
  auth.uid() = affiliate_id AND
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_id
    AND f.affiliation_enabled = true
    AND f.status = 'approved'
    AND f.author_id != auth.uid()
  )
);

CREATE POLICY "Users can update their own affiliations"
ON public.affiliations FOR UPDATE
USING (auth.uid() = affiliate_id);

CREATE POLICY "Formation authors can view affiliations for their formations"
ON public.affiliations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_id AND f.author_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all affiliations"
ON public.affiliations FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for affiliate_sales
CREATE POLICY "Affiliates can view their sales"
ON public.affiliate_sales FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.affiliations a
    WHERE a.id = affiliation_id AND a.affiliate_id = auth.uid()
  )
);

CREATE POLICY "Formation authors can view sales of their formations"
ON public.affiliate_sales FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.formations f
    WHERE f.id = formation_id AND f.author_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all affiliate sales"
ON public.affiliate_sales FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Function to generate unique affiliate code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.affiliate_code := 'AFF-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$;

-- Trigger for auto-generating affiliate code
CREATE TRIGGER generate_affiliate_code_trigger
BEFORE INSERT ON public.affiliations
FOR EACH ROW
EXECUTE FUNCTION public.generate_affiliate_code();

-- Trigger for updating updated_at
CREATE TRIGGER update_affiliations_updated_at
BEFORE UPDATE ON public.affiliations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();