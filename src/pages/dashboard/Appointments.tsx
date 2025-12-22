import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, MapPin, MoreVertical, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserAppointments, UserAppointment } from "@/hooks/useUserAppointments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Appointments() {
  const { upcomingAppointments, pastAppointments, isLoading, cancelAppointment } = useUserAppointments("patient");

  if (isLoading) {
    return (
      <DashboardLayout title="Mes rendez-vous" description="Gérez vos consultations">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes rendez-vous" description="Gérez vos consultations">
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">À venir ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Historique ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  showActions 
                  onCancel={() => cancelAppointment.mutate(apt.id)}
                  displayType="professional"
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">Aucun rendez-vous à venir</p>
                  <p className="text-muted-foreground mb-4">Prenez rendez-vous avec un professionnel</p>
                  <Button asChild>
                    <Link to="/professionnels">Trouver un professionnel</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} displayType="professional" />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun rendez-vous passé</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function AppointmentCard({ 
  appointment, 
  showActions = false,
  onCancel,
  displayType = "professional"
}: { 
  appointment: UserAppointment;
  showActions?: boolean;
  onCancel?: () => void;
  displayType?: "professional" | "patient";
}) {
  const statusColors = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    confirmed: "Confirmé",
    pending: "En attente",
    completed: "Terminé",
    cancelled: "Annulé",
  };

  const displayProfile = displayType === "professional" ? appointment.professional : appointment.patient;
  const scheduledDate = new Date(appointment.scheduled_at);

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Professional/Patient Info */}
          <div className="flex items-center gap-4 flex-1">
            {displayProfile?.avatar_url ? (
              <img
                src={displayProfile.avatar_url}
                alt={displayProfile.full_name || ""}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">
                {displayProfile?.full_name || "Professionnel"}
              </p>
              <p className="text-sm text-muted-foreground">
                {displayProfile?.specialty || displayProfile?.email}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(scheduledDate, "EEEE d MMMM", { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(scheduledDate, "HH:mm")} ({formatDuration(appointment.duration_minutes)})</span>
            </div>
            <div className="flex items-center gap-2">
              {appointment.type === 'video' ? (
                <Video className="h-4 w-4 text-muted-foreground" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{appointment.type === 'video' ? 'Vidéo' : 'En personne'}</span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
            
            {showActions && appointment.status !== "cancelled" && appointment.status !== "completed" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {appointment.type === 'video' && appointment.status === "confirmed" && (
                    <DropdownMenuItem>Rejoindre la consultation</DropdownMenuItem>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        Annuler le rendez-vous
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le professionnel sera notifié de l'annulation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Non, garder</AlertDialogCancel>
                        <AlertDialogAction onClick={onCancel}>
                          Oui, annuler
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>
              {appointment.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}