import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Calendar, Filter, ChevronDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const professionals = [
  {
    id: 1,
    name: "Dr. Marie Konan",
    specialty: "Psychologie Clinique",
    subspecialties: ["Thérapie cognitive", "Gestion du stress"],
    experience: "15 ans",
    rating: 4.9,
    reviews: 127,
    location: "Abidjan, Cocody",
    availability: "Disponible",
    price: 25000,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dr. Jean-Baptiste Kouassi",
    specialty: "Neuropsychologie",
    subspecialties: ["Bilans neuropsychologiques", "Réhabilitation cognitive"],
    experience: "12 ans",
    rating: 4.8,
    reviews: 89,
    location: "Abidjan, Plateau",
    availability: "Disponible",
    price: 30000,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Aminata Diallo",
    specialty: "Psychothérapie",
    subspecialties: ["Thérapie de couple", "TCC"],
    experience: "10 ans",
    rating: 4.9,
    reviews: 156,
    location: "Abidjan, Marcory",
    availability: "Disponible demain",
    price: 20000,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Paul Mensah",
    specialty: "Psychologie du Travail",
    subspecialties: ["Burnout", "Coaching professionnel"],
    experience: "8 ans",
    rating: 4.7,
    reviews: 72,
    location: "Abidjan, Treichville",
    availability: "Disponible",
    price: 22000,
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Dr. Fatou Traoré",
    specialty: "Psychologie de l'Enfant",
    subspecialties: ["Troubles de l'apprentissage", "TDAH"],
    experience: "14 ans",
    rating: 4.9,
    reviews: 203,
    location: "Abidjan, Riviera",
    availability: "Disponible",
    price: 25000,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Dr. Kouamé Yao",
    specialty: "Psychiatrie",
    subspecialties: ["Troubles anxieux", "Dépression"],
    experience: "20 ans",
    rating: 4.8,
    reviews: 312,
    location: "Abidjan, Plateau",
    availability: "Disponible la semaine prochaine",
    price: 35000,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
  },
];

const specialties = [
  "Tous",
  "Psychologie Clinique",
  "Neuropsychologie",
  "Psychothérapie",
  "Psychologie du Travail",
  "Psychologie de l'Enfant",
  "Psychiatrie",
];

const Professionnels = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");

  const filteredProfessionals = professionals.filter((pro) => {
    const matchesSearch = pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pro.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "Tous" || pro.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

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
              Nos Professionnels
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Trouvez le professionnel de santé mentale qui correspond à vos besoins
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou spécialité..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {specialties.slice(0, 4).map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                    className="h-12"
                  >
                    {specialty}
                  </Button>
                ))}
                <Button variant="outline" size="sm" className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  Plus de filtres
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professionals List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProfessionals.length}</span> professionnels trouvés
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((pro, index) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/professionnels/${pro.id}`}
                  className="block group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pro.image}
                        alt={pro.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 fill-cipam-gold text-cipam-gold" />
                          <span className="text-sm font-medium">{pro.rating}</span>
                          <span className="text-sm text-muted-foreground">({pro.reviews} avis)</span>
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {pro.name}
                        </h3>
                        <p className="text-primary text-sm font-medium">{pro.specialty}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {pro.subspecialties.map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {pro.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-green-600">{pro.availability}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <div>
                        <span className="text-lg font-bold text-primary">{formatPrice(pro.price)}</span>
                        <span className="text-sm text-muted-foreground">/consultation</span>
                      </div>
                      <Button size="sm">
                        Prendre RDV
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Professionnels;
