import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Plus, Edit, Trash2, Eye, Users, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useFormations } from "@/hooks/useFormations";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useState } from "react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approuvée</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejetée</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MyFormations() {
  const { formations, loading, deleteFormation } = useFormations(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteFormation(id);
    setDeletingId(null);
  };

  const approvedFormations = formations.filter(f => f.status === 'approved');
  const pendingFormations = formations.filter(f => f.status === 'pending');
  const rejectedFormations = formations.filter(f => f.status === 'rejected');

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratuit";
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const renderFormationCard = (formation: typeof formations[0]) => (
    <Card key={formation.id} className="overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {formation.image_url ? (
          <img 
            src={formation.image_url} 
            alt={formation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(formation.status)}
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">{formation.title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {formation.description || "Aucune description"}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formation.duration || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{formation.modules_count || 0} modules</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-primary">{formatPrice(formation.price)}</span>
          {formation.categories && (
            <Badge variant="outline">{formation.categories.name}</Badge>
          )}
        </div>

        <div className="flex gap-2">
          {formation.status === 'approved' && (
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link to={`/formations/${formation.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to={`/dashboard/edit-formation/${formation.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                {deletingId === formation.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. La formation "{formation.title}" et tous ses modules seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => handleDelete(formation.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message: string) => (
    <Card>
      <CardContent className="p-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout title="Mes formations" description="Gérez vos formations créées">
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({formations.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvées ({approvedFormations.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({pendingFormations.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejetées ({rejectedFormations.length})
            </TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to="/dashboard/create-formation">
              <Plus className="h-4 w-4 mr-2" />
              Créer une formation
            </Link>
          </Button>
        </div>

        <TabsContent value="all">
          {loading ? renderLoadingState() : (
            formations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formations.map(renderFormationCard)}
              </div>
            ) : renderEmptyState("Vous n'avez pas encore créé de formation.")
          )}
        </TabsContent>

        <TabsContent value="approved">
          {loading ? renderLoadingState() : (
            approvedFormations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedFormations.map(renderFormationCard)}
              </div>
            ) : renderEmptyState("Aucune formation approuvée.")
          )}
        </TabsContent>

        <TabsContent value="pending">
          {loading ? renderLoadingState() : (
            pendingFormations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingFormations.map(renderFormationCard)}
              </div>
            ) : renderEmptyState("Aucune formation en attente de validation.")
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {loading ? renderLoadingState() : (
            rejectedFormations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rejectedFormations.map(renderFormationCard)}
              </div>
            ) : renderEmptyState("Aucune formation rejetée.")
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
