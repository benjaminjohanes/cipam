import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Star, MapPin, Calendar, Filter, User } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Professional {
  id: string;
  full_name: string | null;
  specialty: string | null;
  experience_years: number | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  location: string | null;
  consultation_rate: number | null;
}

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
  const [selectedLocation, setSelectedLocation] = useState("Toutes");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      
      // Fetch users with professional role
      const { data: professionalRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'professional');

      if (professionalRoles && professionalRoles.length > 0) {
        const professionalIds = professionalRoles.map(r => r.user_id);
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', professionalIds);

        if (profiles) {
          setProfessionals(profiles);
        }
      }
      
      setLoading(false);
    };

    fetchProfessionals();
  }, []);

  // Extract unique locations from professionals
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(
      professionals
        .map(p => p.location)
        .filter((loc): loc is string => !!loc)
    )].sort();
    return ["Toutes", ...uniqueLocations];
  }, [professionals]);

  const filteredProfessionals = professionals.filter((pro) => {
    const matchesSearch = 
      (pro.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (pro.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (pro.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesSpecialty = selectedSpecialty === "Tous" || pro.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === "Toutes" || pro.location === selectedLocation;
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, spécialité ou localisation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card"
                  />
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full md:w-[200px] h-12 bg-card">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Localisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 flex-wrap">
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    {specialty}
                  </Button>
                ))}
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

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="text-center py-16">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucun professionnel trouvé
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedSpecialty !== "Tous" || selectedLocation !== "Toutes"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Aucun professionnel n'est encore inscrit sur la plateforme"}
              </p>
            </div>
          ) : (
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
                        {pro.avatar_url ? (
                          <img
                            src={pro.avatar_url}
                            alt={pro.full_name || "Professionnel"}
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {pro.is_verified && (
                            <Badge variant="secondary" className="mb-1 text-xs">
                              Vérifié
                            </Badge>
                          )}
                          <h3 className="text-lg font-display font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {pro.full_name || "Professionnel"}
                          </h3>
                          {pro.specialty && (
                            <p className="text-primary text-sm font-medium">{pro.specialty}</p>
                          )}
                        </div>
                      </div>

                      {pro.bio && (
                        <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                          {pro.bio}
                        </p>
                      )}

                      <div className="mt-4 space-y-2">
                        {pro.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {pro.location}
                          </div>
                        )}
                        {pro.experience_years && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {pro.experience_years} ans d'expérience
                          </div>
                        )}
                        {pro.consultation_rate && pro.consultation_rate > 0 && (
                          <div className="text-sm font-semibold text-primary">
                            {new Intl.NumberFormat('fr-FR').format(pro.consultation_rate)} FCFA / consultation
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end mt-6 pt-4 border-t border-border">
                        <Button size="sm">
                          Voir le profil
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Professionnels;
