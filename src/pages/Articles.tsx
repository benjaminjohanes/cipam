import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  author_id: string;
  category_id: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  author?: {
    full_name: string | null;
    email: string;
  };
  category?: {
    name: string;
  };
}

const usePublishedArticles = () => {
  return useQuery({
    queryKey: ["published-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Fetch authors separately
      const authorIds = [...new Set((data || []).map((a: any) => a.author_id))];
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", authorIds);

      const authorsMap = new Map((authors || []).map(a => [a.id, a]));

      // Fetch categories
      const categoryIds = [...new Set((data || []).filter((a: any) => a.category_id).map((a: any) => a.category_id))];
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", categoryIds);

      const categoriesMap = new Map((categories || []).map(c => [c.id, c]));

      return (data || []).map((article: any) => ({
        ...article,
        author: authorsMap.get(article.author_id),
        category: article.category_id ? categoriesMap.get(article.category_id) : null,
      })) as Article[];
    },
  });
};

// Helper to estimate read time
const getReadTime = (content: string | null): string => {
  if (!content) return "2 min";
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
};

const ArticleSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden shadow-soft h-full">
    <Skeleton className="aspect-video w-full" />
    <div className="p-6 space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  </div>
);

const Articles = () => {
  const { data: articles, isLoading } = usePublishedArticles();

  const featuredArticle = articles?.[0];
  const otherArticles = articles?.slice(1) || [];

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
              Articles & Actualités
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Conseils, insights et actualités du monde de la psychologie
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      {isLoading ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
              <div className="grid md:grid-cols-2 gap-0">
                <Skeleton className="aspect-video md:aspect-auto md:h-96" />
                <div className="p-8 md:p-12 space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-36 mt-4" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : featuredArticle ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link
                to={`/articles/${featuredArticle.id}`}
                className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto relative overflow-hidden">
                    <img
                      src={featuredArticle.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop"}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 left-4 bg-cipam-gold text-foreground">
                      À la une
                    </Badge>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    {featuredArticle.category && (
                      <Badge variant="secondary" className="self-start mb-4">
                        {featuredArticle.category.name}
                      </Badge>
                    )}
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mt-4 leading-relaxed">
                      {featuredArticle.excerpt || featuredArticle.content?.substring(0, 200) + "..."}
                    </p>
                    <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {featuredArticle.author?.full_name || "Auteur"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {featuredArticle.published_at 
                          ? format(new Date(featuredArticle.published_at), "d MMM yyyy", { locale: fr })
                          : "Récent"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {getReadTime(featuredArticle.content)}
                      </div>
                    </div>
                    <Button className="self-start mt-8 group/btn">
                      Lire l'article
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      ) : null}

      {/* Articles Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ArticleSkeleton key={i} />
              ))}
            </div>
          ) : otherArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/articles/${article.id}`}
                    className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 h-full"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={article.image_url || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6">
                      {article.category && (
                        <Badge variant="secondary" className="mb-3">
                          {article.category.name}
                        </Badge>
                      )}
                      <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {article.excerpt || article.content?.substring(0, 100) + "..."}
                      </p>

                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {article.author?.full_name || "Auteur"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getReadTime(article.content)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : !featuredArticle ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun article publié pour le moment.</p>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Articles;
