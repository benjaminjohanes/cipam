import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, BookOpen, Users, Star, Award, CheckCircle, 
  Play, ArrowLeft, User, Calendar, Share2 
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { useFormations } from "@/hooks/useFormations";
import { useAuth } from "@/hooks/useAuth";
import { useReviewStats } from "@/hooks/useReviewStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthorProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  specialty: string | null;
  bio: string | null;
}

const FormationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { formations, loading } = useFormations();
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { stats: reviewStats } = useReviewStats('formation', id || '');

  const formation = formations.find(f => f.id === id);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (formation?.author_id) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, specialty, bio')
          .eq('id', formation.author_id)
          .single();
        if (data) setAuthor(data);
      }
    };
    fetchAuthor();
  }, [formation?.author_id]);

  // JSON-LD Schema.org pour les formations avec vraies données d'avis
  useEffect(() => {
    if (!formation) return;

    const jsonLd: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": window.location.href,
      "name": formation.title,
      "description": formation.description || `Formation professionnelle: ${formation.title}`,
      "image": formation.image_url || undefined,
      "url": window.location.href,
      "provider": {
        "@type": "Organization",
        "name": "CIPAM",
        "url": "https://cipam.lovable.app"
      },
      "instructor": author ? {
        "@type": "Person",
        "name": author.full_name || "Formateur",
        "jobTitle": author.specialty || "Expert en formation",
        "image": author.avatar_url || undefined
      } : undefined,
      "educationalLevel": formation.level || "Débutant",
      "courseCode": formation.id,
      "numberOfCredits": formation.modules_count || 5,
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "duration": formation.duration || undefined
      },
      "offers": {
        "@type": "Offer",
        "price": formation.price,
        "priceCurrency": "XOF",
        "availability": "https://schema.org/InStock",
        "category": formation.categories?.name || "Formation professionnelle"
      },
      "inLanguage": "fr",
      "isAccessibleForFree": formation.price === 0
    };

    // Ajouter AggregateRating seulement si des avis existent
    if (reviewStats.totalReviews > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": reviewStats.averageRating.toFixed(1),
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": reviewStats.totalReviews
      };
    }

    let script = document.querySelector('script[data-schema="formation"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'formation');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    return () => {
      const existingScript = document.querySelector('script[data-schema="formation"]');
      if (existingScript) existingScript.remove();
    };
  }, [formation, author, reviewStats]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour vous inscrire");
      return;
    }
    
    setIsEnrolling(true);
    // TODO: Implement payment flow with Stripe
    toast.info("Le système de paiement sera bientôt disponible");
    setIsEnrolling(false);
  };

  // Simulated modules for display
  const modules = [
    { id: 1, title: "Introduction et fondamentaux", duration: "45 min", completed: false },
    { id: 2, title: "Concepts avancés", duration: "1h 30", completed: false },
    { id: 3, title: "Études de cas pratiques", duration: "2h", completed: false },
    { id: 4, title: "Exercices et mises en situation", duration: "1h 45", completed: false },
    { id: 5, title: "Évaluation et certification", duration: "30 min", completed: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Formation non trouvée</h1>
          <p className="text-muted-foreground mt-2">Cette formation n'existe pas ou n'est plus disponible.</p>
          <Link to="/formations">
            <Button className="mt-6">Voir toutes les formations</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 bg-cipam-cream">
        <div className="container mx-auto px-4">
          <Link to="/formations" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour aux formations
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{formation.categories?.name || 'Formation'}</Badge>
                  <Badge className="bg-cipam-gold text-foreground">{formation.level}</Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  {formation.title}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {formation.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formation.duration || 'Non spécifié'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{formation.modules_count || 5} modules</span>
                  </div>
                  {reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                      <span>{reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} avis)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>234 étudiants</span>
                  </div>
                </div>

                {/* Formation Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
                  <img
                    src={formation.image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop"}
                    alt={formation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                      <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Pricing Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="sticky top-24 shadow-medium">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-primary">
                        {formatPrice(formation.price)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Accès à vie</p>
                    </div>

                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? "Chargement..." : "S'inscrire maintenant"}
                    </Button>

                    <Button variant="outline" className="w-full mb-6">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Cette formation inclut :</h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          Accès illimité au contenu
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          Certificat de complétion
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          Ressources téléchargeables
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          Support communauté
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          Mises à jour gratuites
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {/* Modules Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Contenu de la formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <div 
                          key={module.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">{module.duration}</p>
                            </div>
                          </div>
                          <Play className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Ce que vous apprendrez
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        "Comprendre les concepts fondamentaux",
                        "Appliquer les techniques en pratique",
                        "Analyser des cas concrets",
                        "Développer vos compétences professionnelles",
                        "Obtenir une certification reconnue",
                        "Rejoindre une communauté d'apprenants"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Instructor */}
              {author && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Votre formateur
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <img
                          src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.full_name || 'Formateur'}&background=random`}
                          alt={author.full_name || 'Formateur'}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-lg text-foreground">
                            {author.full_name || 'Formateur'}
                          </h4>
                          <p className="text-sm text-primary mb-2">
                            {author.specialty || 'Expert en formation'}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {author.bio || 'Formateur expérimenté avec une passion pour l\'enseignement et le partage de connaissances.'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reviews */}
              <ReviewSection targetId={formation.id} targetType="formation" />
            </div>

            {/* Empty space for layout on large screens */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FormationDetail;
