import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AdminPermission } from "@/components/admin/PermissionsDialog";

export const useAdminPermissions = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["admin-permissions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("admin_permissions" as any)
        .select("permission")
        .eq("user_id", userId);
      
      if (error) throw error;
      return (data || []).map((p: any) => p.permission as AdminPermission);
    },
    enabled: !!userId,
  });

  const updatePermissions = useMutation({
    mutationFn: async ({ 
      userId, 
      permissions,
      grantedBy 
    }: { 
      userId: string; 
      permissions: AdminPermission[];
      grantedBy: string;
    }) => {
      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from("admin_permissions" as any)
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissions.length > 0) {
        const inserts = permissions.map((permission) => ({
          user_id: userId,
          permission,
          granted_by: grantedBy,
        }));

        const { error: insertError } = await supabase
          .from("admin_permissions" as any)
          .insert(inserts);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      toast({ title: "Permissions mises à jour" });
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour les permissions", 
        variant: "destructive" 
      });
    },
  });

  return {
    permissions: permissions || [],
    isLoading,
    updatePermissions,
  };
};

export const useAllAdminPermissions = () => {
  return useQuery({
    queryKey: ["all-admin-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions" as any)
        .select("user_id, permission");
      
      if (error) throw error;
      
      // Group by user_id
      const grouped = (data || []).reduce((acc: Record<string, AdminPermission[]>, curr: any) => {
        if (!acc[curr.user_id]) acc[curr.user_id] = [];
        acc[curr.user_id].push(curr.permission);
        return acc;
      }, {});
      
      return grouped;
    },
  });
};
