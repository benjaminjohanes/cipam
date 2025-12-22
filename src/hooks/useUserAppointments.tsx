import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserAppointment {
  id: string;
  patient_id: string;
  professional_id: string;
  service_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  type: "video" | "in-person";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  professional?: {
    id: string;
    full_name: string | null;
    email: string;
    specialty?: string | null;
    avatar_url: string | null;
  };
  patient?: {
    id: string;
    full_name: string | null;
    email: string;
    specialty?: string | null;
    avatar_url: string | null;
  };
}

export const useUserAppointments = (userType: "patient" | "professional" = "patient") => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["user-appointments", userType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const column = userType === "patient" ? "patient_id" : "professional_id";
      
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq(column, user.id)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      // Fetch related profiles
      const professionalIds = [...new Set((data || []).map(a => a.professional_id))];
      const patientIds = [...new Set((data || []).map(a => a.patient_id))];
      const allIds = [...new Set([...professionalIds, ...patientIds])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, specialty, avatar_url")
        .in("id", allIds);

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      return (data || []).map(appointment => ({
        ...appointment,
        professional: profilesMap.get(appointment.professional_id),
        patient: profilesMap.get(appointment.patient_id),
      })) as UserAppointment[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] });
      toast({ title: "Rendez-vous annulé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'annuler le rendez-vous", variant: "destructive" });
    },
  });

  const upcomingAppointments = appointments?.filter(
    a => new Date(a.scheduled_at) >= new Date() && a.status !== "cancelled" && a.status !== "completed"
  ) || [];

  const pastAppointments = appointments?.filter(
    a => new Date(a.scheduled_at) < new Date() || a.status === "completed" || a.status === "cancelled"
  ) || [];

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    isLoading,
    updateStatus,
    cancelAppointment,
  };
};