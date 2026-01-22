import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, CheckCircle, XCircle, Clock, Eye, 
  GraduationCap, Briefcase, Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  useUpgradeRequests, 
  useProcessUpgradeRequest,
  useUpgradeRequestStats 
} from "@/hooks/useUpgradeRequests";

export default function UpgradeRequests() {
  const { data: requests, isLoading } = useUpgradeRequests();
  const { data: stats, isLoading: isLoadingStats } = useUpgradeRequestStats();
  const processRequest = useProcessUpgradeRequest();

  const handleApprove = (id: string) => {
    processRequest.mutate({ requestId: id, status: "approved" });
  };

  const handleReject = (id: string) => {
    processRequest.mutate({ 
      requestId: id, 
      status: "rejected",
      rejectionReason: "Critères non remplis" 
    });
  };

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const processedRequests = requests?.filter(r => r.status !== 'pending').slice(0, 5) || [];

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
              {isLoadingStats ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              )}
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
              {isLoadingStats ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{stats?.approvedThisMonth || 0}</p>
              )}
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
              {isLoadingStats ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{stats?.rejectedThisMonth || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Refusées ce mois</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Demandes en attente</h2>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={request.user?.avatar_url || undefined} />
                      <AvatarFallback className="bg-purple-100">
                        <GraduationCap className="h-7 w-7 text-purple-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">
                          {request.user?.full_name || "Utilisateur"}
                        </p>
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Briefcase className="h-3 w-3 inline mr-1" />
                        {request.specialty} • {request.experience_years} ans d'expérience
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{request.experience_years}</p>
                      <p className="text-muted-foreground">Années exp.</p>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "dd MMM yyyy", { locale: fr })}
                      </p>
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
                      onClick={() => handleReject(request.id)}
                      disabled={processRequest.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Refuser
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApprove(request.id)}
                      disabled={processRequest.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approuver
                    </Button>
                  </div>
                </div>

                {/* Motivation preview */}
                {request.motivation && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      <span className="font-medium">Motivation:</span> {request.motivation}
                    </p>
                  </div>
                )}
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
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.user?.avatar_url || undefined} />
                  <AvatarFallback className={request.status === "approved" ? "bg-green-100" : "bg-red-100"}>
                    {request.status === "approved" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{request.user?.full_name || "Utilisateur"}</p>
                  <p className="text-sm text-muted-foreground">{request.specialty}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="default" 
                    className={request.status === "approved" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                    }
                  >
                    {request.status === "approved" ? "Approuvé" : "Refusé"}
                  </Badge>
                  {request.processed_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(request.processed_at), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
