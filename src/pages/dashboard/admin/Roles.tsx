import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Users, GraduationCap, Stethoscope, UserRound } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string | null;
  profile?: {
    full_name: string | null;
    email: string;
  };
}

const roleLabels: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: "Administrateur", icon: <ShieldCheck className="h-3 w-3" />, color: "bg-purple-500" },
  professional: { label: "Professionnel", icon: <Stethoscope className="h-3 w-3" />, color: "bg-blue-500" },
  student: { label: "Étudiant", icon: <GraduationCap className="h-3 w-3" />, color: "bg-green-500" },
  patient: { label: "Patient", icon: <UserRound className="h-3 w-3" />, color: "bg-gray-500" },
};

const Roles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AppRole | "all">("all");

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
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
      })) as UserRole[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      toast({ title: "Rôle mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le rôle", variant: "destructive" });
    },
  });

  const filteredUsers = userRoles?.filter((u) => filter === "all" || u.role === filter);

  const roleCounts = userRoles?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<AppRole, number>);

  return (
    <DashboardLayout title="Rôles & Permissions" description="Gestion des rôles et permissions des utilisateurs">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {(Object.keys(roleLabels) as AppRole[]).map((role) => (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{roleLabels[role].label}s</CardTitle>
                <div className={`p-2 rounded-full ${roleLabels[role].color} text-white`}>
                  {roleLabels[role].icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleCounts?.[role] || 0}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestion des rôles
                </CardTitle>
                <CardDescription>Modifier les rôles des utilisateurs</CardDescription>
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as AppRole | "all")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle actuel</TableHead>
                    <TableHead>Changer le rôle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.profile?.full_name || "Non renseigné"}
                      </TableCell>
                      <TableCell>{user.profile?.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={`${roleLabels[user.role].color} text-white`}>
                          {roleLabels[user.role].icon}
                          <span className="ml-1">{roleLabels[user.role].label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => updateRole.mutate({ userId: user.user_id, newRole: v as AppRole })}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(roleLabels) as AppRole[]).map((role) => (
                              <SelectItem key={role} value={role}>
                                {roleLabels[role].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Roles;
