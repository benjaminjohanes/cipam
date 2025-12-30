import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";
import logo from "@/assets/cipam_logo.jpg";

export function Footer() {
  return (
    <footer className="bg-cipam-navy text-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ALLÔ PSY Logo" className="h-12 w-auto rounded-lg" />
              <div>
                <span className="text-xl font-display font-semibold">ALLÔ PSY</span>
                <p className="text-xs text-secondary/70 italic">La Psychologie dans la Pratique</p>
              </div>
            </div>
            <p className="text-secondary/80 text-sm leading-relaxed">
              ALLÔ PSY - Votre partenaire pour le bien-être mental et la psychologie appliquée.
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
              <li className="flex items-center gap-3 text-sm text-secondary/70">
                <Mail className="w-4 h-4 text-accent" />
                cipam.global.contact@gmail.com
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary/70">
                <Phone className="w-4 h-4 text-accent" />
                +229 01 52 40 14 70
              </li>
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                Abomey-Calavi, Benin
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
            © {new Date().getFullYear()} ALLÔ PSY - La Psychologie dans la Pratique. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
