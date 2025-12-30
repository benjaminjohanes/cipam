import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/hooks/useEvents";
import { 
  Calendar, MapPin, Video, Users, Clock, 
  Ticket, ArrowRight, Sparkles 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  webinar: { label: "Webinaire", icon: <Video className="h-4 w-4" />, color: "bg-blue-500" },
  "in-person": { label: "Présentiel", icon: <MapPin className="h-4 w-4" />, color: "bg-green-500" },
  hybrid: { label: "Hybride", icon: <Users className="h-4 w-4" />, color: "bg-purple-500" },
  other: { label: "Autre", icon: <Sparkles className="h-4 w-4" />, color: "bg-orange-500" },
};

export default function Events() {
  const { events, isLoading } = useEvents();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                <Ticket className="h-4 w-4" />
                Événements & Webinaires
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Nos Événements
              </h1>
              <p className="text-lg text-muted-foreground">
                Participez à nos webinaires, conférences et ateliers en présentiel. 
                Réservez vos places pour des événements gratuits ou payants.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => {
                  const typeInfo = typeLabels[event.type] || typeLabels.other;
                  const spotsLeft = event.max_participants 
                    ? event.max_participants - (event.registrations_count || 0) 
                    : null;
                  const isFull = spotsLeft !== null && spotsLeft <= 0;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                          {event.image_url ? (
                            <img 
                              src={event.image_url} 
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Calendar className="h-16 w-16 text-primary/30" />
                            </div>
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <Badge className={`${typeInfo.color} text-white`}>
                              {typeInfo.icon}
                              <span className="ml-1">{typeInfo.label}</span>
                            </Badge>
                          </div>
                          
                          <div className="absolute top-4 right-4">
                            {event.is_free ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Gratuit
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {event.price.toLocaleString()} FCFA
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-6 flex-1 flex flex-col">
                          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                          
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {event.description}
                            </p>
                          )}

                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>
                                {format(new Date(event.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>
                                {format(new Date(event.start_date), "HH:mm", { locale: fr })}
                                {event.end_date && ` - ${format(new Date(event.end_date), "HH:mm", { locale: fr })}`}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            {spotsLeft !== null && (
                              <span className={`text-sm ${isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {isFull ? 'Complet' : `${spotsLeft} places restantes`}
                              </span>
                            )}
                            <Button asChild size="sm" className="ml-auto" disabled={isFull}>
                              <Link to={`/evenements/${event.id}`}>
                                Voir détails
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Aucun événement à venir
                </h3>
                <p className="text-muted-foreground">
                  Revenez bientôt pour découvrir nos prochains événements !
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}