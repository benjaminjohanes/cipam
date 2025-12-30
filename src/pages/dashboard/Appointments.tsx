import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, MapPin, MoreVertical, Loader2, Check, X, CheckCircle } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Appointments() {
  const { role } = useAuth();
  const isProfessional = role === "professional" || role === "admin";
  
  const { 
    upcomingAppointments, 
    pastAppointments, 
    isLoading, 
    cancelAppointment,
    updateStatus 
  } = useUserAppointments(isProfessional ? "professional" : "patient");

  if (isLoading) {
    return (
      <DashboardLayout title="Mes rendez-vous" description="Gérez vos consultations">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const pendingAppointments = upcomingAppointments.filter(a => a.status === "pending");
  const confirmedAppointments = upcomingAppointments.filter(a => a.status === "confirmed");

  return (
    <DashboardLayout 
      title={isProfessional ? "Gestion des rendez-vous" : "Mes rendez-vous"} 
      description={isProfessional ? "Gérez les rendez-vous de vos usagers" : "Gérez vos consultations"}
    >
      <Tabs defaultValue={isProfessional && pendingAppointments.length > 0 ? "pending" : "upcoming"} className="space-y-6">
        <TabsList>
          {isProfessional && (
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingAppointments.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingAppointments.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="upcoming">
            {isProfessional ? "Confirmés" : "À venir"} ({isProfessional ? confirmedAppointments.length : upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">Historique ({pastAppointments.length})</TabsTrigger>
        </TabsList>

        {isProfessional && (
          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map((apt) => (
                  <AppointmentCard 
                    key={apt.id} 
                    appointment={apt} 
                    showActions 
                    isProfessional
                    onConfirm={() => updateStatus.mutate({ id: apt.id, status: "confirmed" })}
                    onReject={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}
                    displayType="patient"
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground">Aucune demande en attente</p>
                    <p className="text-muted-foreground">Vous n'avez pas de nouvelles demandes de rendez-vous</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {(isProfessional ? confirmedAppointments : upcomingAppointments).length > 0 ? (
              (isProfessional ? confirmedAppointments : upcomingAppointments).map((apt) => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  showActions 
                  isProfessional={isProfessional}
                  onCancel={() => cancelAppointment.mutate(apt.id)}
                  onComplete={() => updateStatus.mutate({ id: apt.id, status: "completed" })}
                  displayType={isProfessional ? "patient" : "professional"}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    {isProfessional ? "Aucun rendez-vous confirmé" : "Aucun rendez-vous à venir"}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {isProfessional 
                      ? "Vous n'avez pas de rendez-vous confirmés prochainement" 
                      : "Prenez rendez-vous avec un professionnel"}
                  </p>
                  {!isProfessional && (
                    <Button asChild>
                      <Link to="/professionnels">Trouver un professionnel</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((apt) => (
                <AppointmentCard 
                  key={apt.id} 
                  appointment={apt} 
                  displayType={isProfessional ? "patient" : "professional"} 
                />
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
  isProfessional = false,
  onCancel,
  onConfirm,
  onReject,
  onComplete,
  displayType = "professional"
}: { 
  appointment: UserAppointment;
  showActions?: boolean;
  isProfessional?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
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
                {displayProfile?.full_name || (displayType === "professional" ? "Professionnel" : "Usager")}
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
            
            {/* Professional pending actions - Quick buttons */}
            {showActions && isProfessional && appointment.status === "pending" && (
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={onConfirm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirmer
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <X className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Refuser ce rendez-vous ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Le patient sera notifié que sa demande a été refusée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={onReject}>
                        Confirmer le refus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Other actions via dropdown */}
            {showActions && appointment.status !== "cancelled" && appointment.status !== "completed" && appointment.status !== "pending" && (
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
                  
                  {/* Mark as completed - Professional only */}
                  {isProfessional && appointment.status === "confirmed" && (
                    <DropdownMenuItem onClick={onComplete}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme terminé
                    </DropdownMenuItem>
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
                          Cette action est irréversible. {isProfessional ? "Le patient" : "Le professionnel"} sera notifié de l'annulation.
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

            {/* Patient pending - can only cancel */}
            {showActions && !isProfessional && appointment.status === "pending" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Annuler le rendez-vous ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Votre demande de rendez-vous sera annulée.
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
