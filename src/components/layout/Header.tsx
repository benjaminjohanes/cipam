import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, BookOpen, Users, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/cipam_logo.jpg";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Professionnels", href: "/professionnels", icon: Users },
  { label: "Formations", href: "/formations", icon: BookOpen },
  { label: "Services", href: "/services", icon: Calendar },
  { label: "Articles", href: "/articles", icon: FileText },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="CIPAM Logo" className="h-14 w-auto" />
            <div className="hidden sm:block">
              <span className="text-xl font-display font-semibold text-foreground">CIPAM</span>
              <p className="text-xs text-muted-foreground italic">La Psychologie dans la Pratique</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=register">S'inscrire</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-primary/5 rounded-lg transition-colors"
                >
                  {item.icon && <item.icon className="w-5 h-5 text-primary" />}
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth">Se connecter</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/auth?mode=register">S'inscrire</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
