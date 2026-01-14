import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Play, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import useSEO from "@/hooks/useSEO";

interface Formation {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  modules_count: number | null;
  price: number;
  image_url: string | null;
  level: string;
  author_id: string;
  category_id: string | null;
  author?: {
    full_name: string | null;
  };
  category?: {
    name: string;
  };
}

const Formations = () => {
  useSEO();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { categories, loading: categoriesLoading } = useCategories('formation');
  
  useAffiliateTracking();

  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("id, title, description, duration, modules_count, price, image_url, level, author_id, category_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

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

  const filteredFormations = (formations || []).filter((formation) => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (formation.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = selectedCategory === "Tous" || formation.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const categoryNames = ["Tous", ...categories.filter(c => c.is_active).map(c => c.name)];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-cipam-cream">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Nos Formations
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Développez vos compétences avec nos formations en psychologie appliquée
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-4">
              {categoriesLoading ? (
                <div className="text-muted-foreground text-sm">Chargement des catégories...</div>
              ) : (
                categoryNames.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Formations List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredFormations.length}</span> formations disponibles
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFormations.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune formation trouvée
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucune formation n'est disponible pour le moment"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFormations.map((formation, index) => (
                <motion.div
                  key={formation.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {formation.title}
                      </h3>
                      {formation.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {formation.description}
                        </p>
                      )}
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Formations;
