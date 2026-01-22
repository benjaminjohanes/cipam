import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Linkedin, Twitter, Instagram } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import defaultLogo from "@/assets/logo-footer.jpg";

export function Footer() {
  const { branding } = useBranding();
  
  const footerLogo = branding.footer_logo || defaultLogo;
  const siteName = branding.site_name || "Allô Psy";
  const slogan = branding.slogan || "Vous méritez d'être écouté et soutenu, sans jugement";
  const contactEmail = branding.contact_email || "cipam.global.contact@gmail.com";
  const contactPhones = branding.contact_phones?.length ? branding.contact_phones : ["+229 01 52 01 17 77", "+229 01 59 05 40 93"];
  const contactAddress = branding.contact_address || "Abomey-Calavi, Benin";
  const socialLinks = branding.social_links || { facebook: "", linkedin: "", twitter: "", instagram: "" };

  const hasSocialLinks = socialLinks.facebook || socialLinks.linkedin || socialLinks.twitter || socialLinks.instagram;

  return (
    <footer className="bg-allopsy-navy text-secondary py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={footerLogo} alt={`${siteName} Logo`} className="h-16 w-auto rounded-lg bg-white p-1" />
            </div>
            <p className="text-secondary/80 text-sm leading-relaxed italic">
              "{slogan}"
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
                <span className="break-all">{contactEmail}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <Phone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  {contactPhones.map((phone, index) => (
                    <span key={index}>{phone}</span>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-secondary/70">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span>{contactAddress}</span>
              </li>
            </ul>
            {hasSocialLinks && (
              <div className="flex gap-3 mt-4">
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a 
                    href={socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-secondary/10 mt-12 pt-8 text-center text-sm text-secondary/60">
          <p>
            © {new Date().getFullYear()} {siteName.toUpperCase()}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
