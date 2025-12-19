import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, FileText, Briefcase } from "lucide-react";

const roleLabels: Record<string, string> = {
  student: "Étudiant",
  professional: "Professionnel",
  patient: "Patient",
  admin: "Administrateur",
};

export default function Profile() {
  const { profile, role, user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    specialty: profile?.specialty || "",
  });

  const handleSave = () => {
    // TODO: Implement profile update with Supabase
    toast({
      title: "Profil mis à jour",
      description: "Vos modifications ont été enregistrées.",
    });
    setIsEditing(false);
  };

  return (
    <DashboardLayout title="Mon profil" description="Gérez vos informations personnelles">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Informations personnelles</CardTitle>
              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? "Enregistrer" : "Modifier"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="font-medium text-lg text-foreground">{profile?.full_name || "Non renseigné"}</p>
                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {role ? roleLabels[role] : "Utilisateur"}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="full_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Nom complet
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Téléphone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="+33 6 12 34 56 78"
                  className="mt-1"
                />
              </div>

              {(role === 'professional' || role === 'student') && (
                <div>
                  <Label htmlFor="specialty" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Spécialité
                  </Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Ex: Psychologue clinicienne"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="bio" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Biographie
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Parlez-nous de vous..."
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  Enregistrer les modifications
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Statut du compte</span>
                <span className="font-medium text-green-600">Actif</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Vérifié</span>
                <span className="font-medium">{profile?.is_verified ? "Oui" : "Non"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Membre depuis</span>
                <span className="font-medium">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('fr-FR')
                    : "-"
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
