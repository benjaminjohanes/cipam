import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Shield, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

const Team = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "admin")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = (data || []).map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (data || []).map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id),
      })) as AdminUser[];
    },
  });

  const removeAdmin = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: "patient" })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast({ title: "Administrateur retiré" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de retirer l'administrateur", variant: "destructive" });
    },
  });

  return (
    <DashboardLayout title="Équipe admin" description="Gestion de l'équipe d'administration">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Équipe d'administration ({adminUsers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : adminUsers && adminUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Membre depuis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.profile?.full_name || "Non renseigné"}
                    </TableCell>
                    <TableCell>{admin.profile?.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.created_at
                        ? format(new Date(admin.created_at), "dd MMM yyyy", { locale: fr })
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeAdmin.mutate(admin.user_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Aucun administrateur trouvé.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Team;
