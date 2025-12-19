import { motion } from "framer-motion";
import { Users, BookOpen, Calendar, MessageCircle, Brain, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Calendar,
    title: "Consultations",
    description: "Prenez rendez-vous avec nos psychologues certifiés pour un accompagnement personnalisé.",
    href: "/services",
    color: "from-primary to-accent",
  },
  {
    icon: BookOpen,
    title: "Formations",
    description: "Développez vos compétences avec nos programmes de formation en psychologie appliquée.",
    href: "/formations",
    color: "from-accent to-cipam-gold",
  },
  {
    icon: Users,
    title: "Supervision",
    description: "Accompagnement et supervision pour les professionnels et étudiants en psychologie.",
    href: "/services",
    color: "from-cipam-gold to-primary",
  },
  {
    icon: Brain,
    title: "Évaluations",
    description: "Tests psychométriques et bilans psychologiques par des experts qualifiés.",
    href: "/services",
    color: "from-primary to-cipam-teal-light",
  },
  {
    icon: Heart,
    title: "Thérapie de Couple",
    description: "Accompagnement spécialisé pour renforcer et harmoniser vos relations.",
    href: "/services",
    color: "from-accent to-primary",
  },
  {
    icon: MessageCircle,
    title: "Groupes de Parole",
    description: "Espaces d'échange et de soutien collectif encadrés par nos professionnels.",
    href: "/services",
    color: "from-cipam-gold to-accent",
  },
];

export function ServicesSection() {
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
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={service.href}
                className="block group h-full bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
