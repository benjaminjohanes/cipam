import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Briefcase } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import useSEO from "@/hooks/useSEO";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  provider_id: string;
  category_id: string | null;
  slug: string | null;
  provider?: {
    full_name: string | null;
  };
  category?: {
    name: string;
  };
}

const Services = () => {
  useSEO();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { categories, loading: categoriesLoading } = useCategories('service');

  const { data: services, isLoading } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, title, description, price, image_url, provider_id, category_id, slug")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const providerIds = [...new Set((data || []).map(s => s.provider_id))];
      const categoryIds = [...new Set((data || []).filter(s => s.category_id).map(s => s.category_id))];

      const [providersRes, categoriesRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").in("id", providerIds),
        categoryIds.length > 0 
          ? supabase.from("categories").select("id, name").in("id", categoryIds)
          : Promise.resolve({ data: [] })
      ]);

      const providersMap = new Map((providersRes.data || []).map(p => [p.id, p]));
      const categoriesMap = new Map((categoriesRes.data || []).map(c => [c.id, c]));

      return (data || []).map(service => ({
        ...service,
        provider: providersMap.get(service.provider_id),
        category: service.category_id ? categoriesMap.get(service.category_id) : undefined
      })) as Service[];
    },
  });


  const categoryNames = ["Tous", ...categories.filter(c => c.is_active).map(c => c.name)];

  const filteredServices = (services || []).filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = selectedCategory === "Tous" || service.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Nos Services
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Des solutions adaptées à chaque besoin pour votre bien-être mental
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
                  placeholder="Rechercher un service..."
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

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredServices.length}</span> services disponibles
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6">
                  <Skeleton className="w-14 h-14 rounded-xl mb-5" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-1" />
                  <Skeleton className="h-10 w-full mt-6" />
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun service trouvé
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "Tous"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucun service n'est disponible pour le moment"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                >
                  {service.image_url && (
                    <div className="aspect-video rounded-xl overflow-hidden mb-5">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {service.title}
                  </h3>
                  {service.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {service.category && (
                      <Badge variant="secondary" className="text-xs">
                        {service.category.name}
                      </Badge>
                    )}
                  </div>

                  {service.provider?.full_name && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Par {service.provider.full_name}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <span className="text-xl font-bold text-primary">
                      {service.price > 0 ? formatPrice(service.price) : "Gratuit"}
                    </span>
                    <Button size="sm" asChild>
                      <Link to={`/services/${service.slug || service.id}`}>
                        Voir détails
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cipam-cream">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-display font-bold text-foreground">
              Besoin d'aide pour choisir ?
            </h2>
            <p className="text-muted-foreground mt-4">
              Nos conseillers sont disponibles pour vous orienter vers le service le plus adapté à vos besoins.
            </p>
            <Button size="lg" className="mt-8">
              Nous contacter
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
