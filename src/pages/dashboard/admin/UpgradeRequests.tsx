import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, CheckCircle, XCircle, Clock, Eye, 
  GraduationCap, Briefcase, FileText, Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const upgradeRequests = [
  {
    id: 1,
    studentName: "Pierre Durand",
    email: "pierre@email.com",
    specialty: "Psychologie clinique",
    experience: "3 ans",
    submittedAt: "2024-01-18",
    status: "pending",
    servicesApproved: 4,
    formationsCompleted: 5,
    rating: 4.7,
  },
  {
    id: 2,
    studentName: "Claire Moreau",
    email: "claire@email.com",
    specialty: "Coaching personnel",
    experience: "2 ans",
    submittedAt: "2024-01-16",
    status: "pending",
    servicesApproved: 3,
    formationsCompleted: 4,
    rating: 4.9,
  },
  {
    id: 3,
    studentName: "Lucas Bernard",
    email: "lucas@email.com",
    specialty: "Psychothérapie",
    experience: "5 ans",
    submittedAt: "2024-01-14",
    status: "approved",
    servicesApproved: 6,
    formationsCompleted: 8,
    rating: 4.8,
  },
];

export default function UpgradeRequests() {
  const { toast } = useToast();

  const handleApprove = (id: number, name: string) => {
    toast({
      title: "Demande approuvée",
      description: `${name} a été promu au statut professionnel.`,
    });
  };

  const handleReject = (id: number, name: string) => {
    toast({
      title: "Demande refusée",
      description: `La demande de ${name} a été refusée.`,
      variant: "destructive",
    });
  };

  const pendingRequests = upgradeRequests.filter(r => r.status === 'pending');
  const processedRequests = upgradeRequests.filter(r => r.status !== 'pending');

  return (
    <DashboardLayout title="Demandes d'upgrade" description="Validez les passages au statut professionnel">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-muted-foreground">Approuvées ce mois</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Refusées ce mois</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Demandes en attente</h2>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{request.studentName}</p>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Briefcase className="h-3 w-3 inline mr-1" />
                        {request.specialty} • {request.experience} d'expérience
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{request.servicesApproved}</p>
                      <p className="text-muted-foreground">Services</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{request.formationsCompleted}</p>
                      <p className="text-muted-foreground">Formations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{request.rating}</p>
                      <p className="text-muted-foreground">Note</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir dossier
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleReject(request.id, request.studentName)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApprove(request.id, request.studentName)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Aucune demande en attente</p>
              <p className="text-muted-foreground">Les nouvelles demandes apparaîtront ici</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Demandes traitées récemment</h2>
          {processedRequests.map((request) => (
            <Card key={request.id} className="opacity-75">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{request.studentName}</p>
                  <p className="text-sm text-muted-foreground">{request.specialty}</p>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-700">
                  Approuvé
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
