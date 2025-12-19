-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'formation' CHECK (type IN ('formation', 'service', 'both')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, description, type) VALUES
('Développement Personnel', 'Croissance personnelle et bien-être mental', 'both'),
('Formation Professionnelle', 'Compétences et certifications professionnelles', 'formation'),
('Relations', 'Thérapie de couple et relations interpersonnelles', 'both'),
('Spécialisation', 'Formations avancées et spécialisées', 'formation'),
('Bien-être au Travail', 'Gestion du stress et équilibre vie-travail', 'both'),
('Psychologie Clinique', 'Troubles et pathologies mentales', 'both'),
('Thérapie Familiale', 'Dynamiques familiales et parentalité', 'both'),
('Addictions', 'Accompagnement des dépendances', 'both'),
('Anxiété et Dépression', 'Gestion de l''anxiété et troubles dépressifs', 'both'),
('Traumatismes', 'PTSD et gestion des traumatismes', 'both'),
('Enfants et Adolescents', 'Psychologie de l''enfant et de l''adolescent', 'both'),
('Neuropsychologie', 'Fonctions cognitives et troubles neurologiques', 'both'),
('Hypnothérapie', 'Techniques d''hypnose thérapeutique', 'both'),
('Méditation et Pleine Conscience', 'Mindfulness et techniques de relaxation', 'both'),
('Coaching de Vie', 'Accompagnement personnel et professionnel', 'service');