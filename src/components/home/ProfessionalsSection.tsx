import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const professionals = [
  {
    id: 1,
    name: "Dr. Aminata Diallo",
    specialty: "Psychologie Clinique",
    experience: "15 ans",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Emmanuel Kouassi",
    specialty: "Neuropsychologie",
    experience: "12 ans",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Fatou Mbaye",
    specialty: "Psychothérapie",
    experience: "10 ans",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Ousmane Traoré",
    specialty: "Psychologie du Travail",
    experience: "8 ans",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=400&h=400&fit=crop&crop=face",
  },
];

export function ProfessionalsSection() {
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
                  <img
                    src={pro.image}
                    alt={pro.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-1 text-secondary mb-2">
                      <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                      <span className="text-sm font-medium">{pro.rating}</span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-secondary">
                      {pro.name}
                    </h3>
                    <p className="text-secondary/80 text-sm">{pro.specialty}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{pro.experience} d'expérience</span>
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
