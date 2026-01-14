import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://cipam.lovable.app';
const SITE_NAME = 'ALLÔ PSY';
const DEFAULT_DESCRIPTION = 'ALLÔ PSY - Votre plateforme de bien-être mental. Consultations en ligne, formations professionnelles et accompagnement psychologique personnalisé.';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.jpg`;

interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Configuration SEO par route
const routeSEOConfig: Record<string, SEOConfig> = {
  '/': {
    title: 'Accueil',
    description: 'ALLÔ PSY - Votre plateforme de bien-être mental. Trouvez des professionnels qualifiés, des formations et des services de psychologie en ligne.',
    keywords: ['psychologie', 'bien-être', 'santé mentale', 'consultation en ligne', 'thérapie'],
  },
  '/services': {
    title: 'Nos Services',
    description: 'Découvrez notre gamme complète de services psychologiques : consultations individuelles, thérapie de couple, coaching de vie et plus encore.',
    keywords: ['services psychologiques', 'consultation', 'thérapie', 'coaching'],
  },
  '/formations': {
    title: 'Formations',
    description: 'Formations professionnelles en psychologie et développement personnel. Certifications reconnues et cours en ligne accessibles.',
    keywords: ['formation psychologie', 'certification', 'développement personnel', 'cours en ligne'],
  },
  '/professionnels': {
    title: 'Nos Professionnels',
    description: 'Rencontrez nos psychologues et thérapeutes certifiés. Des experts qualifiés pour vous accompagner dans votre parcours de bien-être.',
    keywords: ['psychologues', 'thérapeutes', 'professionnels santé mentale'],
  },
  '/articles': {
    title: 'Articles & Blog',
    description: 'Lisez nos articles sur la psychologie, le bien-être mental et le développement personnel. Conseils d\'experts et ressources gratuites.',
    keywords: ['blog psychologie', 'articles bien-être', 'conseils santé mentale'],
    type: 'website',
  },
  '/evenements': {
    title: 'Événements',
    description: 'Participez à nos événements, webinaires et ateliers sur la santé mentale et le développement personnel.',
    keywords: ['événements psychologie', 'webinaires', 'ateliers bien-être'],
  },
  '/faq': {
    title: 'FAQ',
    description: 'Questions fréquentes sur nos services, les consultations en ligne et notre plateforme ALLÔ PSY.',
    keywords: ['FAQ', 'questions fréquentes', 'aide'],
  },
  '/auth': {
    title: 'Connexion',
    description: 'Connectez-vous ou créez votre compte ALLÔ PSY pour accéder à nos services de bien-être mental.',
    noIndex: true,
  },
  '/dashboard': {
    title: 'Tableau de bord',
    description: 'Gérez votre compte, vos rendez-vous et vos formations sur ALLÔ PSY.',
    noIndex: true,
  },
};

export const useSEO = (config?: SEOConfig) => {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    // Récupérer la config par défaut pour cette route
    const routeConfig = routeSEOConfig[pathname] || {};
    const mergedConfig = { ...routeConfig, ...config };

    // Construire le titre
    const pageTitle = mergedConfig.title 
      ? `${mergedConfig.title} | ${SITE_NAME}`
      : SITE_NAME;
    document.title = pageTitle.length > 60 ? `${mergedConfig.title || SITE_NAME}` : pageTitle;

    // Meta description
    const description = mergedConfig.description || DEFAULT_DESCRIPTION;
    updateMeta('description', description.substring(0, 160));

    // Keywords
    if (mergedConfig.keywords?.length) {
      updateMeta('keywords', mergedConfig.keywords.join(', '));
    }

    // Author
    updateMeta('author', mergedConfig.author || SITE_NAME);

    // Robots
    if (mergedConfig.noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }

    // Canonical URL
    updateLink('canonical', `${SITE_URL}${pathname}`);

    // Open Graph
    updateMetaProperty('og:title', mergedConfig.title || SITE_NAME);
    updateMetaProperty('og:description', description.substring(0, 160));
    updateMetaProperty('og:type', mergedConfig.type || 'website');
    updateMetaProperty('og:url', `${SITE_URL}${pathname}`);
    updateMetaProperty('og:image', mergedConfig.image || DEFAULT_IMAGE);
    updateMetaProperty('og:site_name', SITE_NAME);
    updateMetaProperty('og:locale', 'fr_FR');

    // Article specific
    if (mergedConfig.type === 'article') {
      if (mergedConfig.publishedTime) {
        updateMetaProperty('article:published_time', mergedConfig.publishedTime);
      }
      if (mergedConfig.modifiedTime) {
        updateMetaProperty('article:modified_time', mergedConfig.modifiedTime);
      }
    }

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', mergedConfig.title || SITE_NAME);
    updateMeta('twitter:description', description.substring(0, 160));
    updateMeta('twitter:image', mergedConfig.image || DEFAULT_IMAGE);

    // Cleanup on unmount
    return () => {
      document.title = SITE_NAME;
    };
  }, [pathname, config]);
};

// Helper functions
function updateMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateMetaProperty(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateLink(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

export default useSEO;
