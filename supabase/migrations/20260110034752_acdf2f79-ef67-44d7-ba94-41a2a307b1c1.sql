-- Update existing professional profiles with test data
UPDATE public.profiles SET
  specialty = 'Psychologue clinicien',
  bio = 'Psychologue clinicien avec plus de 10 ans d''expérience dans l''accompagnement des troubles anxieux et dépressifs.',
  experience_years = 10,
  location = 'Cotonou, Bénin',
  is_verified = true,
  avatar_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  consultation_rate = 25000
WHERE id = '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe';

UPDATE public.profiles SET
  specialty = 'Coach de vie',
  bio = 'Coach certifié ICF, spécialisé dans l''accompagnement des entrepreneurs et cadres dirigeants.',
  experience_years = 5,
  location = 'Lomé, Togo',
  is_verified = true,
  avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  consultation_rate = 30000
WHERE id = 'bba22a78-bace-4abd-a1e5-0e2de82de332';

-- Insert test services using real professional IDs
INSERT INTO public.services (id, provider_id, title, description, price, category_id, status, image_url) VALUES
  ('c1111111-1111-1111-1111-111111111111', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Consultation psychologique individuelle', 'Séance de thérapie individuelle pour traiter l''anxiété, la dépression ou les problèmes relationnels.', 25000, '8bdcfb3c-dad7-4f45-82af-17d03bcae177', 'approved', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'),
  ('c2222222-2222-2222-2222-222222222222', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Thérapie de couple', 'Accompagnement des couples en difficulté pour améliorer leur communication et résoudre les conflits.', 35000, '13fea1b2-64c9-47d0-ba7a-992bef79f1a2', 'approved', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800'),
  ('c3333333-3333-3333-3333-333333333333', 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'Bilan nutritionnel complet', 'Évaluation complète de vos habitudes alimentaires avec recommandations personnalisées.', 15000, '414443fb-f134-4cae-a662-7f1255f35e43', 'approved', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800'),
  ('c4444444-4444-4444-4444-444444444444', 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'Coaching carrière', 'Accompagnement pour votre développement professionnel et votre évolution de carrière.', 30000, '10fe1cae-f9ac-4116-8704-2bc3423dca30', 'approved', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800'),
  ('c5555555-5555-5555-5555-555555555555', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Séance de méditation guidée', 'Session individuelle de méditation pour réduire le stress et améliorer votre bien-être.', 10000, '7c3131f6-5abc-4202-b318-bbb59d102307', 'approved', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800'),
  ('c6666666-6666-6666-6666-666666666666', 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'Accompagnement stress professionnel', 'Programme personnalisé pour gérer le stress lié au travail et prévenir le burnout.', 40000, '414443fb-f134-4cae-a662-7f1255f35e43', 'approved', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800')
ON CONFLICT (id) DO NOTHING;

-- Insert test formations using real professional IDs
INSERT INTO public.formations (id, author_id, title, description, price, level, duration, modules_count, category_id, status, image_url, affiliation_enabled, affiliation_type, affiliation_value) VALUES
  ('d1111111-1111-1111-1111-111111111111', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Gérer son stress au quotidien', 'Formation complète pour comprendre et maîtriser le stress grâce à des techniques éprouvées.', 45000, 'débutant', '4 semaines', 8, '3bacdc20-2488-4992-8776-28189b0cd1ea', 'approved', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800', true, 'percentage', 15),
  ('d2222222-2222-2222-2222-222222222222', 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'Leadership et management', 'Développez vos compétences en leadership pour diriger avec impact.', 75000, 'intermédiaire', '6 semaines', 12, '6d25a6f0-b796-42ab-b822-d51ff1d3b5f7', 'approved', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', true, 'fixed', 7500),
  ('d3333333-3333-3333-3333-333333333333', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Introduction à la méditation', 'Apprenez les bases de la méditation pour une vie plus sereine et équilibrée.', 25000, 'débutant', '2 semaines', 4, '7c3131f6-5abc-4202-b318-bbb59d102307', 'approved', 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800', false, 'percentage', 0),
  ('d4444444-4444-4444-4444-444444444444', '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'Thérapie cognitive comportementale', 'Formation approfondie sur les techniques de TCC pour les professionnels.', 120000, 'avancé', '8 semaines', 16, '8bdcfb3c-dad7-4f45-82af-17d03bcae177', 'approved', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', true, 'percentage', 20),
  ('d5555555-5555-5555-5555-555555555555', 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'Développer sa confiance en soi', 'Programme complet pour renforcer l''estime de soi et atteindre ses objectifs personnels.', 55000, 'débutant', '5 semaines', 10, '3bacdc20-2488-4992-8776-28189b0cd1ea', 'approved', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', true, 'percentage', 10)
ON CONFLICT (id) DO NOTHING;