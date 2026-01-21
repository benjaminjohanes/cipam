import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Award,
  MessageCircle,
  Phone,
  Mail,
  CheckCircle,
  Briefcase
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { useReviewStats } from "@/hooks/useReviewStats";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Professional {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  specialty: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  experience_years: number | null;
  created_at: string | null;
  location: string | null;
  consultation_rate: number | null;
  availability: string | null;
}

const ProfessionalDetail = () => {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { stats: reviewStats } = useReviewStats('professional', id || '');

  useEffect(() => {
    const fetchProfessional = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching professional:", error);
      } else {
        setProfessional(data);
      }
      setLoading(false);
    };

    fetchProfessional();
  }, [id]);

  // JSON-LD Schema.org pour SEO avec vraies données d'avis
  useEffect(() => {
    if (!professional) return;

    const jsonLd: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": window.location.href,
      "name": professional.full_name || "Professionnel",
      "jobTitle": professional.specialty || "Psychologue",
      "description": professional.bio || undefined,
      "image": professional.avatar_url || undefined,
      "email": professional.email,
      "telephone": professional.phone || undefined,
      "address": professional.location ? {
        "@type": "PostalAddress",
        "addressLocality": professional.location
      } : undefined,
      "worksFor": {
        "@type": "Organization",
        "name": "CIPAM",
        "url": "https://cipam.lovable.app"
      },
      "memberOf": {
        "@type": "Organization",
        "name": "CIPAM - Centre de Psychologie et de Bien-être"
      },
      "knowsAbout": professional.specialty || undefined,
      "hasCredential": professional.is_verified ? {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "Certification professionnelle",
        "name": "Membre certifié CIPAM"
      } : undefined
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

    // Créer ou mettre à jour le script JSON-LD
    let script = document.querySelector('script[data-schema="professional"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-schema', 'professional');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    // Cleanup au démontage
    return () => {
      const existingScript = document.querySelector('script[data-schema="professional"]');
      if (existingScript) existingScript.remove();
    };
  }, [professional, reviewStats]);


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Professionnel non trouvé</h1>
            <p className="text-muted-foreground mb-8">Le profil que vous recherchez n'existe pas.</p>
            <Button asChild>
              <Link to="/professionnels">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux professionnels
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back button */}
      <div className="container mx-auto px-4 pt-28">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/professionnels">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux professionnels
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative">
                    <img
                      src={professional.avatar_url || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face"}
                      alt={professional.full_name || "Professionnel"}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover"
                    />
                    {professional.is_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                        {professional.full_name || "Nom non renseigné"}
                      </h1>
                      {professional.is_verified && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                    
                    {professional.specialty && (
                      <p className="text-primary text-lg font-medium mb-4">
                        {professional.specialty}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {professional.experience_years && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{professional.experience_years} ans d'expérience</span>
                        </div>
                      )}
                      {professional.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{professional.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Membre depuis {new Date(professional.created_at || '').getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bio */}
              {professional.bio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-8"
                >
                  <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                    À propos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {professional.bio}
                  </p>
                </motion.div>
              )}

              {/* Expertise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                  Domaines d'expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {professional.specialty ? (
                    <Badge variant="secondary" className="text-sm py-2 px-4">
                      {professional.specialty}
                    </Badge>
                  ) : (
                    <p className="text-muted-foreground">Aucune spécialité renseignée</p>
                  )}
                </div>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <ReviewSection
                  targetType="professional"
                  targetId={professional.id}
                  title="Avis des patients"
                />
              </motion.div>
            </div>

            {/* Right Column - Contact & Booking */}
            <div className="space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg font-display">Prendre rendez-vous</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {professional.consultation_rate && professional.consultation_rate > 0 && (
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(professional.consultation_rate)}
                        </p>
                        <p className="text-xs text-muted-foreground">par consultation</p>
                      </div>
                    )}
                    
                    {professional.availability && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Disponibilités</p>
                          <p className="text-sm text-muted-foreground">{professional.availability}</p>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={() => setBookingOpen(true)}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Réserver une consultation
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Envoyer un message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg font-display">Coordonnées</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{professional.email}</span>
                    </div>
                    {professional.phone && (
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="w-5 h-5" />
                        <span className="text-sm">{professional.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Certifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg font-display">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Award className="w-5 h-5 text-cipam-gold" />
                      <span className="text-sm">Membre certifié CIPAM</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        professional={professional}
      />
    </div>
  );
};

export default ProfessionalDetail;
