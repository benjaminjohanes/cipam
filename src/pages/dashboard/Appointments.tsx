import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, MapPin, MoreVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const upcomingAppointments = [
  {
    id: 1,
    professional: "Dr. Marie Dupont",
    specialty: "Psychologue clinicienne",
    date: "2024-01-22",
    time: "14:00",
    duration: "1h",
    type: "video",
    status: "confirmed",
  },
  {
    id: 2,
    professional: "Dr. Jean Martin",
    specialty: "Psychothérapeute",
    date: "2024-01-25",
    time: "10:30",
    duration: "45min",
    type: "in-person",
    status: "pending",
  },
];

const pastAppointments = [
  {
    id: 3,
    professional: "Dr. Marie Dupont",
    specialty: "Psychologue clinicienne",
    date: "2024-01-15",
    time: "14:00",
    duration: "1h",
    type: "video",
    status: "completed",
  },
  {
    id: 4,
    professional: "Dr. Sophie Lambert",
    specialty: "Neuropsychologue",
    date: "2024-01-10",
    time: "09:00",
    duration: "1h30",
    type: "in-person",
    status: "completed",
  },
];

export default function Appointments() {
  return (
    <DashboardLayout title="Mes rendez-vous" description="Gérez vos consultations">
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} showActions />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">Aucun rendez-vous à venir</p>
                  <p className="text-muted-foreground mb-4">Prenez rendez-vous avec un professionnel</p>
                  <Button>Trouver un professionnel</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function AppointmentCard({ 
  appointment, 
  showActions = false 
}: { 
  appointment: typeof upcomingAppointments[0];
  showActions?: boolean;
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Professional Info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{appointment.professional}</p>
              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(appointment.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time} ({appointment.duration})</span>
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
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[appointment.status as keyof typeof statusColors]}`}>
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </span>
            
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {appointment.type === 'video' && (
                    <DropdownMenuItem>Rejoindre la consultation</DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Reprogrammer</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Annuler</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
