-- Create function to update timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a platform_settings table to store admin-configurable settings
CREATE TABLE public.platform_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view platform settings" 
ON public.platform_settings 
FOR SELECT 
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage platform settings" 
ON public.platform_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('alternative_payment', '{"enabled": true, "methods": ["bank_transfer", "on_site"], "bank_details": {"bank_name": "", "account_number": "", "account_name": ""}, "instructions": "Veuillez effectuer le virement et envoyer la preuve de paiement par email."}', 'Configuration des méthodes de paiement alternatives (virement, sur place)');