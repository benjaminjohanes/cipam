import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfMonth, subMonths, format, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { fr } from "date-fns/locale";

export interface StatsData {
  // Summary metrics
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  
  // Formation stats
  totalFormations: number;
  publishedFormations: number;
  
  // Revenue (from affiliate sales for now)
  totalRevenue: number;
  
  // Charts data
  appointmentsByDay: { date: string; confirmed: number; cancelled: number; completed: number; pending: number }[];
  appointmentsByStatus: { name: string; value: number; fill: string }[];
  revenueByMonth: { month: string; revenue: number }[];
  formationsByLevel: { name: string; value: number; fill: string }[];
}

export const useStats = (period: number = 30) => {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["user-stats", user?.id, role, period],
    queryFn: async (): Promise<StatsData> => {
      if (!user) throw new Error("Not authenticated");

      const now = new Date();
      const startDate = subMonths(now, period / 30);
      
      // Determine query filter based on role
      const isProfessional = role === "professional";
      const isAdmin = role === "admin";

      // Fetch appointments
      let appointmentsQuery = supabase
        .from("appointments")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (isProfessional) {
        appointmentsQuery = appointmentsQuery.eq("professional_id", user.id);
      } else if (!isAdmin) {
        appointmentsQuery = appointmentsQuery.eq("patient_id", user.id);
      }

      const { data: appointments } = await appointmentsQuery;
      const appointmentsList = appointments || [];

      // Fetch formations
      let formationsQuery = supabase.from("formations").select("*");
      if (isProfessional) {
        formationsQuery = formationsQuery.eq("author_id", user.id);
      }
      const { data: formations } = await formationsQuery;
      const formationsList = formations || [];

      // Fetch affiliate sales for revenue
      let salesQuery = supabase
        .from("affiliate_sales")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (isProfessional) {
        // Get formations by this professional
        const formationIds = formationsList.map((f) => f.id);
        if (formationIds.length > 0) {
          salesQuery = salesQuery.in("formation_id", formationIds);
        } else {
          salesQuery = salesQuery.eq("formation_id", "none");
        }
      }
      
      const { data: sales } = await salesQuery;
      const salesList = sales || [];

      // Calculate summary metrics
      const totalAppointments = appointmentsList.length;
      const confirmedAppointments = appointmentsList.filter((a) => a.status === "confirmed").length;
      const cancelledAppointments = appointmentsList.filter((a) => a.status === "cancelled").length;
      const completedAppointments = appointmentsList.filter((a) => a.status === "completed").length;
      const pendingAppointments = appointmentsList.filter((a) => a.status === "pending").length;

      const totalFormations = formationsList.length;
      const publishedFormations = formationsList.filter((f) => f.status === "published").length;

      const totalRevenue = salesList.reduce((sum, s) => sum + (s.sale_amount || 0), 0);

      // Generate appointments by day for the last 30 days
      const last30Days = eachDayOfInterval({
        start: subMonths(now, 1),
        end: now,
      });

      const appointmentsByDay = last30Days.map((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const dayAppointments = appointmentsList.filter((a) => {
          const date = new Date(a.scheduled_at);
          return date >= dayStart && date <= dayEnd;
        });

        return {
          date: format(day, "dd MMM", { locale: fr }),
          confirmed: dayAppointments.filter((a) => a.status === "confirmed").length,
          cancelled: dayAppointments.filter((a) => a.status === "cancelled").length,
          completed: dayAppointments.filter((a) => a.status === "completed").length,
          pending: dayAppointments.filter((a) => a.status === "pending").length,
        };
      });

      // Appointments by status for pie chart
      const appointmentsByStatus = [
        { name: "Confirmés", value: confirmedAppointments, fill: "hsl(var(--chart-1))" },
        { name: "Terminés", value: completedAppointments, fill: "hsl(var(--chart-2))" },
        { name: "En attente", value: pendingAppointments, fill: "hsl(var(--chart-3))" },
        { name: "Annulés", value: cancelledAppointments, fill: "hsl(var(--chart-4))" },
      ].filter((item) => item.value > 0);

      // Revenue by month (last 6 months)
      const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
        const monthDate = subMonths(now, 5 - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = startOfMonth(subMonths(monthDate, -1));
        
        const monthSales = salesList.filter((s) => {
          const date = new Date(s.created_at || "");
          return date >= monthStart && date < monthEnd;
        });

        return {
          month: format(monthDate, "MMM yyyy", { locale: fr }),
          revenue: monthSales.reduce((sum, s) => sum + (s.sale_amount || 0), 0),
        };
      });

      // Formations by level for pie chart
      const levelCounts = formationsList.reduce((acc, f) => {
        const level = f.level || "débutant";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const levelColors: Record<string, string> = {
        débutant: "hsl(var(--chart-1))",
        intermédiaire: "hsl(var(--chart-2))",
        avancé: "hsl(var(--chart-3))",
      };

      const formationsByLevel = Object.entries(levelCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: levelColors[name] || "hsl(var(--chart-5))",
      }));

      return {
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        pendingAppointments,
        totalFormations,
        publishedFormations,
        totalRevenue,
        appointmentsByDay,
        appointmentsByStatus,
        revenueByMonth,
        formationsByLevel,
      };
    },
    enabled: !!user,
  });
};
