import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Download, Ticket, Mail, Phone, MoreHorizontal, CheckCircle, XCircle, Clock, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmé", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const paymentStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Payé", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  refunded: { label: "Remboursé", variant: "outline" },
};

interface EventWithRegistrations {
  id: string;
  title: string;
  start_date: string;
  type: string;
  location: string | null;
  price: number;
  registrations: any[];
}

export default function EventParticipants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all registrations grouped by event
  const { data: eventsWithRegistrations, isLoading } = useQuery({
    queryKey: ["admin-events-with-registrations"],
    queryFn: async () => {
      // First fetch all events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, start_date, type, location, price")
        .order("start_date", { ascending: false });

      if (eventsError) throw eventsError;

      // Then fetch all registrations with profiles
      const { data: registrations, error: regsError } = await supabase
        .from("event_registrations")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order("registered_at", { ascending: false });

      if (regsError) throw regsError;

      // Group registrations by event
      const eventsMap = new Map<string, EventWithRegistrations>();
      
      events?.forEach(event => {
        eventsMap.set(event.id, {
          ...event,
          registrations: []
        });
      });

      registrations?.forEach(reg => {
        const eventData = eventsMap.get(reg.event_id);
        if (eventData) {
          eventData.registrations.push(reg);
        }
      });

      // Return only events with registrations, sorted by date
      return Array.from(eventsMap.values()).filter(e => e.registrations.length > 0);
    },
  });

  // Update registration status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events-with-registrations"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    },
  });

  // Update payment status
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: string }) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ payment_status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events-with-registrations"] });
      toast({ title: "Statut de paiement mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    },
  });

  const exportEventToCSV = (event: EventWithRegistrations) => {
    if (!event.registrations || event.registrations.length === 0) return;

    const headers = [
      "Numéro de ticket",
      "Nom complet",
      "Email",
      "Téléphone",
      "Statut inscription",
      "Statut paiement",
      "Date inscription"
    ];

    const rows = event.registrations.map((reg: any) => [
      reg.ticket_number,
      reg.profiles?.full_name || "N/A",
      reg.profiles?.email || "N/A",
      reg.profiles?.phone || "N/A",
      statusLabels[reg.status]?.label || reg.status,
      paymentStatusLabels[reg.payment_status]?.label || reg.payment_status,
      format(new Date(reg.registered_at), "dd/MM/yyyy HH:mm")
    ]);

    const eventInfo = [
      `Événement: ${event.title}`,
      `Date: ${format(new Date(event.start_date), "dd/MM/yyyy HH:mm")}`,
      `Lieu: ${event.location || "En ligne"}`,
      `Prix: ${event.price === 0 ? "Gratuit" : `${event.price} FCFA`}`,
      ""
    ];

    const csvContent = [
      ...eventInfo,
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const eventName = event.title.replace(/[^a-zA-Z0-9]/g, "-");
    link.download = `participants-${eventName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const exportAllToCSV = () => {
    if (!eventsWithRegistrations || eventsWithRegistrations.length === 0) return;

    const headers = [
      "Événement",
      "Date événement",
      "Lieu",
      "Prix",
      "Numéro de ticket",
      "Nom complet",
      "Email",
      "Téléphone",
      "Statut inscription",
      "Statut paiement",
      "Date inscription"
    ];

    const rows: string[][] = [];
    eventsWithRegistrations.forEach(event => {
      event.registrations.forEach((reg: any) => {
        rows.push([
          event.title,
          format(new Date(event.start_date), "dd/MM/yyyy HH:mm"),
          event.location || "En ligne",
          event.price === 0 ? "Gratuit" : `${event.price} FCFA`,
          reg.ticket_number,
          reg.profiles?.full_name || "N/A",
          reg.profiles?.email || "N/A",
          reg.profiles?.phone || "N/A",
          statusLabels[reg.status]?.label || reg.status,
          paymentStatusLabels[reg.payment_status]?.label || reg.payment_status,
          format(new Date(reg.registered_at), "dd/MM/yyyy HH:mm")
        ]);
      });
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tous-participants-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const totalRegistrations = eventsWithRegistrations?.reduce((acc, e) => acc + e.registrations.length, 0) || 0;
  const totalConfirmed = eventsWithRegistrations?.reduce((acc, e) => 
    acc + e.registrations.filter((r: any) => r.status === "confirmed").length, 0) || 0;
  const totalPending = eventsWithRegistrations?.reduce((acc, e) => 
    acc + e.registrations.filter((r: any) => r.status === "pending").length, 0) || 0;
  const totalPaid = eventsWithRegistrations?.reduce((acc, e) => 
    acc + e.registrations.filter((r: any) => r.payment_status === "paid").length, 0) || 0;

  return (
    <DashboardLayout 
      title="Participants aux événements" 
      description="Consultez et gérez les participants inscrits par événement"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total inscriptions</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalConfirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalPending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payés</CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalPaid}</div>
            </CardContent>
          </Card>
        </div>

        {/* Export All Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={exportAllToCSV}
            disabled={!eventsWithRegistrations || eventsWithRegistrations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter tout en CSV
          </Button>
        </div>

        {/* Events with Participants */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Chargement...</p>
            </CardContent>
          </Card>
        ) : eventsWithRegistrations && eventsWithRegistrations.length > 0 ? (
          <Accordion type="multiple" className="space-y-4">
            {eventsWithRegistrations.map((event) => {
              const confirmedCount = event.registrations.filter((r: any) => r.status === "confirmed").length;
              const paidCount = event.registrations.filter((r: any) => r.payment_status === "paid").length;
              
              return (
                <AccordionItem key={event.id} value={event.id} className="border rounded-lg bg-card">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.start_date), "dd MMM yyyy à HH:mm", { locale: fr })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.registrations.length} inscrit{event.registrations.length > 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="default" className="bg-green-600">
                          {confirmedCount} confirmé{confirmedCount > 1 ? "s" : ""}
                        </Badge>
                        {event.price > 0 && (
                          <Badge variant="outline">
                            {paidCount} payé{paidCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="flex justify-end mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportEventToCSV(event)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter cet événement
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Participant</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Paiement</TableHead>
                            <TableHead>Inscription</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.registrations.map((reg: any) => {
                            const statusInfo = statusLabels[reg.status] || statusLabels.pending;
                            const paymentInfo = paymentStatusLabels[reg.payment_status] || paymentStatusLabels.pending;
                            
                            return (
                              <TableRow key={reg.id}>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {reg.ticket_number}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {reg.profiles?.full_name || "Utilisateur inconnu"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {reg.profiles?.email && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">{reg.profiles.email}</span>
                                      </div>
                                    )}
                                    {reg.profiles?.phone && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <span>{reg.profiles.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(reg.registered_at), "dd/MM/yyyy", { locale: fr })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem 
                                        onClick={() => updateStatus.mutate({ id: reg.id, status: "confirmed" })}
                                        disabled={reg.status === "confirmed"}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                        Confirmer inscription
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => updateStatus.mutate({ id: reg.id, status: "pending" })}
                                        disabled={reg.status === "pending"}
                                      >
                                        <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                                        Mettre en attente
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => updateStatus.mutate({ id: reg.id, status: "cancelled" })}
                                        disabled={reg.status === "cancelled"}
                                        className="text-destructive"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Annuler inscription
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => updatePaymentStatus.mutate({ id: reg.id, payment_status: "paid" })}
                                        disabled={reg.payment_status === "paid"}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                                        Marquer comme payé
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => updatePaymentStatus.mutate({ id: reg.id, payment_status: "refunded" })}
                                        disabled={reg.payment_status === "refunded"}
                                      >
                                        <XCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                        Marquer comme remboursé
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun participant</h3>
                <p className="text-muted-foreground">
                  Aucune inscription aux événements pour le moment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
