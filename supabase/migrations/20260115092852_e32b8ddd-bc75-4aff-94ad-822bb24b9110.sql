-- Mettre à jour les profils professionnels existants avec des informations complètes

-- Profil 1: professionel
UPDATE public.profiles 
SET 
  full_name = 'Dr. Koffi Mensah',
  specialty = 'Coach de vie',
  bio = 'Coach certifié ICF avec plus de 5 ans d''expérience dans l''accompagnement des entrepreneurs et cadres dirigeants. Spécialisé dans le développement personnel, la gestion du stress et l''atteinte des objectifs professionnels.',
  experience_years = 5,
  consultation_rate = 30000,
  location = 'Lomé, Togo',
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  is_verified = true,
  phone = '+228 90 12 34 56',
  availability = 'Lundi - Vendredi, 9h - 18h'
WHERE id = 'bba22a78-bace-4abd-a1e5-0e2de82de332';

-- Profil 2: K. Oswald
UPDATE public.profiles 
SET 
  full_name = 'Dr. Oswald Agassoussi',
  specialty = 'Psychologue clinicien',
  bio = 'Psychologue clinicien diplômé avec plus de 10 ans d''expérience dans l''accompagnement des troubles anxieux, dépressifs et des traumatismes. Approche intégrative combinant thérapie cognitivo-comportementale et techniques de pleine conscience.',
  experience_years = 10,
  consultation_rate = 25000,
  location = 'Cotonou, Bénin',
  avatar_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  is_verified = true,
  phone = '+229 97 12 34 56',
  availability = 'Lundi - Samedi, 8h - 17h'
WHERE id = '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe';