import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Users, GraduationCap, Stethoscope, UserRound, Settings2, History, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
import { PermissionsDialog, AdminPermission, permissionConfigs } from "@/components/admin/PermissionsDialog";
import { useAllAdminPermissions, useAdminPermissions } from "@/hooks/useAdminPermissions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

interface RoleChangeHistory {
  id: string;
  user_id: string;
  changed_by: string;
  old_role: string;
  new_role: string;
  created_at: string;
  user_profile?: {
    full_name: string | null;
    email: string;
  };
  changed_by_profile?: {
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

const getRoleLabel = (role: string): string => {
  return roleLabels[role as AppRole]?.label || role;
};

const getRoleColor = (role: string): string => {
  return roleLabels[role as AppRole]?.color || "bg-gray-500";
};

const Roles = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<AppRole | "all">("all");
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; isNew: boolean } | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; oldRole: AppRole; newRole: AppRole } | null>(null);

  const { data: allPermissions } = useAllAdminPermissions();
  const { updatePermissions } = useAdminPermissions();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
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

  const { data: roleHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["role-change-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_change_history" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const allUserIds = new Set<string>();
      (data || []).forEach((h: any) => {
        allUserIds.add(h.user_id);
        allUserIds.add(h.changed_by);
      });
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", Array.from(allUserIds));
      
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (data || []).map((h: any) => ({
        ...h,
        user_profile: profilesMap.get(h.user_id),
        changed_by_profile: profilesMap.get(h.changed_by),
      })) as RoleChangeHistory[];
    },
  });

  const recordRoleChange = useMutation({
    mutationFn: async ({ userId, oldRole, newRole }: { userId: string; oldRole: string; newRole: string }) => {
      const { error } = await supabase
        .from("role_change_history" as any)
        .insert({
          user_id: userId,
          changed_by: user?.id,
          old_role: oldRole,
          new_role: newRole,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-change-history"] });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, oldRole, newRole }: { userId: string; oldRole: AppRole; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
      
      // Record the change in history
      await recordRoleChange.mutateAsync({ userId, oldRole, newRole });
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

  const handleRoleChange = (userId: string, currentRole: AppRole, newRole: AppRole) => {
    const userInfo = userRoles?.find(u => u.user_id === userId);
    const userName = userInfo?.profile?.full_name || "cet utilisateur";

    // Si on passe à admin, ouvrir le dialogue des permissions
    if (newRole === "admin" && currentRole !== "admin") {
      setPendingRoleChange({ userId, oldRole: currentRole, newRole });
      setSelectedUser({ id: userId, name: userName, isNew: true });
      setPermissionsDialogOpen(true);
    } else {
      // Si on retire le rôle admin, supprimer les permissions
      if (currentRole === "admin" && newRole !== "admin") {
        updatePermissions.mutate({
          userId,
          permissions: [],
          grantedBy: user?.id || "",
        });
      }
      updateRole.mutate({ userId, oldRole: currentRole, newRole });
    }
  };

  const handlePermissionsSave = async (permissions: AdminPermission[]) => {
    if (!user) return;

    await updatePermissions.mutateAsync({
      userId: selectedUser?.id || "",
      permissions,
      grantedBy: user.id,
    });

    // Si c'est une nouvelle promotion admin, appliquer le changement de rôle
    if (pendingRoleChange) {
      updateRole.mutate(pendingRoleChange);
      setPendingRoleChange(null);
    }
  };

  const openPermissionsForUser = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName, isNew: false });
    setPermissionsDialogOpen(true);
  };

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

        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestion des rôles
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles">
            {/* Users Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestion des rôles
                    </CardTitle>
                    <CardDescription>Modifier les rôles et permissions des utilisateurs</CardDescription>
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
                        <TableHead>Permissions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((userRole) => {
                        const userPerms = allPermissions?.[userRole.user_id] || [];
                        return (
                          <TableRow key={userRole.id}>
                            <TableCell className="font-medium">
                              {userRole.profile?.full_name || "Non renseigné"}
                            </TableCell>
                            <TableCell>{userRole.profile?.email || "N/A"}</TableCell>
                            <TableCell>
                              <Badge className={`${roleLabels[userRole.role].color} text-white`}>
                                {roleLabels[userRole.role].icon}
                                <span className="ml-1">{roleLabels[userRole.role].label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userRole.role === "admin" && (
                                <div className="flex flex-wrap gap-1">
                                  {userPerms.length > 0 ? (
                                    userPerms.length <= 3 ? (
                                      userPerms.map((perm) => (
                                        <Badge key={perm} variant="outline" className="text-xs">
                                          {permissionConfigs[perm]?.label || perm}
                                        </Badge>
                                      ))
                                    ) : (
                                      <Badge variant="outline" className="text-xs">
                                        {userPerms.length} permissions
                                      </Badge>
                                    )
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Aucune permission</span>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={userRole.role}
                                  onValueChange={(v) => handleRoleChange(userRole.user_id, userRole.role, v as AppRole)}
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
                                {userRole.role === "admin" && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => openPermissionsForUser(
                                      userRole.user_id,
                                      userRole.profile?.full_name || "Utilisateur"
                                    )}
                                  >
                                    <Settings2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique des changements de rôles
                </CardTitle>
                <CardDescription>
                  Consultez l'historique complet des modifications de rôles sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <p className="text-muted-foreground">Chargement...</p>
                ) : roleHistory && roleHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur concerné</TableHead>
                        <TableHead>Changement</TableHead>
                        <TableHead>Effectué par</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleHistory.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(history.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{history.user_profile?.full_name || "Inconnu"}</p>
                              <p className="text-sm text-muted-foreground">{history.user_profile?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRoleColor(history.old_role)} text-white`}>
                                {getRoleLabel(history.old_role)}
                              </Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Badge className={`${getRoleColor(history.new_role)} text-white`}>
                                {getRoleLabel(history.new_role)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{history.changed_by_profile?.full_name || "Système"}</p>
                              <p className="text-sm text-muted-foreground">{history.changed_by_profile?.email}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun changement de rôle enregistré</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedUser && (
        <PermissionsDialog
          open={permissionsDialogOpen}
          onOpenChange={setPermissionsDialogOpen}
          userName={selectedUser.name}
          userId={selectedUser.id}
          currentPermissions={allPermissions?.[selectedUser.id] || []}
          onSave={handlePermissionsSave}
          isNewAdmin={selectedUser.isNew}
        />
      )}
    </DashboardLayout>
  );
};

export default Roles;
