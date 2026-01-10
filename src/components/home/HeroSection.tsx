import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Star className="w-4 h-4 fill-primary" />
              Centre d'Excellence en Psychologie
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Votre <span className="text-gradient">bien-être mental</span> est notre priorité
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              ALLÔ PSY réunit les meilleurs professionnels de la psychologie pour vous accompagner 
              dans votre parcours vers l'équilibre et l'épanouissement personnel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group">
                <Link to="/professionnels">
                  Consulter un expert
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/formations">
                  <Play className="mr-2 w-5 h-5" />
                  Découvrir nos formations
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 border-t border-border">
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-primary">
                  <Users className="w-5 h-5" />
                  <span className="text-xl sm:text-2xl font-bold">50+</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Professionnels</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-primary">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-xl sm:text-2xl font-bold">100+</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Formations</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-primary">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xl sm:text-2xl font-bold">5000+</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Consultations</p>
              </div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
              <div className="absolute inset-8 rounded-full border-2 border-accent/20" />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm" />
              
              {/* Center element */}
              <div className="absolute inset-24 rounded-full gradient-hero flex items-center justify-center shadow-glow">
                <div className="text-center text-primary-foreground">
                  <div className="text-4xl font-display font-bold">ALLÔ PSY</div>
                  <div className="text-sm mt-1 opacity-90">Excellence & Bienveillance</div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-10 right-0 bg-card p-4 rounded-xl shadow-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">RDV Confirmé</div>
                    <div className="text-xs text-muted-foreground">Dr. Martin - 14h00</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-10 left-0 bg-card p-4 rounded-xl shadow-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Nouvelle Formation</div>
                    <div className="text-xs text-muted-foreground">Gestion du stress</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
