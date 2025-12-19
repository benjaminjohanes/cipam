import { motion } from "framer-motion";
import { Calendar, Video, MapPin, Clock, Users, MessageCircle, Brain, Heart, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const services = [
  {
    id: 1,
    title: "Consultation Individuelle",
    description: "Séances personnalisées avec un psychologue pour traiter vos préoccupations spécifiques.",
    icon: Brain,
    price: 25000,
    duration: "1 heure",
    formats: ["En cabinet", "Téléconsultation"],
    color: "from-primary to-accent",
  },
  {
    id: 2,
    title: "Thérapie de Couple",
    description: "Accompagnement spécialisé pour améliorer votre communication et renforcer votre relation.",
    icon: Heart,
    price: 35000,
    duration: "1h30",
    formats: ["En cabinet"],
    color: "from-accent to-cipam-gold",
  },
  {
    id: 3,
    title: "Bilan Psychologique",
    description: "Évaluation complète avec tests psychométriques et rapport détaillé.",
    icon: Brain,
    price: 75000,
    duration: "3 heures",
    formats: ["En cabinet"],
    color: "from-cipam-gold to-primary",
  },
  {
    id: 4,
    title: "Groupe de Parole",
    description: "Espaces d'échange et de soutien collectif encadrés par un professionnel.",
    icon: Users,
    price: 10000,
    duration: "2 heures",
    formats: ["En présentiel"],
    color: "from-primary to-cipam-teal-light",
  },
  {
    id: 5,
    title: "Supervision Clinique",
    description: "Accompagnement pour les professionnels et étudiants en psychologie.",
    icon: MessageCircle,
    price: 30000,
    duration: "1h30",
    formats: ["En cabinet", "Téléconsultation"],
    color: "from-accent to-primary",
  },
  {
    id: 6,
    title: "Téléconsultation",
    description: "Consultations à distance via vidéoconférence sécurisée.",
    icon: Video,
    price: 20000,
    duration: "45 min",
    formats: ["En ligne"],
    color: "from-cipam-gold to-accent",
  },
];

const Services = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

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
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5`}>
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-display font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                  {service.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {service.formats.map((format) => (
                    <Badge key={format} variant="secondary" className="text-xs">
                      {format}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(service.price)}
                  </span>
                  <Button size="sm" asChild>
                    <Link to="/professionnels">
                      Réserver
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
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
