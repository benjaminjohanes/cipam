import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, RefreshCw, AlertTriangle, FileQuestion, ShieldX, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  type?: "404" | "403" | "500" | "generic";
  title?: string;
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRefreshButton?: boolean;
}

const errorConfig = {
  "404": {
    icon: FileQuestion,
    title: "Page introuvable",
    message: "Oups ! La page que vous recherchez semble avoir disparu ou n'existe pas.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  "403": {
    icon: ShieldX,
    title: "Accès refusé",
    message: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  "500": {
    icon: ServerCrash,
    title: "Erreur serveur",
    message: "Une erreur inattendue s'est produite. Notre équipe technique a été notifiée.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  "generic": {
    icon: AlertTriangle,
    title: "Une erreur est survenue",
    message: "Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
};

export function ErrorPage({
  type = "generic",
  title,
  message,
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = false,
}: ErrorPageProps) {
  const config = errorConfig[type];
  const Icon = config.icon;

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className={`mx-auto w-24 h-24 rounded-full ${config.bgColor} flex items-center justify-center mb-8`}
        >
          <Icon className={`w-12 h-12 ${config.color}`} />
        </motion.div>

        {/* Error Code */}
        {type !== "generic" && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-7xl font-bold ${config.color} mb-4`}
          >
            {type}
          </motion.p>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4"
        >
          {title || config.title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          {message || config.message}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {showBackButton && (
            <Button variant="outline" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          )}
          {showHomeButton && (
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </Button>
          )}
          {showRefreshButton && (
            <Button variant="secondary" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          )}
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex justify-center gap-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className={`w-2 h-2 rounded-full ${config.bgColor}`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
