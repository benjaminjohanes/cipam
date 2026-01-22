import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMyUpgradeRequests, useCreateUpgradeRequest } from "@/hooks/useUpgradeRequests";
import { CheckCircle, Award, FileText, Clock, Star, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UpgradeRequest() {
  const { profile } = useAuth();
  const { data: myRequests, isLoading: isLoadingRequests } = useMyUpgradeRequests();
  const createRequest = useCreateUpgradeRequest();
  
  const [formData, setFormData] = useState({
    motivation: "",
    experience: "",
    specialty: "",
    diploma: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.specialty || !formData.experience) {
      return;
    }

    createRequest.mutate({
      specialty: formData.specialty,
      experience_years: parseInt(formData.experience) || 0,
      diplomas: formData.diploma || undefined,
      motivation: formData.motivation || undefined,
    });
  };

  // Check if user has a pending request
  const pendingRequest = myRequests?.find(r => r.status === "pending");
  const lastRequest = myRequests?.[0];

  return (
    <DashboardLayout title="Devenir professionnel" description="Évoluez vers le statut professionnel">
      <div className="max-w-3xl space-y-6">
        {/* Existing Request Status */}
        {isLoadingRequests ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : pendingRequest ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Demande en cours de traitement</h3>
                  <p className="text-muted-foreground">
                    Votre demande du {format(new Date(pendingRequest.created_at), "dd MMMM yyyy", { locale: fr })} est en attente de validation.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Spécialité: {pendingRequest.specialty}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : lastRequest?.status === "rejected" ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Dernière demande refusée</h3>
                  <p className="text-muted-foreground">
                    Votre demande du {format(new Date(lastRequest.created_at), "dd MMMM yyyy", { locale: fr })} a été refusée.
                  </p>
                  {lastRequest.rejection_reason && (
                    <p className="mt-2 text-sm text-red-700">
                      Raison: {lastRequest.rejection_reason}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vous pouvez soumettre une nouvelle demande ci-dessous.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

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

        {/* Application Form - Only show if no pending request */}
        {!pendingRequest && (
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
                  <Label htmlFor="specialty">Spécialité principale *</Label>
                  <Select 
                    value={formData.specialty}
                    onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionnez votre spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Psychologie clinique">Psychologie clinique</SelectItem>
                      <SelectItem value="Psychologie de l'enfant">Psychologie de l'enfant</SelectItem>
                      <SelectItem value="Neuropsychologie">Neuropsychologie</SelectItem>
                      <SelectItem value="Psychothérapie">Psychothérapie</SelectItem>
                      <SelectItem value="Coaching">Coaching</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Années d'expérience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Ex: 3"
                    className="mt-1"
                    required
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
                    placeholder="Expliquez pourquoi vous souhaitez devenir professionnel sur ALLÔ PSY..."
                    className="mt-1 min-h-[150px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={!formData.specialty || !formData.experience || createRequest.isPending}
                >
                  {createRequest.isPending ? "Envoi en cours..." : "Soumettre ma candidature"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Request History */}
        {myRequests && myRequests.length > 0 && !pendingRequest && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des demandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{request.specialty}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <Badge 
                      variant={request.status === "approved" ? "default" : "destructive"}
                      className={request.status === "approved" ? "bg-green-100 text-green-700" : ""}
                    >
                      {request.status === "approved" ? "Approuvé" : "Refusé"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
