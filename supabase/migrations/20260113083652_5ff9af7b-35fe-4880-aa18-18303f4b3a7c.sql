-- Insert test reviews for services with real user IDs
INSERT INTO public.reviews (id, user_id, target_type, target_id, rating, comment, status, created_at)
VALUES
  -- Reviews for "Séance de Coaching Personnel" (c2222222-2222-2222-2222-222222222222)
  (gen_random_uuid(), '58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'service', 'c2222222-2222-2222-2222-222222222222', 5, 'Le coaching avec Marie Martin a transformé ma vie professionnelle ! Objectifs clairs, méthodes efficaces.', 'approved', now() - interval '15 days'),
  (gen_random_uuid(), 'c5ebca21-33c6-42c5-9143-9ce042174c40', 'service', 'c2222222-2222-2222-2222-222222222222', 4, 'Très bonne expérience. Marie est dynamique et motivante. J''ai atteint mes objectifs en 3 mois.', 'approved', now() - interval '8 days'),
  (gen_random_uuid(), '841ed5a7-1edb-4e7e-802c-72d2e9712803', 'service', 'c2222222-2222-2222-2222-222222222222', 5, 'Incroyable ! Je recommande à 100%. Le meilleur investissement que j''ai fait pour ma carrière.', 'approved', now() - interval '3 days'),
  (gen_random_uuid(), '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'service', 'c2222222-2222-2222-2222-222222222222', 3, 'Bon coaching mais les prix sont un peu élevés pour le nombre de séances proposées.', 'approved', now() - interval '1 day'),
  
  -- Reviews for "Consultation Psychologique Individuelle" (c1111111-1111-1111-1111-111111111111)
  (gen_random_uuid(), '58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'service', 'c1111111-1111-1111-1111-111111111111', 5, 'Excellente consultation ! Dr. Dubois est très à l''écoute et m''a vraiment aidé à surmonter mes difficultés.', 'approved', now() - interval '10 days'),
  (gen_random_uuid(), 'c5ebca21-33c6-42c5-9143-9ce042174c40', 'service', 'c1111111-1111-1111-1111-111111111111', 4, 'Très bon accompagnement, j''ai apprécié l''approche bienveillante.', 'approved', now() - interval '5 days'),
  (gen_random_uuid(), 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'service', 'c1111111-1111-1111-1111-111111111111', 5, 'Un professionnel exceptionnel. Les séances m''ont permis de retrouver confiance en moi.', 'approved', now() - interval '2 days'),
  
  -- Reviews for "Thérapie Familiale" (c3333333-3333-3333-3333-333333333333)
  (gen_random_uuid(), 'c5ebca21-33c6-42c5-9143-9ce042174c40', 'service', 'c3333333-3333-3333-3333-333333333333', 5, 'Nous avons consulté pour des problèmes de communication. Les résultats sont impressionnants.', 'approved', now() - interval '20 days'),
  (gen_random_uuid(), '3b9a2439-53f2-4589-bb2e-b1ac9c4226fe', 'service', 'c3333333-3333-3333-3333-333333333333', 4, 'Approche professionnelle et respectueuse. Notre famille communique mieux maintenant.', 'approved', now() - interval '12 days'),
  
  -- Reviews for "Consultation Nutrition" (c4444444-4444-4444-4444-444444444444)
  (gen_random_uuid(), '58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'service', 'c4444444-4444-4444-4444-444444444444', 5, 'Programme personnalisé excellent ! J''ai perdu 10kg en 4 mois de manière saine.', 'approved', now() - interval '25 days'),
  (gen_random_uuid(), 'bba22a78-bace-4abd-a1e5-0e2de82de332', 'service', 'c4444444-4444-4444-4444-444444444444', 5, 'Sophie connaît vraiment son métier. Conseils pratiques et suivi régulier.', 'approved', now() - interval '18 days'),
  (gen_random_uuid(), 'c5ebca21-33c6-42c5-9143-9ce042174c40', 'service', 'c4444444-4444-4444-4444-444444444444', 4, 'Bons conseils nutritionnels adaptés à mon mode de vie. Je recommande.', 'approved', now() - interval '7 days');