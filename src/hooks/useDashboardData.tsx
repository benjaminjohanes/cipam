import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from "date-fns";
import { fr } from "date-fns/locale";

// Patient dashboard data
export interface PatientDashboardData {
  upcomingAppointments: number;
  formationsInProgress: number;
  totalConsultations: number;
  monthlyExpenses: number;
  nextAppointments: {
    id: string;
    professional_name: string;
    specialty: string | null;
    scheduled_at: string;
    status: string;
  }[];
}

export const usePatientDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patient-dashboard", user?.id],
    queryFn: async (): Promise<PatientDashboardData> => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch upcoming appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          status,
          professional:profiles!appointments_professional_id_fkey(full_name, specialty)
        `)
        .eq("patient_id", user.id)
        .gte("scheduled_at", now.toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      // Count total consultations
      const { count: totalConsultations } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", user.id);

      // Count upcoming appointments this week
      const weekEnd = subDays(now, -7);
      const { count: upcomingCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", user.id)
        .gte("scheduled_at", now.toISOString())
        .lte("scheduled_at", weekEnd.toISOString());

      // Get formations in progress (event registrations as proxy)
      const { count: formationsCount } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "confirmed");

      const nextAppointments = (appointments || []).map((apt: any) => ({
        id: apt.id,
        professional_name: apt.professional?.full_name || "Professionnel",
        specialty: apt.professional?.specialty,
        scheduled_at: apt.scheduled_at,
        status: apt.status,
      }));

      return {
        upcomingAppointments: upcomingCount || 0,
        formationsInProgress: formationsCount || 0,
        totalConsultations: totalConsultations || 0,
        monthlyExpenses: 0, // Could be calculated from payments if available
        nextAppointments,
      };
    },
    enabled: !!user,
  });
};

// Student dashboard data
export interface StudentDashboardData {
  servicesCount: number;
  pendingServicesCount: number;
  formationsFollowed: number;
  completedFormations: number;
  monthlyRevenue: number;
  averageRating: number;
  reviewsCount: number;
  pendingServices: {
    id: string;
    title: string;
    created_at: string;
  }[];
}

export const useStudentDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["student-dashboard", user?.id],
    queryFn: async (): Promise<StudentDashboardData> => {
      if (!user) throw new Error("Not authenticated");

      // Fetch services
      const { data: services } = await supabase
        .from("services")
        .select("id, title, status, created_at")
        .eq("provider_id", user.id);

      const pendingServices = (services || []).filter(s => s.status === "pending");

      // Fetch reviews for the user
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("target_id", user.id)
        .eq("target_type", "professional");

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Fetch event registrations as formations followed
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("status")
        .eq("user_id", user.id);

      const formationsFollowed = registrations?.length || 0;
      const completedFormations = registrations?.filter(r => r.status === "completed").length || 0;

      return {
        servicesCount: services?.length || 0,
        pendingServicesCount: pendingServices.length,
        formationsFollowed,
        completedFormations,
        monthlyRevenue: 0, // Would need payments table
        averageRating: Math.round(averageRating * 10) / 10,
        reviewsCount: reviews?.length || 0,
        pendingServices: pendingServices.slice(0, 3).map(s => ({
          id: s.id,
          title: s.title,
          created_at: s.created_at,
        })),
      };
    },
    enabled: !!user,
  });
};

// Professional dashboard data
export interface ProfessionalDashboardData {
  todayAppointments: number;
  confirmedToday: number;
  pendingToday: number;
  activePatients: number;
  newPatientsThisMonth: number;
  monthlyRevenue: number;
  averageRating: number;
  reviewsCount: number;
  todaySchedule: {
    id: string;
    patient_name: string;
    scheduled_at: string;
    type: string;
    status: string;
  }[];
}

export const useProfessionalDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professional-dashboard", user?.id],
    queryFn: async (): Promise<ProfessionalDashboardData> => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const monthStart = startOfMonth(now);

      // Fetch today's appointments
      const { data: todayAppointments } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          status,
          type,
          patient:profiles!appointments_patient_id_fkey(full_name)
        `)
        .eq("professional_id", user.id)
        .gte("scheduled_at", todayStart.toISOString())
        .lte("scheduled_at", todayEnd.toISOString())
        .order("scheduled_at", { ascending: true });

      const confirmedToday = (todayAppointments || []).filter(a => a.status === "confirmed").length;
      const pendingToday = (todayAppointments || []).filter(a => a.status === "pending").length;

      // Count unique patients
      const { data: allAppointments } = await supabase
        .from("appointments")
        .select("patient_id")
        .eq("professional_id", user.id);

      const uniquePatients = new Set((allAppointments || []).map(a => a.patient_id));

      // New patients this month
      const { data: monthAppointments } = await supabase
        .from("appointments")
        .select("patient_id, created_at")
        .eq("professional_id", user.id)
        .gte("created_at", monthStart.toISOString());

      const newPatientsThisMonth = new Set((monthAppointments || []).map(a => a.patient_id)).size;

      // Fetch reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("target_id", user.id)
        .eq("target_type", "professional");

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Fetch affiliate sales for revenue
      const { data: formations } = await supabase
        .from("formations")
        .select("id")
        .eq("author_id", user.id);

      const formationIds = (formations || []).map(f => f.id);
      
      let monthlyRevenue = 0;
      if (formationIds.length > 0) {
        const { data: sales } = await supabase
          .from("affiliate_sales")
          .select("sale_amount")
          .in("formation_id", formationIds)
          .gte("created_at", monthStart.toISOString());
        
        monthlyRevenue = (sales || []).reduce((sum, s) => sum + (s.sale_amount || 0), 0);
      }

      const todaySchedule = (todayAppointments || []).map((apt: any) => ({
        id: apt.id,
        patient_name: apt.patient?.full_name || "Patient",
        scheduled_at: apt.scheduled_at,
        type: apt.type || "Consultation",
        status: apt.status,
      }));

      return {
        todayAppointments: todayAppointments?.length || 0,
        confirmedToday,
        pendingToday,
        activePatients: uniquePatients.size,
        newPatientsThisMonth,
        monthlyRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewsCount: reviews?.length || 0,
        todaySchedule,
      };
    },
    enabled: !!user,
  });
};

