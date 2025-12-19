import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const articles = [
  {
    id: 1,
    title: "Comment gérer l'anxiété au quotidien : 5 techniques efficaces",
    excerpt: "L'anxiété peut être paralysante, mais il existe des stratégies simples pour reprendre le contrôle de vos émotions.",
    author: "Dr. Marie Konan",
    date: "15 Dec 2024",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop",
    category: "Bien-être",
    featured: true,
  },
  {
    id: 2,
    title: "Les bienfaits de la thérapie de couple",
    excerpt: "Découvrez comment la thérapie peut transformer votre relation et renforcer votre lien conjugal.",
    author: "Dr. Aminata Diallo",
    date: "12 Dec 2024",
    readTime: "7 min",
    image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=500&fit=crop",
    category: "Relations",
    featured: false,
  },
  {
    id: 3,
    title: "Comprendre le burnout : signes et prévention",
    excerpt: "Le burnout touche de plus en plus de professionnels. Apprenez à reconnaître les signes avant-coureurs.",
    author: "Dr. Paul Mensah",
    date: "10 Dec 2024",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=500&fit=crop",
    category: "Travail",
    featured: true,
  },
  {
    id: 4,
    title: "L'importance du sommeil pour la santé mentale",
    excerpt: "Un sommeil de qualité est essentiel pour maintenir un bon équilibre psychologique.",
    author: "Dr. Jean-Baptiste Kouassi",
    date: "8 Dec 2024",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=500&fit=crop",
    category: "Santé",
    featured: false,
  },
  {
    id: 5,
    title: "Comment parler de santé mentale avec ses enfants",
    excerpt: "Guide pratique pour aborder les émotions et le bien-être psychologique avec les plus jeunes.",
    author: "Dr. Fatou Traoré",
    date: "5 Dec 2024",
    readTime: "8 min",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=500&fit=crop",
    category: "Famille",
    featured: false,
  },
  {
    id: 6,
    title: "Méditation et pleine conscience : par où commencer ?",
    excerpt: "Introduction aux pratiques de méditation pour améliorer votre bien-être au quotidien.",
    author: "Dr. Marie Konan",
    date: "1 Dec 2024",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop",
    category: "Bien-être",
    featured: false,
  },
];

const Articles = () => {
  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

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
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-cipam-gold text-foreground">
                    À la une
                  </Badge>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <Badge variant="secondary" className="self-start mb-4">
                    {featuredArticle.category}
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredArticle.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {featuredArticle.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredArticle.readTime}
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

      {/* Articles Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
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
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {article.category}
                    </Badge>
                    <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Articles;
