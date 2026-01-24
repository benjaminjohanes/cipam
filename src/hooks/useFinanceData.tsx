import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  type: "formation" | "event" | "appointment" | "affiliation";
  amount: number;
  commission: number;
  status: string;
  payment_status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  item_title: string;
  professional_name?: string;
}

export interface FinanceStats {
  totalRevenue: number;
  totalCommissions: number;
  pendingPayments: number;
  completedPayments: number;
  formationsRevenue: number;
  eventsRevenue: number;
  appointmentsRevenue: number;
  affiliationsCommissions: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface RevenueByMonth {
  month: string;
  formations: number;
  events: number;
  appointments: number;
  affiliations: number;
  total: number;
}

export function useFinanceData(period: number = 30) {
  return useQuery({
    queryKey: ["admin-finance-data", period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      const startDateStr = startDate.toISOString();

      // Fetch all relevant data in parallel
      const [
        { data: affiliateSales, error: affiliateError },
        { data: eventRegistrations, error: eventError },
        { data: appointments, error: appointmentError },
        { data: formations, error: formationsError },
        { data: events, error: eventsError },
      ] = await Promise.all([
        supabase
          .from("affiliate_sales")
          .select(`
            *,
            buyer:profiles!affiliate_sales_buyer_id_fkey(full_name, email),
            affiliation:affiliations!affiliate_sales_affiliation_id_fkey(
              affiliate:profiles!affiliations_affiliate_id_fkey(full_name),
              formation:formations!affiliations_formation_id_fkey(title)
            )
          `)
          .gte("created_at", startDateStr)
          .order("created_at", { ascending: false }),
        supabase
          .from("event_registrations")
          .select(`
            *,
            user:profiles!event_registrations_user_id_fkey(full_name, email),
            event:events!event_registrations_event_id_fkey(title, price, organizer_id)
          `)
          .gte("created_at", startDateStr)
          .order("created_at", { ascending: false }),
        supabase
          .from("appointments")
          .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, email),
            professional:profiles!appointments_professional_id_fkey(full_name, consultation_rate),
            service:services!appointments_service_id_fkey(title, price)
          `)
          .gte("created_at", startDateStr)
          .order("created_at", { ascending: false }),
        supabase
          .from("formations")
          .select("id, title, price, author_id"),
        supabase
          .from("events")
          .select("id, title, price, organizer_id"),
      ]);

      if (affiliateError) throw affiliateError;
      if (eventError) throw eventError;
      if (appointmentError) throw appointmentError;

      // Build transactions list
      const transactions: Transaction[] = [];

      // Add affiliate sales
      affiliateSales?.forEach((sale) => {
        transactions.push({
          id: sale.id,
          type: "affiliation",
          amount: Number(sale.sale_amount) || 0,
          commission: Number(sale.commission_amount) || 0,
          status: sale.status,
          payment_status: sale.status === "paid" ? "paid" : "pending",
          created_at: sale.created_at,
          user_name: sale.buyer?.full_name || "Acheteur inconnu",
          user_email: sale.buyer?.email || "",
          item_title: sale.affiliation?.formation?.title || "Formation",
          professional_name: sale.affiliation?.affiliate?.full_name,
        });
      });

      // Add event registrations with payment
      eventRegistrations?.forEach((reg) => {
        const eventPrice = Number(reg.event?.price) || 0;
        if (eventPrice > 0) {
          transactions.push({
            id: reg.id,
            type: "event",
            amount: eventPrice,
            commission: 0,
            status: reg.status,
            payment_status: reg.payment_status,
            created_at: reg.created_at,
            user_name: reg.user?.full_name || "Participant inconnu",
            user_email: reg.user?.email || "",
            item_title: reg.event?.title || "Événement",
          });
        }
      });

      // Add appointments
      appointments?.forEach((apt) => {
        const price = Number(apt.service?.price) || Number(apt.professional?.consultation_rate) || 0;
        if (price > 0) {
          transactions.push({
            id: apt.id,
            type: "appointment",
            amount: price,
            commission: 0,
            status: apt.status,
            payment_status: apt.status === "completed" ? "paid" : "pending",
            created_at: apt.created_at,
            user_name: apt.patient?.full_name || "Patient inconnu",
            user_email: apt.patient?.email || "",
            item_title: apt.service?.title || "Consultation",
            professional_name: apt.professional?.full_name,
          });
        }
      });

      // Sort by date
      transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Calculate stats
      const stats: FinanceStats = {
        totalRevenue: 0,
        totalCommissions: 0,
        pendingPayments: 0,
        completedPayments: 0,
        formationsRevenue: 0,
        eventsRevenue: 0,
        appointmentsRevenue: 0,
        affiliationsCommissions: 0,
        transactionCount: transactions.length,
        averageTransaction: 0,
      };

      transactions.forEach((t) => {
        stats.totalRevenue += t.amount;
        stats.totalCommissions += t.commission;

        if (t.payment_status === "paid") {
          stats.completedPayments += t.amount;
        } else {
          stats.pendingPayments += t.amount;
        }

        switch (t.type) {
          case "formation":
          case "affiliation":
            stats.formationsRevenue += t.amount;
            stats.affiliationsCommissions += t.commission;
            break;
          case "event":
            stats.eventsRevenue += t.amount;
            break;
          case "appointment":
            stats.appointmentsRevenue += t.amount;
            break;
        }
      });

      stats.averageTransaction = transactions.length > 0 
        ? stats.totalRevenue / transactions.length 
        : 0;

      // Calculate revenue by month for charts
      const revenueByMonth: RevenueByMonth[] = [];
      const monthsMap = new Map<string, RevenueByMonth>();

      transactions.forEach((t) => {
        const date = new Date(t.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            month: monthKey,
            formations: 0,
            events: 0,
            appointments: 0,
            affiliations: 0,
            total: 0,
          });
        }

        const monthData = monthsMap.get(monthKey)!;
        monthData.total += t.amount;

        switch (t.type) {
          case "formation":
          case "affiliation":
            monthData.formations += t.amount;
            monthData.affiliations += t.commission;
            break;
          case "event":
            monthData.events += t.amount;
            break;
          case "appointment":
            monthData.appointments += t.amount;
            break;
        }
      });

      monthsMap.forEach((value) => revenueByMonth.push(value));
      revenueByMonth.sort((a, b) => a.month.localeCompare(b.month));

      return {
        transactions,
        stats,
        revenueByMonth,
      };
    },
  });
}
