-- Insert test events using existing professional users as organizers
-- Note: is_free is a generated column, so we don't include it
INSERT INTO events (
  id, title, description, type, start_date, end_date, location, online_link, 
  max_participants, price, organizer_id, image_url, status
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'Webinaire : Gestion du stress au quotidien',
  'Découvrez des techniques pratiques pour gérer le stress et l''anxiété dans votre vie quotidienne. Ce webinaire interactif vous donnera des outils concrets pour retrouver la sérénité.',
  'webinar',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '2 hours',
  NULL,
  'https://zoom.us/j/example1',
  100,
  0,
  (SELECT id FROM profiles WHERE specialty IS NOT NULL LIMIT 1),
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  'published'
),
(
  'e1000000-0000-0000-0000-000000000002',
  'Atelier Nutrition : Alimentation équilibrée',
  'Un atelier pratique en présentiel pour apprendre à composer des repas équilibrés et nutritifs. Recettes et conseils personnalisés inclus.',
  'in-person',
  NOW() + INTERVAL '14 days',
  NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
  'Centre de bien-être Harmonie, 15 rue de la Santé, Paris 75014',
  NULL,
  25,
  45,
  (SELECT id FROM profiles WHERE specialty IS NOT NULL LIMIT 1),
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  'published'
),
(
  'e1000000-0000-0000-0000-000000000003',
  'Conférence : L''art de la méditation',
  'Une conférence inspirante sur les bienfaits de la méditation pour la santé mentale et physique. Séance de méditation guidée incluse.',
  'hybrid',
  NOW() + INTERVAL '21 days',
  NOW() + INTERVAL '21 days' + INTERVAL '2 hours',
  'Auditorium Zenith, 8 avenue de la Paix, Lyon 69001',
  'https://meet.google.com/example2',
  150,
  25,
  (SELECT id FROM profiles WHERE specialty IS NOT NULL OFFSET 1 LIMIT 1),
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  'published'
),
(
  'e1000000-0000-0000-0000-000000000004',
  'Workshop : Yoga pour débutants',
  'Initiez-vous au yoga dans une ambiance bienveillante. Apprenez les postures de base et les techniques de respiration essentielles.',
  'in-person',
  NOW() + INTERVAL '10 days',
  NOW() + INTERVAL '10 days' + INTERVAL '2 hours',
  'Studio Yoga Flow, 42 boulevard des Sports, Marseille 13008',
  NULL,
  15,
  35,
  (SELECT id FROM profiles WHERE specialty IS NOT NULL OFFSET 1 LIMIT 1),
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800',
  'published'
),
(
  'e1000000-0000-0000-0000-000000000005',
  'Webinaire gratuit : Introduction à la sophrologie',
  'Découvrez la sophrologie et ses applications pour le bien-être. Séance pratique de relaxation dynamique en direct.',
  'webinar',
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '5 days' + INTERVAL '1 hour 30 minutes',
  NULL,
  'https://teams.microsoft.com/example3',
  200,
  0,
  (SELECT id FROM profiles WHERE specialty IS NOT NULL LIMIT 1),
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
  'published'
)
ON CONFLICT (id) DO NOTHING;