// Admin dashboard data
export interface AdminDashboardData {
  totalUsers: number;
  newUsersThisWeek: number;
  professionalsActive: number;
  pendingProfessionals: number;
  totalFormations: number;
  newFormationsThisMonth: number;
  platformRevenue: number;
  pendingUpgradeRequests: number;
  pendingServices: number;
  pendingFormations: number;
  pendingReports: number;
  recentActivity: {
    text: string;
    time: string;
  }[];
}

export const useAdminDashboard = () => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async (): Promise<AdminDashboardData> => {
      const now = new Date();
      const weekStart = subDays(now, 7);
      const monthStart = startOfMonth(now);

      // Fetch user roles count
      const { data: allRoles, count: totalUsers } = await supabase
        .from("user_roles")
        .select("role, created_at", { count: "exact" });

      const newUsersThisWeek = (allRoles || []).filter(
        r => new Date(r.created_at || "") >= weekStart
      ).length;

      const professionalsActive = (allRoles || []).filter(r => r.role === "professional").length;

      // Fetch formations
      const { data: formations } = await supabase
        .from("formations")
        .select("status, created_at");

      const pendingFormations = (formations || []).filter(f => f.status === "pending").length;
      const newFormationsThisMonth = (formations || []).filter(
        f => new Date(f.created_at) >= monthStart
      ).length;

      // Fetch services
      const { data: services } = await supabase
        .from("services")
        .select("status");

      const pendingServices = (services || []).filter(s => s.status === "pending").length;

      // Fetch affiliate sales for platform revenue
      const { data: sales } = await supabase
        .from("affiliate_sales")
        .select("commission_amount")
        .gte("created_at", monthStart.toISOString());

      const platformRevenue = (sales || []).reduce(
        (sum, s) => sum + (s.commission_amount || 0), 0
      );

      // Fetch recent profiles for activity
      const { data: recentProfiles } = await supabase
        .from("profiles")
        .select("full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      const recentActivity = (recentProfiles || []).map(p => ({
        text: `Nouveau membre: ${p.full_name || "Utilisateur"}`,
        time: format(new Date(p.created_at || ""), "dd MMM, HH:mm", { locale: fr }),
      }));

      return {
        totalUsers: totalUsers || 0,
        newUsersThisWeek,
        professionalsActive,
        pendingProfessionals: 0, // Would need upgrade requests table
        totalFormations: formations?.length || 0,
        newFormationsThisMonth,
        platformRevenue,
        pendingUpgradeRequests: 0, // Placeholder
        pendingServices,
        pendingFormations,
        pendingReports: 0, // Placeholder
        recentActivity,
      };
    },
    enabled: !!user && role === "admin",
  });
};
