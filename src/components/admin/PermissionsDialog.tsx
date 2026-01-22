import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, FileText, GraduationCap, Calendar, Briefcase, 
  FolderOpen, Link2, BarChart3, Settings, UsersRound, Shield
} from "lucide-react";

export type AdminPermission = 
  | "manage_users"
  | "manage_articles"
  | "manage_formations"
  | "manage_events"
  | "manage_services"
  | "manage_categories"
  | "manage_affiliations"
  | "view_stats"
  | "manage_settings"
  | "manage_team";

interface PermissionConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const permissionConfigs: Record<AdminPermission, PermissionConfig> = {
  manage_users: {
    label: "Gérer les utilisateurs",
    description: "Voir et modifier les profils utilisateurs",
    icon: <Users className="h-4 w-4" />,
  },
  manage_articles: {
    label: "Gérer les articles",
    description: "Créer, modifier et supprimer des articles",
    icon: <FileText className="h-4 w-4" />,
  },
  manage_formations: {
    label: "Gérer les formations",
    description: "Valider et gérer les formations",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  manage_events: {
    label: "Gérer les événements",
    description: "Créer et gérer les événements",
    icon: <Calendar className="h-4 w-4" />,
  },
  manage_services: {
    label: "Gérer les services",
    description: "Valider et gérer les services",
    icon: <Briefcase className="h-4 w-4" />,
  },
  manage_categories: {
    label: "Gérer les catégories",
    description: "Ajouter et modifier les catégories",
    icon: <FolderOpen className="h-4 w-4" />,
  },
  manage_affiliations: {
    label: "Gérer les affiliations",
    description: "Superviser le programme d'affiliation",
    icon: <Link2 className="h-4 w-4" />,
  },
  view_stats: {
    label: "Voir les statistiques",
    description: "Accéder aux tableaux de bord et rapports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  manage_settings: {
    label: "Gérer les paramètres",
    description: "Configurer les paramètres de la plateforme",
    icon: <Settings className="h-4 w-4" />,
  },
  manage_team: {
    label: "Gérer l'équipe",
    description: "Gérer les membres de l'équipe admin",
    icon: <UsersRound className="h-4 w-4" />,
  },
};

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userId: string;
  currentPermissions: AdminPermission[];
  onSave: (permissions: AdminPermission[]) => Promise<void>;
  isNewAdmin?: boolean;
}

export const PermissionsDialog = ({
  open,
  onOpenChange,
  userName,
  userId,
  currentPermissions,
  onSave,
  isNewAdmin = false,
}: PermissionsDialogProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermission[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedPermissions(currentPermissions);
  }, [currentPermissions, open]);

  const togglePermission = (permission: AdminPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(Object.keys(permissionConfigs) as AdminPermission[]);
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedPermissions);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isNewAdmin ? "Attribuer les permissions" : "Modifier les permissions"}
          </DialogTitle>
          <DialogDescription>
            {isNewAdmin 
              ? `Sélectionnez les fonctionnalités auxquelles ${userName} aura accès en tant qu'administrateur.`
              : `Gérer les permissions de ${userName}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              Tout désélectionner
            </Button>
            <Badge variant="secondary" className="ml-auto">
              {selectedPermissions.length} / {Object.keys(permissionConfigs).length} permissions
            </Badge>
          </div>

          <div className="grid gap-3">
            {(Object.entries(permissionConfigs) as [AdminPermission, PermissionConfig][]).map(
              ([permission, config]) => (
                <div
                  key={permission}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedPermissions.includes(permission)
                      ? "bg-primary/5 border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => togglePermission(permission)}
                >
                  <Checkbox
                    id={permission}
                    checked={selectedPermissions.includes(permission)}
                    onCheckedChange={() => togglePermission(permission)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={permission}
                      className="flex items-center gap-2 cursor-pointer font-medium"
                    >
                      {config.icon}
                      {config.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config.description}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Enregistrement..." : isNewAdmin ? "Promouvoir en admin" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
