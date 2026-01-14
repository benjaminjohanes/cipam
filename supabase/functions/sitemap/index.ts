import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

const SITE_URL = 'https://cipam.lovable.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer tous les services approuvés
    const { data: services } = await supabase
      .from('services')
      .select('slug, id, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })

    // Récupérer toutes les formations publiées
    const { data: formations } = await supabase
      .from('formations')
      .select('id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    // Récupérer tous les articles publiés
    const { data: articles } = await supabase
      .from('articles')
      .select('id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    // Récupérer tous les événements publiés
    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    // Récupérer les professionnels vérifiés
    const { data: professionals } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('is_verified', true)

    const today = new Date().toISOString().split('T')[0]

    // Générer le XML du sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pages statiques -->
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

    // Ajouter les services
    if (services && services.length > 0) {
      sitemap += `  <!-- Services -->\n`
      for (const service of services) {
        const urlPath = service.slug || service.id
        const lastmod = service.updated_at ? service.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/services/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`
      }
    }

    // Ajouter les formations
    if (formations && formations.length > 0) {
      sitemap += `  <!-- Formations -->\n`
      for (const formation of formations) {
        const lastmod = formation.updated_at ? formation.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/formations/${formation.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`
      }
    }

    // Ajouter les articles
    if (articles && articles.length > 0) {
      sitemap += `  <!-- Articles -->\n`
      for (const article of articles) {
        const lastmod = article.updated_at ? article.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/articles/${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`
      }
    }

    // Ajouter les événements
    if (events && events.length > 0) {
      sitemap += `  <!-- Événements -->\n`
      for (const event of events) {
        const lastmod = event.updated_at ? event.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/evenements/${event.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`
      }
    }

    // Ajouter les professionnels
    if (professionals && professionals.length > 0) {
      sitemap += `  <!-- Professionnels -->\n`
      for (const pro of professionals) {
        const lastmod = pro.updated_at ? pro.updated_at.split('T')[0] : today
        sitemap += `  <url>
    <loc>${SITE_URL}/professionnels/${pro.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>\n`
      }
    }

    sitemap += `</urlset>`

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`, {
      headers: corsHeaders,
      status: 200,
    })
  }
})
