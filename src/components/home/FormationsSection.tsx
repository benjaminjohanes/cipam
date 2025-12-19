import { motion } from "framer-motion";
import { Clock, Users, Star, ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const formations = [
  {
    id: 1,
    title: "Gestion du Stress et de l'Anxiété",
    instructor: "Dr. Marie Konan",
    duration: "12 heures",
    students: 234,
    rating: 4.9,
    price: 150000,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
    category: "Développement Personnel",
    featured: true,
  },
  {
    id: 2,
    title: "Introduction à la Psychothérapie",
    instructor: "Dr. Jean-Baptiste Kouassi",
    duration: "20 heures",
    students: 156,
    rating: 4.8,
    price: 250000,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
    category: "Formation Professionnelle",
    featured: false,
  },
  {
    id: 3,
    title: "Communication Non Violente",
    instructor: "Dr. Aminata Diallo",
    duration: "8 heures",
    students: 312,
    rating: 4.7,
    price: 95000,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop",
    category: "Relations",
    featured: false,
  },
];

export function FormationsSection() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

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
                </div>

                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {formation.category}
                  </Badge>
                  <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {formation.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Par {formation.instructor}
                  </p>

                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formation.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formation.students}
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
  );
}
