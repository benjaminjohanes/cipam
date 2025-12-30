import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Users, Star, Play, Filter, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";
const formations = [
  {
    id: 1,
    title: "Gestion du Stress et de l'Anxiété",
    description: "Apprenez les techniques efficaces pour maîtriser votre stress au quotidien.",
    instructor: "Dr. Marie Konan",
    duration: "12 heures",
    modules: 8,
    students: 234,
    rating: 4.9,
    price: 150000,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
    category: "Développement Personnel",
    level: "Débutant",
    featured: true,
  },
  {
    id: 2,
    title: "Introduction à la Psychothérapie",
    description: "Découvrez les fondamentaux de la psychothérapie et ses différentes approches.",
    instructor: "Dr. Jean-Baptiste Kouassi",
    duration: "20 heures",
    modules: 12,
    students: 156,
    rating: 4.8,
    price: 250000,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    category: "Formation Professionnelle",
    level: "Intermédiaire",
    featured: false,
  },
  {
    id: 3,
    title: "Communication Non Violente",
    description: "Maîtrisez l'art de communiquer avec empathie et bienveillance.",
    instructor: "Dr. Aminata Diallo",
    duration: "8 heures",
    modules: 5,
    students: 312,
    rating: 4.7,
    price: 95000,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    category: "Relations",
    level: "Débutant",
    featured: false,
  },
  {
    id: 4,
    title: "Psychologie de l'Enfant",
    description: "Comprenez le développement psychologique de l'enfant de 0 à 12 ans.",
    instructor: "Dr. Fatou Traoré",
    duration: "16 heures",
    modules: 10,
    students: 189,
    rating: 4.9,
    price: 200000,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop",
    category: "Spécialisation",
    level: "Intermédiaire",
    featured: true,
  },
  {
    id: 5,
    title: "Prévention du Burnout",
    description: "Identifiez les signes et prévenez l'épuisement professionnel.",
    instructor: "Dr. Paul Mensah",
    duration: "6 heures",
    modules: 4,
    students: 421,
    rating: 4.8,
    price: 75000,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
    category: "Bien-être au Travail",
    level: "Débutant",
    featured: false,
  },
  {
    id: 6,
    title: "Techniques de Relaxation Avancées",
    description: "Maîtrisez les techniques de relaxation pour une meilleure qualité de vie.",
    instructor: "Dr. Marie Konan",
    duration: "10 heures",
    modules: 6,
    students: 267,
    rating: 4.6,
    price: 120000,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    category: "Développement Personnel",
    level: "Avancé",
    featured: false,
  },
];

const Formations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const { categories, loading: categoriesLoading } = useCategories('formation');
  
  // Track affiliate clicks from URL parameter
  useAffiliateTracking();

  const filteredFormations = formations.filter((formation) => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formation.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || formation.category === selectedCategory;
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
                      src={formation.image}
                      alt={formation.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-foreground/20 group-hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                      </div>
                    </div>
                    {formation.featured && (
                      <Badge className="absolute top-4 left-4 bg-cipam-gold text-foreground">
                        Populaire
                      </Badge>
                    )}
                    <Badge className="absolute top-4 right-4 bg-card/90 text-foreground">
                      {formation.level}
                    </Badge>
                  </div>

                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {formation.category}
                    </Badge>
                    <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {formation.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {formation.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Par {formation.instructor}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formation.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {formation.modules} modules
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                        {formation.rating}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(formation.price)}
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

      <Footer />
    </div>
  );
};

export default Formations;
