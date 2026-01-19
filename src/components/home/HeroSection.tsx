import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Star, Users, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";
import logo from "@/assets/logo.jpeg";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        className="absolute inset-0 gradient-hero opacity-5" 
        style={{ y: backgroundY }}
      />
      <motion.div 
        className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        style={{ y: backgroundY }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        style={{ y: backgroundY }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          style={{ opacity: contentOpacity }}
        >
          {/* Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium"
            >
              <Star className="w-4 h-4 fill-accent" />
              Centre d'Excellence en Psychologie
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight"
            >
              Vous méritez d'être <span className="text-gradient">écouté et soutenu</span>, sans jugement
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              ALLÔ PSY réunit les meilleurs professionnels de la psychologie pour vous accompagner 
              dans votre parcours vers l'équilibre et l'épanouissement personnel.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
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
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 border-t border-border"
            >
              {[
                { icon: Users, value: "50+", label: "Professionnels" },
                { icon: BookOpen, value: "100+", label: "Formations" },
                { icon: Calendar, value: "5000+", label: "Consultations" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-accent">
                    <stat.icon className="w-5 h-5" />
                    <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Decorative circles with subtle animation */}
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary/20"
                animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute inset-8 rounded-full border-2 border-accent/20"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm" />
              
              {/* Center element with logo */}
              <motion.div 
                className="absolute inset-24 rounded-full bg-white flex items-center justify-center shadow-glow overflow-hidden"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={logo} alt="ALLÔ PSY" className="w-full h-full object-contain p-4" />
              </motion.div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 0.8 },
                  x: { duration: 0.6, delay: 0.8 },
                  y: { duration: 4, repeat: Infinity, delay: 1 }
                }}
                className="absolute top-10 right-0 bg-card p-4 rounded-xl shadow-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">RDV Confirmé</div>
                    <div className="text-xs text-muted-foreground">Dr. Martin - 14h00</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0, y: [5, -5, 5] }}
                transition={{ 
                  opacity: { duration: 0.6, delay: 1 },
                  x: { duration: 0.6, delay: 1 },
                  y: { duration: 5, repeat: Infinity, delay: 1.2 }
                }}
                className="absolute bottom-10 left-0 bg-card p-4 rounded-xl shadow-medium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Nouvelle Formation</div>
                    <div className="text-xs text-muted-foreground">Gestion du stress</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}