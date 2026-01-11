-- Insert test articles using existing professional users as authors
INSERT INTO articles (
  id, title, content, excerpt, image_url, status, published_at, category_id, author_id
) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Les bienfaits de la méditation sur la santé mentale',
  '## Introduction

La méditation est une pratique millénaire qui gagne en popularité dans notre société moderne. De plus en plus de recherches scientifiques confirment ses bienfaits sur la santé mentale et physique.

## Les effets sur le stress

La méditation aide à réduire le cortisol, l''hormone du stress. En pratiquant régulièrement, vous pouvez :

- Diminuer l''anxiété
- Améliorer la qualité du sommeil
- Renforcer la concentration

## Comment commencer ?

Commencez par des séances courtes de 5 à 10 minutes par jour. Trouvez un endroit calme, asseyez-vous confortablement et concentrez-vous sur votre respiration.

## Conclusion

La méditation est un outil puissant pour améliorer votre bien-être quotidien. N''hésitez pas à consulter un professionnel pour vous accompagner dans cette démarche.',
  'Découvrez comment la méditation peut transformer votre quotidien et améliorer votre santé mentale grâce à des techniques simples et accessibles.',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  'published',
  NOW() - INTERVAL '2 days',
  (SELECT id FROM categories WHERE type = 'article' AND is_active = true LIMIT 1),
  (SELECT id FROM profiles WHERE specialty IS NOT NULL LIMIT 1)
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Nutrition : 5 aliments pour booster votre énergie',
  '## L''importance d''une alimentation équilibrée

Une alimentation saine est la base d''une bonne santé. Certains aliments sont particulièrement efficaces pour maintenir votre niveau d''énergie tout au long de la journée.

## Les 5 superaliments énergétiques

### 1. Les amandes
Riches en magnésium et en vitamine E, les amandes sont parfaites pour une collation énergisante.

### 2. Les bananes
Source naturelle de sucres et de potassium, idéales avant l''effort.

### 3. Les épinards
Chargés en fer et en vitamines, ils combattent la fatigue.

### 4. Le quinoa
Protéines complètes et glucides complexes pour une énergie durable.

### 5. Les œufs
Excellente source de protéines et de vitamines B.

## Conseils pratiques

Intégrez ces aliments dans vos repas quotidiens pour une énergie stable et durable.',
  'Découvrez les 5 aliments essentiels pour maintenir votre énergie au top tout au long de la journée.',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  'published',
  NOW() - INTERVAL '5 days',
  (SELECT id FROM categories WHERE type = 'article' AND is_active = true LIMIT 1),
  (SELECT id FROM profiles WHERE specialty IS NOT NULL LIMIT 1)
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Yoga pour débutants : par où commencer ?',
  '## Le yoga, accessible à tous

Le yoga est une discipline qui peut être pratiquée à tout âge et quel que soit votre niveau de forme physique. Voici comment débuter sereinement.

## Les postures de base

### La posture de l''enfant (Balasana)
Idéale pour se détendre et étirer le dos.

### Le chien tête en bas (Adho Mukha Svanasana)
Renforce les bras et étire l''arrière des jambes.

### La posture du guerrier (Virabhadrasana)
Développe la force et l''équilibre.

## Conseils pour bien démarrer

- Pratiquez dans un espace calme
- Utilisez un tapis adapté
- Ne forcez jamais les postures
- Respectez vos limites
- Pratiquez régulièrement, même 15 minutes suffisent

## Trouver un cours adapté

N''hésitez pas à rejoindre un cours pour débutants avec un professeur qualifié qui pourra corriger vos postures.',
  'Guide complet pour débuter le yoga en toute sérénité avec les postures essentielles et les conseils pratiques.',
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800',
  'published',
  NOW() - INTERVAL '1 week',
  (SELECT id FROM categories WHERE type = 'article' AND is_active = true LIMIT 1),
  (SELECT id FROM profiles WHERE specialty IS NOT NULL OFFSET 1 LIMIT 1)
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Gérer son anxiété au quotidien',
  '## Comprendre l''anxiété

L''anxiété est une réaction normale face au stress, mais elle peut devenir problématique lorsqu''elle interfère avec la vie quotidienne.

## Techniques de gestion

### La respiration profonde
Inspirez pendant 4 secondes, retenez 4 secondes, expirez 4 secondes. Répétez 5 fois.

### L''ancrage sensoriel
Identifiez 5 choses que vous voyez, 4 que vous touchez, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez.

### L''activité physique
30 minutes de marche peuvent significativement réduire l''anxiété.

## Quand consulter ?

Si l''anxiété persiste et impacte votre qualité de vie, n''hésitez pas à consulter un professionnel de santé mentale.',
  'Apprenez des techniques efficaces pour gérer votre anxiété au quotidien et retrouver la sérénité.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  'published',
  NOW() - INTERVAL '3 days',
  (SELECT id FROM categories WHERE type = 'article' AND is_active = true LIMIT 1),
  (SELECT id FROM profiles WHERE specialty IS NOT NULL OFFSET 1 LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;