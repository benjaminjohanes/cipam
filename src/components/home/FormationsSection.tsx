import { motion } from "framer-motion";
import { Clock, ArrowRight, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Formation {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  modules_count: number | null;
  price: number;
  image_url: string | null;
  level: string;
  author?: {
    full_name: string | null;
  };
  category?: {
    name: string;
  };
}

export function FormationsSection() {
  const { data: formations, isLoading } = useQuery({
    queryKey: ["home-formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("id, title, description, duration, modules_count, price, image_url, level, author_id, category_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;

      const authorIds = [...new Set((data || []).map(f => f.author_id))];
      const categoryIds = [...new Set((data || []).filter(f => f.category_id).map(f => f.category_id))];

      const [authorsRes, categoriesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", authorIds),
        categoryIds.length > 0 
          ? supabase.from("categories").select("id, name").in("id", categoryIds)
          : Promise.resolve({ data: [] })
      ]);

      const authorsMap = new Map((authorsRes.data || []).map(a => [a.id, a]));
      const categoriesMap = new Map((categoriesRes.data || []).map(c => [c.id, c]));

      return (data || []).map(formation => ({
        ...formation,
        author: authorsMap.get(formation.author_id),
        category: formation.category_id ? categoriesMap.get(formation.category_id) : undefined
      })) as Formation[];
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-cipam-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Formations</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
                Développez vos compétences
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!formations || formations.length === 0) {
    return (
      <section className="py-24 bg-cipam-cream">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Formations</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Développez vos compétences
            </h2>
            <p className="text-muted-foreground mt-4">
              Aucune formation disponible pour le moment. Revenez bientôt !
            </p>
            <Button variant="outline" asChild className="mt-8">
              <Link to="/formations">
                Voir toutes les formations
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-cipam-cream">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Formations</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 text-foreground">
              Développez vos compétences
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Des formations en ligne et en présentiel dispensées par nos meilleurs experts.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start md:self-auto">
            <Link to="/formations">
              Toutes les formations
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((formation, index) => (
            <motion.div
              key={formation.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/formations/${formation.id}`}
                className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={formation.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop"}
                    alt={formation.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-card/90 text-foreground">
                    {formation.level}
                  </Badge>
                </div>

                <div className="p-6">
                  {formation.category && (
                    <Badge variant="secondary" className="mb-3">
                      {formation.category.name}
                    </Badge>
                  )}
                  <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {formation.title}
                  </h3>
                  {formation.author?.full_name && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Par {formation.author.full_name}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    {formation.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formation.duration}
                      </div>
                    )}
                    {formation.modules_count && formation.modules_count > 0 && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {formation.modules_count} modules
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <span className="text-xl font-bold text-primary">
                      {formation.price > 0 ? formatPrice(formation.price) : "Gratuit"}
                    </span>
                    <Button size="sm">
                      S'inscrire
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
