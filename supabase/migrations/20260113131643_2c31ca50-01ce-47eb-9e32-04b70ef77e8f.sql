-- 1. Ajouter la colonne slug pour les URLs SEO-friendly
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Créer un index unique sur le slug
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_unique ON public.services(slug) WHERE slug IS NOT NULL;

-- 3. Supprimer les services dupliqués (garder seulement les 'c' IDs qui ont les reviews)
DELETE FROM public.services WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'a4444444-4444-4444-4444-444444444444'
);

-- 4. Mettre à jour les slugs pour les services restants
UPDATE public.services SET slug = 'consultation-psychologique-individuelle' WHERE id = 'c1111111-1111-1111-1111-111111111111';
UPDATE public.services SET slug = 'therapie-de-couple' WHERE id = 'c2222222-2222-2222-2222-222222222222';
UPDATE public.services SET slug = 'bilan-nutritionnel-complet' WHERE id = 'c3333333-3333-3333-3333-333333333333';
UPDATE public.services SET slug = 'coaching-carriere' WHERE id = 'c4444444-4444-4444-4444-444444444444';
UPDATE public.services SET slug = 'seance-meditation-guidee' WHERE id = 'c5555555-5555-5555-5555-555555555555';
UPDATE public.services SET slug = 'accompagnement-stress-professionnel' WHERE id = 'c6666666-6666-6666-6666-666666666666';

-- 5. Créer une fonction pour générer automatiquement les slugs
CREATE OR REPLACE FUNCTION public.generate_service_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Générer le slug de base à partir du titre
  base_slug := lower(NEW.title);
  base_slug := translate(base_slug, 'àâäéèêëïîôùûüç', 'aaaeeeeiioouuc');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  new_slug := base_slug;
  
  -- Vérifier l'unicité et ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM public.services WHERE slug = new_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 6. Créer le trigger pour les nouveaux services
DROP TRIGGER IF EXISTS set_service_slug ON public.services;
CREATE TRIGGER set_service_slug
  BEFORE INSERT ON public.services
  FOR EACH ROW
  WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_service_slug();