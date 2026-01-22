import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, BookOpen, Users, Star, Award, CheckCircle, 
  Play, ArrowLeft, User, Calendar, Share2, Video, FileText
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { useFormations } from "@/hooks/useFormations";
import { useFormationModules, FormationModule } from "@/hooks/useFormationModules";
import { useAuth } from "@/hooks/useAuth";
import { useReviewStats } from "@/hooks/useReviewStats";
import { useMonerooPayment } from "@/hooks/useMonerooPayment";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

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
  const { formatPrice } = useCurrency();
  const { formations, loading } = useFormations();
  const { modules, fetchModulesByFormation, loading: modulesLoading } = useFormationModules();
  const { initiatePayment, isProcessing } = useMonerooPayment();
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const { stats: reviewStats } = useReviewStats('formation', id || '');

  const formation = formations.find(f => f.id === id);

  // Fetch modules when formation is loaded
  useEffect(() => {
    if (id) {
      fetchModulesByFormation(id);
    }
  }, [id]);

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
        "name": "Allô Psy",
        "url": "https://allopsy.lovable.app"
      },
      "instructor": author ? {
        "@type": "Person",
        "name": author.full_name || "Formateur",
        "jobTitle": author.specialty || "Expert en formation",
        "image": author.avatar_url || undefined
      } : undefined,
      "educationalLevel": formation.level || "Débutant",
      "courseCode": formation.id,
      "numberOfCredits": formation.modules_count || modules.length || 5,
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
  }, [formation, author, reviewStats, modules]);


  const formatModuleDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins} min`;
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour vous inscrire");
      return;
    }

    if (!formation) return;

    // Free formations - direct enrollment
    if (formation.price === 0) {
      toast.success("Inscription réussie ! Vous avez accès à cette formation.");
      return;
    }

    // Get user profile for payment
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const nameParts = (profile?.full_name || "Utilisateur").split(' ');
    const firstName = nameParts[0] || "Utilisateur";
    const lastName = nameParts.slice(1).join(' ') || "";

    await initiatePayment({
      amount: formation.price,
      currency: "XOF",
      description: `Inscription à la formation: ${formation.title}`,
      customer: {
        email: profile?.email || user.email || "",
        first_name: firstName,
        last_name: lastName,
      },
      metadata: {
        type: "formation",
        item_id: formation.id,
        user_id: user.id,
      },
      returnPath: `/formations/${formation.id}?payment=success`,
    });
  };

  // Get includes from formation
  const getIncludes = () => {
    const includes = [];
    if (formation?.includes_lifetime_access) includes.push("Accès illimité au contenu");
    if (formation?.includes_certificate) includes.push("Certificat de complétion");
    if (formation?.includes_resources) includes.push("Ressources téléchargeables");
    if (formation?.includes_community) includes.push("Support communauté");
    if (formation?.includes_updates) includes.push("Mises à jour gratuites");
    
    // Default includes if none are set
    if (includes.length === 0) {
      return [
        "Accès illimité au contenu",
        "Certificat de complétion",
        "Ressources téléchargeables",
        "Support communauté",
        "Mises à jour gratuites"
      ];
    }
    return includes;
  };

  // Get learning objectives
  const getLearningObjectives = () => {
    if (formation?.learning_objectives && formation.learning_objectives.length > 0) {
      return formation.learning_objectives;
    }
    // Default objectives if none are set
    return [
      "Comprendre les concepts fondamentaux",
      "Appliquer les techniques en pratique",
      "Analyser des cas concrets",
      "Développer vos compétences professionnelles",
      "Obtenir une certification reconnue",
      "Rejoindre une communauté d'apprenants"
    ];
  };

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
                    <span>{modules.length > 0 ? modules.length : (formation.modules_count || 0)} modules</span>
                  </div>
                  {reviewStats.totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                      <span>{reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} avis)</span>
                    </div>
                  )}
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
                        {formation.price === 0 ? "Gratuit" : formatPrice(formation.price)}
                      </div>
                      {formation.price > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">Accès à vie</p>
                      )}
                    </div>

                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={handleEnroll}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Redirection vers le paiement..." : "S'inscrire maintenant"}
                    </Button>

                    <Button variant="outline" className="w-full mb-6">
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager
                    </Button>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Cette formation inclut :</h4>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {getIncludes().map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            {item}
                          </li>
                        ))}
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
                    {modulesLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : modules.length > 0 ? (
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
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {module.content_type === 'video' ? (
                                    <Video className="w-3 h-3" />
                                  ) : (
                                    <FileText className="w-3 h-3" />
                                  )}
                                  <span>{formatModuleDuration(module.duration_minutes)}</span>
                                </div>
                              </div>
                            </div>
                            <Play className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Le contenu de cette formation sera bientôt disponible.
                      </p>
                    )}
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
                      {getLearningObjectives().map((item, index) => (
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
