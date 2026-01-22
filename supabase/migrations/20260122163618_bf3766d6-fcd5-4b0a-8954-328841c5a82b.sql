-- Create storage bucket for branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('branding', 'branding', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for branding bucket
CREATE POLICY "Admins can upload branding assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update branding assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete branding assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Anyone can view branding assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'branding');

-- Insert default branding settings
INSERT INTO public.platform_settings (key, value, description)
VALUES (
  'branding',
  '{
    "site_name": "Allô Psy",
    "header_logo": "",
    "footer_logo": "",
    "favicon": "",
    "primary_color": "215 55% 25%",
    "accent_color": "135 45% 50%"
  }'::jsonb,
  'Paramètres de branding de la plateforme (logos, couleurs)'
)
ON CONFLICT (key) DO NOTHING;