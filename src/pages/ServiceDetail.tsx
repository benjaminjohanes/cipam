import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Clock, MapPin, Video, User, Star, Calendar, 
  CheckCircle, Shield, MessageCircle, Share2, Heart
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ServiceProvider {
  id: string;
  full_name: string | null;
  email?: string;
  avatar_url: string | null;
  specialty: string | null;
  bio?: string | null;
  experience_years?: number | null;
  consultation_rate: number | null;
  is_verified?: boolean | null;
  location?: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  status: string;
  category: {
    id: string;
    name: string;
  } | null;
  provider: ServiceProvider | null;
}

interface RelatedService {
  id: string;
  title: string;
  description: string | null;
  price: number;
  slug: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  provider: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    specialty: string | null;
    consultation_rate: number | null;
  };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;

      try {
        // Vérifier si c'est un UUID ou un slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        let query = supabase
          .from('services')
          .select(`
            *,
            category:categories(id, name),
            provider:profiles!services_provider_id_fkey(
              id, full_name, email, avatar_url, specialty, bio, 
              experience_years, consultation_rate, is_verified, location
            )
          `)
          .eq('status', 'approved');
        
        // Rechercher par UUID ou par slug
        if (isUuid) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }
        
        const { data, error } = await query.single();

        if (error) throw error;
        setService(data as Service);

        // Fetch related services from same category
        if (data?.category?.id) {
          const { data: related } = await supabase
            .from('services')
            .select(`
              *,
              category:categories(id, name),
              provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, specialty, consultation_rate)
            `)
            .eq('category_id', data.category.id)
            .eq('status', 'approved')
            .neq('id', data.id)
            .limit(3);

          if (related) setRelatedServices(related as RelatedService[]);
        }
      } catch (error: any) {
        console.error('Error fetching service:', error);
        toast({
          title: "Erreur",
          description: "Service non trouvé",
          variant: "destructive"
        });
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, navigate, toast]);

  // SEO Meta tags dynamiques
  useEffect(() => {
    if (service) {
      // Titre SEO optimisé (max 60 caractères)
      const seoTitle = `${service.title}${service.provider?.full_name ? ` - ${service.provider.full_name}` : ''} | CIPAM`;
      document.title = seoTitle.length > 60 ? `${service.title} | CIPAM` : seoTitle;

      // Meta description (max 160 caractères)
      const baseDescription = service.description || `Découvrez ${service.title} proposé par nos professionnels qualifiés.`;
      const seoDescription = baseDescription.length > 160 
        ? baseDescription.substring(0, 157) + '...' 
        : baseDescription;

      // Mettre à jour ou créer la meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', seoDescription);

      // Open Graph tags pour le partage social
      const updateOrCreateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateOrCreateMeta('og:title', service.title);
      updateOrCreateMeta('og:description', seoDescription);
      updateOrCreateMeta('og:type', 'product');
      updateOrCreateMeta('og:url', window.location.href);
      if (service.image_url) {
        updateOrCreateMeta('og:image', service.image_url);
      }

      // Twitter Card tags
      const updateOrCreateTwitterMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateOrCreateTwitterMeta('twitter:card', 'summary_large_image');
      updateOrCreateTwitterMeta('twitter:title', service.title);
      updateOrCreateTwitterMeta('twitter:description', seoDescription);
      if (service.image_url) {
        updateOrCreateTwitterMeta('twitter:image', service.image_url);
      }
    }

    // Cleanup: restaurer le titre par défaut au démontage
    return () => {
      document.title = 'CIPAM - Centre de Psychologie et de Bien-être';
    };
  }, [service]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: service?.title,
        text: service?.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papier"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="gap-2 pl-0 hover:pl-2 transition-all">
              <Link to="/services">
                <ArrowLeft className="w-4 h-4" />
                Retour aux services
              </Link>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Service Image */}
              {service.image_url && (
                <div className="relative rounded-2xl overflow-hidden aspect-video">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {service.category && (
                    <Badge className="absolute top-4 left-4">
                      {service.category.name}
                    </Badge>
                  )}
                </div>
              )}

              {/* Service Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {service.category && !service.image_url && (
                      <Badge className="mb-3">{service.category.name}</Badge>
                    )}
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                      {service.title}
                    </h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Consultation</span>
                  </div>
                  {service.provider?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{service.provider.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>Téléconsultation disponible</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-display font-semibold mb-4">Description du service</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {service.description || "Ce service vous accompagne dans votre parcours de bien-être mental. Notre approche personnalisée s'adapte à vos besoins spécifiques pour vous offrir un soutien optimal."}
                  </p>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-secondary/30 rounded-2xl p-6">
                <h2 className="text-xl font-display font-semibold mb-4">Ce service comprend</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Évaluation personnalisée",
                    "Plan d'accompagnement adapté",
                    "Suivi régulier",
                    "Support entre les séances",
                    "Ressources documentaires",
                    "Confidentialité garantie"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Section */}
              {service.provider && (
                <div>
                  <h2 className="text-xl font-display font-semibold mb-4">Proposé par</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={service.provider.avatar_url || undefined} />
                          <AvatarFallback className="text-lg">
                            {service.provider.full_name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {service.provider.full_name || 'Professionnel'}
                            </h3>
                            {service.provider.is_verified && (
                              <Shield className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <p className="text-muted-foreground">{service.provider.specialty || 'Psychologue'}</p>
                          
                          {service.provider.experience_years && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.provider.experience_years} ans d'expérience
                            </p>
                          )}
                          
                          {service.provider.bio && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                              {service.provider.bio}
                            </p>
                          )}
                          
                          <div className="flex gap-3 mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/professionnels/${service.provider.id}`}>
                                <User className="w-4 h-4 mr-2" />
                                Voir le profil
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Contacter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Reviews Section */}
              <ReviewSection
                targetType="service"
                targetId={service.id}
                title="Avis sur ce service"
              />
            </motion.div>

            {/* Sidebar - Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24">
                <Card className="shadow-medium">
                  <CardContent className="p-6 space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">par séance</p>
                    </div>

                    <Separator />

                    {/* Quick Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Durée estimée</span>
                        <span className="font-medium">1 heure</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Format</span>
                        <span className="font-medium">Cabinet / Vidéo</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Disponibilité</span>
                        <span className="font-medium text-green-600">Disponible</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Booking Button */}
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => setBookingOpen(true)}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Réserver ce service
                    </Button>

                    {/* Trust Badges */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-4 h-4 text-green-600" />
                        Paiement sécurisé
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Annulation gratuite 24h avant
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="w-4 h-4 text-green-600" />
                        Professionnel vérifié
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Card */}
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Des questions ? Contactez-nous
                    </p>
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Nous écrire
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Related Services */}
          {relatedServices.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-display font-bold mb-6">Services similaires</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedServices.map((related) => (
                  <Card key={related.id} className="overflow-hidden hover:shadow-medium transition-shadow">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-2">{related.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {related.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{formatPrice(related.price)}</span>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/services/${related.slug || related.id}`}>Voir</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </main>

      <Footer />

      {/* Booking Dialog */}
      {service.provider && (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          professional={{
            id: service.provider.id,
            full_name: service.provider.full_name,
            specialty: service.provider.specialty,
            avatar_url: service.provider.avatar_url,
            consultation_rate: service.price
          }}
        />
      )}
    </div>
  );
};

export default ServiceDetail;
