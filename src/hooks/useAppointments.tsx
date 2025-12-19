import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  service_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patient?: {
    full_name: string | null;
    email: string;
  };
  professional?: {
    full_name: string | null;
    email: string;
  };
}

export const useAppointments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments" as any)
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const patientIds = [...new Set((data || []).map((a: any) => a.patient_id))];
      const professionalIds = [...new Set((data || []).map((a: any) => a.professional_id))];
      const allIds = [...new Set([...patientIds, ...professionalIds])];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", allIds);
      
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));
      
      return (data || []).map((appointment: any) => ({
        ...appointment,
        patient: profilesMap.get(appointment.patient_id),
        professional: profilesMap.get(appointment.professional_id),
      })) as Appointment[];
    },
  });

  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({ title: "Rendez-vous supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer le rendez-vous", variant: "destructive" });
    },
  });

  return { appointments, isLoading, updateAppointmentStatus, deleteAppointment };
};
