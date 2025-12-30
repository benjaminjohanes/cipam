import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Edit, Trash2, Eye, Users, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface EventFormData {
  title: string;
  description: string;
  type: string;
  location: string;
  online_link: string;
  start_date: string;
  end_date: string;
  max_participants: string;
  price: string;
  status: string;
  image_url: string;
}

const initialFormData: EventFormData = {
  title: "",
  description: "",
  type: "webinar",
  location: "",
  online_link: "",
  start_date: "",
  end_date: "",
  max_participants: "",
  price: "0",
  status: "draft",
  image_url: "",
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  webinar: { label: "Webinaire", icon: <Video className="h-4 w-4" /> },
  "in-person": { label: "Présentiel", icon: <MapPin className="h-4 w-4" /> },
  hybrid: { label: "Hybride", icon: <Users className="h-4 w-4" /> },
  other: { label: "Autre", icon: <Calendar className="h-4 w-4" /> },
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  published: { label: "Publié", variant: "default" },
  cancelled: { label: "Annulé", variant: "destructive" },
  completed: { label: "Terminé", variant: "outline" },
};

export default function AllEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get registration counts
      const eventIds = (data || []).map(e => e.id);
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("event_id")
        .in("event_id", eventIds)
        .eq("status", "confirmed");

      const countMap = new Map<string, number>();
      (registrations || []).forEach(r => {
        countMap.set(r.event_id, (countMap.get(r.event_id) || 0) + 1);
      });

      return (data || []).map(event => ({
        ...event,
        registrations_count: countMap.get(event.id) || 0,
      }));
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: EventFormData) => {
      const { error } = await supabase.from("events").insert({
        title: data.title,
        description: data.description || null,
        type: data.type,
        location: data.location || null,
        online_link: data.online_link || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        max_participants: data.max_participants ? parseInt(data.max_participants) : null,
        price: parseFloat(data.price) || 0,
        status: data.status,
        image_url: data.image_url || null,
        organizer_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Événement créé avec succès" });
      setIsDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer l'événement", variant: "destructive" });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EventFormData }) => {
      const { error } = await supabase
        .from("events")
        .update({
          title: data.title,
          description: data.description || null,
          type: data.type,
          location: data.location || null,
          online_link: data.online_link || null,
          start_date: data.start_date,
          end_date: data.end_date || null,
          max_participants: data.max_participants ? parseInt(data.max_participants) : null,
          price: parseFloat(data.price) || 0,
          status: data.status,
          image_url: data.image_url || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Événement mis à jour" });
      setIsDialogOpen(false);
      setEditingEvent(null);
      setFormData(initialFormData);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast({ title: "Événement supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    },
  });

  const handleEdit = (event: any) => {
    setEditingEvent(event.id);
    setFormData({
      title: event.title,
      description: event.description || "",
      type: event.type,
      location: event.location || "",
      online_link: event.online_link || "",
      start_date: event.start_date ? event.start_date.slice(0, 16) : "",
      end_date: event.end_date ? event.end_date.slice(0, 16) : "",
      max_participants: event.max_participants?.toString() || "",
      price: event.price?.toString() || "0",
      status: event.status,
      image_url: event.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent, data: formData });
    } else {
      createEvent.mutate(formData);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEvent(null);
      setFormData(initialFormData);
    }
  };

  return (
    <DashboardLayout title="Gestion des événements" description="Créez et gérez les événements de la plateforme">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{events?.length || 0} événements</Badge>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Modifier l'événement" : "Créer un événement"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="webinar">Webinaire</SelectItem>
                          <SelectItem value="in-person">Présentiel</SelectItem>
                          <SelectItem value="hybrid">Hybride</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Statut *</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                          <SelectItem value="completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Date de début *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Date de fin</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Lieu (pour présentiel)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Adresse du lieu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="online_link">Lien en ligne (pour webinaire)</Label>
                    <Input
                      id="online_link"
                      value={formData.online_link}
                      onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Prix (FCFA)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">0 = Gratuit</p>
                    </div>
                    <div>
                      <Label htmlFor="max_participants">Nombre max de participants</Label>
                      <Input
                        id="max_participants"
                        type="number"
                        min="1"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                        placeholder="Illimité si vide"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image_url">URL de l'image</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                    {editingEvent ? "Mettre à jour" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Liste des événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : events && events.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Événement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Inscrits</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event: any) => {
                    const typeInfo = typeLabels[event.type] || typeLabels.other;
                    const statusInfo = statusLabels[event.status] || statusLabels.draft;
                    
                    return (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-medium">{event.title}</div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">{event.location}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {typeInfo.icon}
                            <span className="text-sm">{typeInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(event.start_date), "dd MMM yyyy", { locale: fr })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(event.start_date), "HH:mm", { locale: fr })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.price === 0 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Gratuit</Badge>
                          ) : (
                            <span>{event.price.toLocaleString()} FCFA</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{event.registrations_count}</span>
                            {event.max_participants && (
                              <span className="text-muted-foreground">/ {event.max_participants}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/evenements/${event.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action est irréversible. Toutes les inscriptions seront également supprimées.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteEvent.mutate(event.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun événement créé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}