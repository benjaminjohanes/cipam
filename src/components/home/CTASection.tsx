import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  "Accès à plus de 50 professionnels qualifiés",
  "Formations certifiantes reconnues",
  "Accompagnement personnalisé",
  "Plateforme sécurisée et confidentielle",
];

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground leading-tight px-2">
              Vous méritez d'être écouté et soutenu, sans jugement
            </h2>
            <p className="text-primary-foreground/80 mt-4 sm:mt-6 text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
              Rejoignez des milliers de personnes qui ont choisi ALLÔ PSY pour leur accompagnement psychologique personnalisé.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-6 sm:mt-10 max-w-xl mx-auto text-left px-4 sm:px-0"
          >
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start sm:items-center gap-2 text-primary-foreground/90">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-xs sm:text-sm">{benefit}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mt-6 sm:mt-10 px-4 sm:px-0"
          >
            <Button size="lg" variant="secondary" asChild className="text-foreground w-full sm:w-auto text-sm sm:text-base">
              <Link to="/auth?mode=register">
                Créer un compte gratuit
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/50 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto text-sm sm:text-base">
              <Link to="/professionnels">
                Explorer les professionnels
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
