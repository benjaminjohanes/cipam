import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

const SITE_URL = 'https://cipam.fatjo.app'

// Helper pour formater la date
const formatDate = (date: string | null): string => {
  if (!date) return new Date().toISOString().split('T')[0]
  return date.split('T')[0]
}

// Helper pour échapper les caractères XML
const escapeXml = (str: string | null): string => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Generating sitemap...')

    // Récupérer toutes les données en parallèle pour de meilleures performances
    const [
      servicesResult,
      formationsResult,
      articlesResult,
      eventsResult,
      professionalsResult
    ] = await Promise.all([
      // Services approuvés avec catégorie
      supabase
        .from('services')
        .select('slug, id, title, image_url, updated_at, category:categories(name)')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false }),
      
      // Formations publiées avec catégorie et auteur
      supabase
        .from('formations')
        .select('id, title, image_url, updated_at, category:categories(name), author:profiles(full_name)')
        .eq('status', 'published')
        .order('updated_at', { ascending: false }),
      
      // Articles publiés avec catégorie
      supabase
        .from('articles')
        .select('id, title, image_url, updated_at, category:categories(name)')
        .eq('status', 'published')
        .order('updated_at', { ascending: false }),
      
      // Événements publiés
      supabase
        .from('events')
        .select('id, title, image_url, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false }),
      
      // Professionnels vérifiés avec spécialité
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, specialty, updated_at')
        .eq('is_verified', true)
        .order('updated_at', { ascending: false })
    ])

    const services = servicesResult.data || []
    const formations = formationsResult.data || []
    const articles = articlesResult.data || []
    const events = eventsResult.data || []
    const professionals = professionalsResult.data || []

    console.log(`Found: ${services.length} services, ${formations.length} formations, ${articles.length} articles, ${events.length} events, ${professionals.length} professionals`)

    const today = new Date().toISOString().split('T')[0]

    // Générer le XML du sitemap avec support des images
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Pages statiques principales -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/formations</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/professionnels</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/articles</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/evenements</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`

    // Ajouter les services avec images
    if (services.length > 0) {
      sitemap += `  <!-- Services (${services.length}) -->\n`
      for (const service of services) {
        const urlPath = service.slug || service.id
        const lastmod = formatDate(service.updated_at)
        const categoryName = (service.category as any)?.name || 'Service'
        
        sitemap += `  <url>
    <loc>${SITE_URL}/services/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`
        
        // Ajouter l'image si disponible
        if (service.image_url) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(service.image_url)}</image:loc>
      <image:title>${escapeXml(service.title)} - ${escapeXml(categoryName)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>\n`
      }
    }

    // Ajouter les formations avec images
    if (formations.length > 0) {
      sitemap += `  <!-- Formations (${formations.length}) -->\n`
      for (const formation of formations) {
        const lastmod = formatDate(formation.updated_at)
        const authorName = (formation.author as any)?.full_name || 'CIPAM'
        
        sitemap += `  <url>
    <loc>${SITE_URL}/formations/${formation.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`
        
        if (formation.image_url) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(formation.image_url)}</image:loc>
      <image:title>${escapeXml(formation.title)} par ${escapeXml(authorName)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>\n`
      }
    }

    // Ajouter les professionnels avec photos
    if (professionals.length > 0) {
      sitemap += `  <!-- Professionnels (${professionals.length}) -->\n`
      for (const pro of professionals) {
        const lastmod = formatDate(pro.updated_at)
        const specialty = pro.specialty || 'Psychologue'
        
        sitemap += `  <url>
    <loc>${SITE_URL}/professionnels/${pro.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>`
        
        if (pro.avatar_url) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(pro.avatar_url)}</image:loc>
      <image:title>${escapeXml(pro.full_name || 'Professionnel')} - ${escapeXml(specialty)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>\n`
      }
    }

    // Ajouter les articles avec images
    if (articles.length > 0) {
      sitemap += `  <!-- Articles (${articles.length}) -->\n`
      for (const article of articles) {
        const lastmod = formatDate(article.updated_at)
        
        sitemap += `  <url>
    <loc>${SITE_URL}/articles/${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>`
        
        if (article.image_url) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(article.image_url)}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>\n`
      }
    }

    // Ajouter les événements avec images
    if (events.length > 0) {
      sitemap += `  <!-- Événements (${events.length}) -->\n`
      for (const event of events) {
        const lastmod = formatDate(event.updated_at)
        
        sitemap += `  <url>
    <loc>${SITE_URL}/evenements/${event.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>`
        
        if (event.image_url) {
          sitemap += `
    <image:image>
      <image:loc>${escapeXml(event.image_url)}</image:loc>
      <image:title>${escapeXml(event.title)}</image:title>
    </image:image>`
        }
        
        sitemap += `
  </url>\n`
      }
    }

    sitemap += `</urlset>`

    const totalUrls = 7 + services.length + formations.length + professionals.length + articles.length + events.length
    console.log(`Sitemap generated successfully with ${totalUrls} URLs`)

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Retourner un sitemap minimal en cas d'erreur
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/services</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/formations</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/professionnels</loc>
    <priority>0.9</priority>
  </url>
</urlset>`
    
    return new Response(fallbackSitemap, {
      headers: corsHeaders,
      status: 200,
    })
  }
})
