import { motion } from "framer-motion";
import { Star, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Professional {
  id: string;
  full_name: string | null;
  specialty: string | null;
  experience_years: number | null;
  avatar_url: string | null;
  is_verified: boolean | null;
}

export function ProfessionalsSection() {
  const { data: professionals, isLoading } = useQuery({
    queryKey: ["home-professionals"],
    queryFn: async () => {
      const { data: professionalRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "professional");

      if (!professionalRoles || professionalRoles.length === 0) {
        return [];
      }

      const professionalIds = professionalRoles.map(r => r.user_id);

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, specialty, experience_years, avatar_url, is_verified")
        .in("id", professionalIds)
        .limit(4);

      if (error) throw error;
      return profiles as Professional[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Notre Équipe</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
                Rencontrez nos experts
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="p-4">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!professionals || professionals.length === 0) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Notre Équipe</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Rencontrez nos experts
            </h2>
            <p className="text-muted-foreground mt-4">
              Aucun professionnel disponible pour le moment.
            </p>
            <Button variant="outline" asChild className="mt-8">
              <Link to="/professionnels">
                Voir tous les professionnels
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Notre Équipe</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Rencontrez nos experts
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Des professionnels qualifiés et passionnés, dédiés à votre accompagnement psychologique.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start md:self-auto">
            <Link to="/professionnels">
              Voir tous les professionnels
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionals.map((pro, index) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/professionnels/${pro.id}`}
                className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  {pro.avatar_url ? (
                    <img
                      src={pro.avatar_url}
                      alt={pro.full_name || "Professionnel"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <User className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    {pro.is_verified && (
                      <div className="flex items-center gap-1 text-secondary mb-2">
                        <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                        <span className="text-sm font-medium">Vérifié</span>
                      </div>
                    )}
                    <h3 className="text-lg font-display font-semibold text-secondary">
                      {pro.full_name || "Professionnel"}
                    </h3>
                    {pro.specialty && (
                      <p className="text-secondary/80 text-sm">{pro.specialty}</p>
                    )}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  {pro.experience_years ? (
                    <span className="text-sm text-muted-foreground">
                      {pro.experience_years} ans d'expérience
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Expert</span>
                  )}
                  <Button size="sm" variant="ghost" className="text-primary">
                    Voir profil
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
