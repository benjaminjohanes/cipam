import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, BookOpen, Users, Calendar, FileText, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import CurrencyToggle from "@/components/CurrencyToggle";
import LanguageToggle from "@/components/LanguageToggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const navItems = [
    { label: t.nav.home, href: "/", icon: undefined },
    { label: t.nav.professionals, href: "/professionnels", icon: Users },
    { label: t.nav.formations, href: "/formations", icon: BookOpen },
    { label: t.nav.events, href: "/evenements", icon: Ticket },
    { label: t.nav.services, href: "/services", icon: Calendar },
    { label: t.nav.articles, href: "/articles", icon: FileText },
  ];

  const roleLabels: Record<string, string> = {
    student: t.roles.student,
    professional: t.roles.professional,
    patient: t.roles.patient,
    admin: t.roles.admin,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="ALLÔ PSY Logo" className="h-14 w-auto" />
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
          <div className="hidden lg:flex items-center gap-2">
            <LanguageToggle />
            <CurrencyToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{profile?.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{role ? roleLabels[role] : ''}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {t.nav.dashboard}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.nav.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">{t.nav.login}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=register">{t.nav.register}</Link>
                </Button>
              </>
            )}
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
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t.nav.language}</span>
                <LanguageToggle />
              </div>
              <div className="px-4 py-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t.nav.currency}</span>
                <CurrencyToggle />
              </div>
              <div className="pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {t.common.connectedAs} <strong>{profile?.full_name || user.email}</strong>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {t.nav.dashboard}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        {t.nav.profile}
                      </Link>
                    </Button>
                    <Button variant="destructive" onClick={handleSignOut} className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t.nav.logout}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>{t.nav.register}</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
