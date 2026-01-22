import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export interface UpgradeRequest {
  id: string;
  user_id: string;
  specialty: string;
  experience_years: number;
  diplomas: string | null;
  motivation: string | null;
  status: "pending" | "approved" | "rejected";
  processed_by: string | null;
  processed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  processor?: {
    full_name: string | null;
  };
}

// Fetch all upgrade requests (admin only)
export const useUpgradeRequests = () => {
  return useQuery({
    queryKey: ["upgrade-requests"],
    queryFn: async () => {
      // Use rpc or raw query to get data from new table (types not yet regenerated)
      const { data, error } = await supabase
        .from("upgrade_requests" as never)
        .select(`
          *,
          user:profiles!upgrade_requests_user_id_fkey(id, full_name, email, avatar_url),
          processor:profiles!upgrade_requests_processed_by_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as UpgradeRequest[];
    },
  });
};

// Fetch user's own upgrade requests
export const useMyUpgradeRequests = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["my-upgrade-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("upgrade_requests" as never)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as UpgradeRequest[];
    },
    enabled: !!user?.id,
  });
};

// Create a new upgrade request
export const useCreateUpgradeRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      specialty: string;
      experience_years: number;
      diplomas?: string;
      motivation?: string;
    }) => {
      if (!user?.id) throw new Error("Non authentifié");

      const { error } = await supabase.from("upgrade_requests" as never).insert({
        user_id: user.id,
        specialty: data.specialty,
        experience_years: data.experience_years,
        diplomas: data.diplomas || null,
        motivation: data.motivation || null,
      } as never);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-upgrade-requests"] });
      toast.success("Demande envoyée avec succès");
    },
    onError: (error: Error) => {
      console.error("Error creating upgrade request:", error);
      toast.error("Erreur lors de l'envoi de la demande");
    },
  });
};

// Process upgrade request (admin only)
export const useProcessUpgradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      rejectionReason,
    }: {
      requestId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Update the request
      const { error: updateError } = await supabase
        .from("upgrade_requests" as never)
        .update({
          status,
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          rejection_reason: status === "rejected" ? rejectionReason : null,
        } as never)
        .eq("id", requestId);

      if (updateError) throw updateError;

      // If approved, update user role to professional
      if (status === "approved") {
        // Get the user_id from the request
        const { data: request, error: fetchError } = await supabase
          .from("upgrade_requests" as never)
          .select("user_id")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;

        const requestData = request as unknown as { user_id: string };

        // Get current role for history
        const { data: currentRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", requestData.user_id)
          .single();

        // Update role to professional
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: "professional" })
          .eq("user_id", requestData.user_id);

        if (roleError) throw roleError;

        // Add to role change history
        await supabase.from("role_change_history").insert({
          user_id: requestData.user_id,
          old_role: currentRole?.role || "student",
          new_role: "professional",
          changed_by: user.id,
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["upgrade-requests"] });
      toast.success(
        variables.status === "approved"
          ? "Demande approuvée - L'utilisateur est maintenant professionnel"
          : "Demande refusée"
      );
    },
    onError: (error: Error) => {
      console.error("Error processing upgrade request:", error);
      toast.error("Erreur lors du traitement de la demande");
    },
  });
};

// Get upgrade request stats
export const useUpgradeRequestStats = () => {
  return useQuery({
    queryKey: ["upgrade-requests-stats"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: rawData, error } = await supabase
        .from("upgrade_requests" as never)
        .select("status, processed_at");

      if (error) throw error;

      const requests = (rawData as unknown) as Array<{ status: string; processed_at: string | null }>;

      const pending = requests?.filter((r) => r.status === "pending").length || 0;
      const approvedThisMonth =
        requests?.filter(
          (r) => r.status === "approved" && r.processed_at && r.processed_at >= startOfMonth
        ).length || 0;
      const rejectedThisMonth =
        requests?.filter(
          (r) => r.status === "rejected" && r.processed_at && r.processed_at >= startOfMonth
        ).length || 0;

      return { pending, approvedThisMonth, rejectedThisMonth };
    },
  });
};
