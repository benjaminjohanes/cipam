import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Ticket, Calendar, Download, MapPin, Video, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";

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

export default function MyEventRegistrations() {
  const { user } = useAuth();

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["my-event-registrations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("event_registrations")
        .select(`
          *,
          events (
            id,
            title,
            description,
            type,
            location,
            online_link,
            start_date,
            end_date,
            price,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const exportToCSV = () => {
    if (!registrations || registrations.length === 0) return;

    const headers = [
      "Numéro de ticket",
      "Événement",
      "Type",
      "Date de l'événement",
      "Lieu",
      "Prix",
      "Statut inscription",
      "Statut paiement",
      "Date d'inscription"
    ];

    const rows = registrations.map((reg: any) => [
      reg.ticket_number,
      reg.events?.title || "N/A",
      reg.events?.type || "N/A",
      reg.events?.start_date ? format(new Date(reg.events.start_date), "dd/MM/yyyy HH:mm") : "N/A",
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
    link.download = `mes-inscriptions-evenements-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const upcomingEvents = registrations?.filter((reg: any) => 
    reg.events && new Date(reg.events.start_date) > new Date() && reg.status === "confirmed"
  ) || [];

  const pastEvents = registrations?.filter((reg: any) => 
    reg.events && new Date(reg.events.start_date) <= new Date()
  ) || [];

  return (
    <DashboardLayout 
      title="Mes inscriptions aux événements" 
      description="Consultez et gérez vos inscriptions aux événements"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{upcomingEvents.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements passés</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{pastEvents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={!registrations || registrations.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Mes inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : registrations && registrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Événement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg: any) => {
                    const statusInfo = statusLabels[reg.status] || statusLabels.pending;
                    const paymentInfo = paymentStatusLabels[reg.payment_status] || paymentStatusLabels.pending;
                    const isUpcoming = reg.events && new Date(reg.events.start_date) > new Date();
                    
                    return (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {reg.ticket_number}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{reg.events?.title || "Événement supprimé"}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            {reg.events?.type === "webinar" ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                            {reg.events?.type === "webinar" ? "Webinaire" : 
                             reg.events?.type === "in-person" ? "Présentiel" : 
                             reg.events?.type === "hybrid" ? "Hybride" : "Autre"}
                          </div>
                        </TableCell>
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
                          {reg.events?.location || (reg.events?.online_link ? "En ligne" : "N/A")}
                        </TableCell>
                        <TableCell>
                          {reg.events?.price === 0 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Gratuit</Badge>
                          ) : (
                            <span>{reg.events?.price?.toLocaleString()} FCFA</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {reg.events?.id && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/evenements/${reg.events.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {isUpcoming && reg.events?.online_link && reg.status === "confirmed" && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={reg.events.online_link} target="_blank" rel="noopener noreferrer">
                                  <Video className="h-4 w-4 mr-1" />
                                  Rejoindre
                                </a>
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
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune inscription</h3>
                <p className="text-muted-foreground mb-4">
                  Vous n'êtes inscrit à aucun événement pour le moment.
                </p>
                <Button asChild>
                  <Link to="/evenements">Découvrir les événements</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}