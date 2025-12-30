import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Download, Ticket, Mail, Phone, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
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

export default function EventParticipants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string>("all");

  // Fetch all events
  const { data: events } = useQuery({
    queryKey: ["admin-events-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_date")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch registrations with profiles
  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-event-registrations", selectedEventId],
    queryFn: async () => {
      let query = supabase
        .from("event_registrations")
        .select(`
          *,
          events (
            id,
            title,
            start_date,
            type,
            location,
            price
          ),
          profiles:user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order("registered_at", { ascending: false });

      if (selectedEventId !== "all") {
        query = query.eq("event_id", selectedEventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
      queryClient.invalidateQueries({ queryKey: ["admin-event-registrations"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-event-registrations"] });
      toast({ title: "Statut de paiement mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    },
  });

  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) return;

    const headers = [
      "Numéro de ticket",
      "Nom complet",
      "Email",
      "Téléphone",
      "Événement",
      "Date événement",
      "Type",
      "Lieu",
      "Prix",
      "Statut inscription",
      "Statut paiement",
      "Date inscription"
    ];

    const rows = registrations.map((reg: any) => [
      reg.ticket_number,
      reg.profiles?.full_name || "N/A",
      reg.profiles?.email || "N/A",
      reg.profiles?.phone || "N/A",
      reg.events?.title || "N/A",
      reg.events?.start_date ? format(new Date(reg.events.start_date), "dd/MM/yyyy HH:mm") : "N/A",
      reg.events?.type || "N/A",
      reg.events?.location || "En ligne",
      reg.events?.price === 0 ? "Gratuit" : `${reg.events?.price} FCFA`,
      statusLabels[reg.status]?.label || reg.status,
      paymentStatusLabels[reg.payment_status]?.label || reg.payment_status,
      format(new Date(reg.registered_at), "dd/MM/yyyy HH:mm")
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const eventName = selectedEventId !== "all" 
      ? events?.find(e => e.id === selectedEventId)?.title?.replace(/[^a-zA-Z0-9]/g, "-") || "evenement"
      : "tous-evenements";
    
    link.download = `participants-${eventName}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const confirmedCount = registrations?.filter((r: any) => r.status === "confirmed").length || 0;
  const pendingCount = registrations?.filter((r: any) => r.status === "pending").length || 0;
  const paidCount = registrations?.filter((r: any) => r.payment_status === "paid").length || 0;

  const selectedEvent = selectedEventId !== "all" ? events?.find(e => e.id === selectedEventId) : null;

  return (
    <DashboardLayout 
      title="Participants aux événements" 
      description={selectedEvent ? `Participants de: ${selectedEvent.title}` : "Consultez et gérez les participants inscrits"}
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
              <div className="text-2xl font-bold">{registrations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payés</CardTitle>
              <Ticket className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{paidCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-96">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les événements</SelectItem>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {format(new Date(event.start_date), "dd MMM yyyy", { locale: fr })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={!registrations || registrations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>
        </div>

        {/* Participants Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des participants
              {selectedEvent && (
                <Badge variant="outline" className="ml-2">
                  {selectedEvent.title}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : registrations && registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Contact</TableHead>
                      {selectedEventId === "all" && <TableHead>Événement</TableHead>}
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg: any) => {
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
                          {selectedEventId === "all" && (
                            <TableCell>
                              <div className="font-medium">{reg.events?.title || "N/A"}</div>
                              {reg.events?.location && (
                                <div className="text-xs text-muted-foreground">{reg.events.location}</div>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            {reg.events?.start_date ? (
                              <div>
                                <div className="text-sm">
                                  {format(new Date(reg.events.start_date), "dd MMM yyyy", { locale: fr })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(reg.events.start_date), "HH:mm", { locale: fr })}
                                </div>
                              </div>
                            ) : "N/A"}
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
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun participant</h3>
                <p className="text-muted-foreground">
                  {selectedEventId !== "all" 
                    ? "Aucun participant inscrit à cet événement."
                    : "Aucune inscription aux événements pour le moment."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}