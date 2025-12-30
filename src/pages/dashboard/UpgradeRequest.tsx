import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, Award, FileText, Clock, Star, TrendingUp } from "lucide-react";

const requirements = [
  { id: 1, text: "Avoir complété au moins 3 formations sur la plateforme", met: true },
  { id: 2, text: "Avoir proposé au moins 2 services approuvés", met: true },
  { id: 3, text: "Avoir une note moyenne d'au moins 4/5", met: true },
  { id: 4, text: "Fournir une copie de vos diplômes", met: false },
  { id: 5, text: "Avoir au moins 2 ans d'expérience", met: false },
];

export default function UpgradeRequest() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    motivation: "",
    experience: "",
    specialty: "",
    diploma: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande envoyée",
      description: "Votre demande de passage au statut professionnel a été soumise. Nous vous contacterons sous 48h.",
    });
  };

  const requirementsMet = requirements.filter(r => r.met).length;
  const totalRequirements = requirements.length;
  const canApply = requirementsMet >= 3; // At least 3 requirements met

  return (
    <DashboardLayout title="Devenir professionnel" description="Évoluez vers le statut professionnel">
      <div className="max-w-3xl space-y-6">
        {/* Benefits Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Avantages du statut Professionnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Consultations en ligne</p>
                  <p className="text-sm text-muted-foreground">Proposez des rendez-vous payants</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Créez vos formations</p>
                  <p className="text-sm text-muted-foreground">Publiez et vendez vos cours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Profil vérifié</p>
                  <p className="text-sm text-muted-foreground">Badge de vérification visible</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Meilleure visibilité</p>
                  <p className="text-sm text-muted-foreground">Priorité dans les résultats</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Critères d'éligibilité</CardTitle>
            <CardDescription>
              Vous remplissez {requirementsMet}/{totalRequirements} critères
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirements.map((req) => (
                <div 
                  key={req.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    req.met ? 'bg-green-50' : 'bg-muted/50'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    req.met ? 'bg-green-500' : 'bg-muted'
                  }`}>
                    {req.met ? (
                      <CheckCircle className="h-4 w-4 text-white" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de candidature</CardTitle>
            <CardDescription>
              Complétez ce formulaire pour soumettre votre demande
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="specialty">Spécialité principale</Label>
                <Select 
                  value={formData.specialty}
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionnez votre spécialité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Psychologie clinique</SelectItem>
                    <SelectItem value="child">Psychologie de l'enfant</SelectItem>
                    <SelectItem value="neuro">Neuropsychologie</SelectItem>
                    <SelectItem value="therapy">Psychothérapie</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Années d'expérience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ex: 3"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="diploma">Diplômes et certifications</Label>
                <Textarea
                  id="diploma"
                  value={formData.diploma}
                  onChange={(e) => setFormData({ ...formData, diploma: e.target.value })}
                  placeholder="Listez vos diplômes, certifications et formations..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="motivation">Lettre de motivation</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Expliquez pourquoi vous souhaitez devenir professionnel sur ALLô PSY..."
                  className="mt-1 min-h-[150px]"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={!canApply}>
                  Soumettre ma candidature
                </Button>
                {!canApply && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Vous devez remplir au moins 3 critères
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
