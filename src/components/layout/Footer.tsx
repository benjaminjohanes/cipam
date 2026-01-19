import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";
import logo from "@/assets/logo-footer.jpg";

export function Footer() {
  return (
    <footer className="bg-allopsy-navy text-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ALLÔ PSY Logo" className="h-16 w-auto rounded-lg bg-white p-1" />
            </div>
            <p className="text-secondary/80 text-sm leading-relaxed italic">
              "Vous méritez d'être écouté et soutenu, sans jugement"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              {[
                { label: "Nos Professionnels", href: "/professionnels" },
                { label: "Formations", href: "/formations" },
                { label: "Événements", href: "/evenements" },
                { label: "Prendre RDV", href: "/services" },
                { label: "Articles", href: "/articles" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-secondary/70 hover:text-secondary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Nos Services</h4>
            <ul className="space-y-2 text-sm text-secondary/70">
              <li>Consultations Individuelles</li>
              <li>Thérapie de Couple</li>
              <li>Formations Professionnelles</li>
              <li>Supervision Clinique</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <Mail className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="break-all">cipam.global.contact@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <Phone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span>+229 01 52 01 17 77</span>
                  <span>+229 01 59 05 40 93</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>Abomey-Calavi, Benin</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary/10 mt-12 pt-8 text-center text-sm text-secondary/60">
          <p>
            © {new Date().getFullYear()} ALLÔ PSY. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}