import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEventDetail, useEvents, useUserRegistrationForEvent } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, MapPin, Video, Users, Clock, 
  Ticket, ArrowLeft, CheckCircle, User, Share2, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  webinar: { label: "Webinaire", icon: <Video className="h-5 w-5" /> },
  "in-person": { label: "Présentiel", icon: <MapPin className="h-5 w-5" /> },
  hybrid: { label: "Hybride", icon: <Users className="h-5 w-5" /> },
  other: { label: "Autre", icon: <Ticket className="h-5 w-5" /> },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading } = useEventDetail(id || "");
  const { data: registration } = useUserRegistrationForEvent(id || "");
  const { registerForEvent } = useEvents();

  const handleRegister = () => {
    if (!user) {
      navigate("/auth?mode=login");
      return;
    }
    if (event) {
      registerForEvent.mutate({ eventId: event.id, isFree: event.is_free });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div>
                <Skeleton className="h-80 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Événement non trouvé</h1>
            <p className="text-muted-foreground mb-6">Cet événement n'existe pas ou n'est plus disponible.</p>
            <Button asChild>
              <Link to="/evenements">Voir tous les événements</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const typeInfo = typeLabels[event.type] || typeLabels.other;
  const spotsLeft = event.max_participants 
    ? event.max_participants - (event.registrations_count || 0) 
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const isRegistered = !!registration;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Link 
            to="/evenements" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Image */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-24 w-24 text-primary/30" />
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-primary text-primary-foreground">
                    {typeInfo.icon}
                    <span className="ml-1">{typeInfo.label}</span>
                  </Badge>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-lg text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations pratiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horaires</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.start_date), "HH:mm", { locale: fr })}
                        {event.end_date && ` - ${format(new Date(event.end_date), "HH:mm", { locale: fr })}`}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.type === "webinar" && (
                    <div className="flex items-start gap-3">
                      <Video className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Format</p>
                        <p className="text-muted-foreground">
                          Événement en ligne - Le lien vous sera envoyé après inscription
                        </p>
                      </div>
                    </div>
                  )}

                  {event.max_participants && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Capacité</p>
                        <p className="text-muted-foreground">
                          {event.registrations_count || 0} / {event.max_participants} participants
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizer */}
              {event.organizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organisateur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={event.organizer.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {event.organizer.full_name || "Organisateur"}
                        </p>
                        {(event.organizer as any).specialty && (
                          <p className="text-sm text-muted-foreground">
                            {(event.organizer as any).specialty}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Sidebar - Registration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    {event.is_free ? (
                      <div className="text-3xl font-bold text-green-600">Gratuit</div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-foreground">
                          {event.price.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground"> FCFA</span>
                      </div>
                    )}
                  </div>

                  {/* Spots Left */}
                  {spotsLeft !== null && (
                    <div className={`text-center p-3 rounded-lg ${isFull ? 'bg-destructive/10 text-destructive' : 'bg-muted'}`}>
                      {isFull ? (
                        <p className="font-medium">Événement complet</p>
                      ) : (
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">{spotsLeft}</span> places restantes
                        </p>
                      )}
                    </div>
                  )}

                  {/* Registration Button */}
                  {isRegistered ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Vous êtes inscrit</span>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Numéro de ticket</p>
                        <p className="font-mono font-semibold">{registration.ticket_number}</p>
                      </div>
                      {event.online_link && registration.status === "confirmed" && (
                        <Button className="w-full" asChild>
                          <a href={event.online_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Rejoindre l'événement
                          </a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleRegister}
                      disabled={isFull || registerForEvent.isPending}
                    >
                      <Ticket className="h-5 w-5 mr-2" />
                      {registerForEvent.isPending 
                        ? "Inscription..." 
                        : event.is_free 
                          ? "S'inscrire gratuitement" 
                          : "Réserver ma place"
                      }
                    </Button>
                  )}

                  {/* Share */}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigator.share?.({ 
                      title: event.title, 
                      url: window.location.href 
                    })}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}