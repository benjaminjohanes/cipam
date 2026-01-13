import { motion } from "framer-motion";
import { Users, BookOpen, Calendar, MessageCircle, Brain, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  slug: string | null;
}

const iconColors = [
  "from-primary to-accent",
  "from-accent to-cipam-gold",
  "from-cipam-gold to-primary",
  "from-primary to-cipam-teal-light",
  "from-accent to-primary",
  "from-cipam-gold to-accent",
];

const defaultIcons = [Calendar, BookOpen, Users, Brain, Heart, MessageCircle];

export function ServicesSection() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["home-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, title, description, price, image_url, slug")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Service[];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Nos Services</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Des solutions adaptées à vos besoins
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6">
                <Skeleton className="w-14 h-14 rounded-xl mb-5" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return (
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Nos Services</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Des solutions adaptées à vos besoins
            </h2>
            <p className="text-muted-foreground mt-4">
              Aucun service disponible pour le moment. Revenez bientôt !
            </p>
            <Button variant="outline" asChild className="mt-8">
              <Link to="/services">Voir tous les services</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Nos Services</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
            Des solutions adaptées à vos besoins
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Découvrez notre gamme complète de services psychologiques, conçus pour vous accompagner 
            à chaque étape de votre parcours vers le bien-être.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = defaultIcons[index % defaultIcons.length];
            const colorClass = iconColors[index % iconColors.length];
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/services/${service.slug || service.id}`}
                  className="block group h-full bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-lg font-bold text-primary">
                      {service.price > 0 ? formatPrice(service.price) : "Gratuit"}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
