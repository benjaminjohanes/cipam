import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, MoreVertical, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { useServices, ServiceInsert } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { useNavigate } from "react-router-dom";

export default function MyServices() {
  const navigate = useNavigate();
  const { services, loading, addService, updateService, deleteService } = useServices(true);
  const { categories } = useCategories("service");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ServiceInsert & { id?: string }>({
    title: "",
    description: "",
    category_id: "",
    price: 0,
    image_url: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      price: 0,
      image_url: "",
    });
    setIsEditing(false);
    setSelectedServiceId(null);
  };

  const openNewServiceDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (service: typeof services[0]) => {
    setFormData({
      id: service.id,
      title: service.title,
      description: service.description || "",
      category_id: service.category_id || "",
      price: service.price,
      image_url: service.image_url || "",
    });
    setIsEditing(true);
    setSelectedServiceId(service.id);
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setSelectedServiceId(id);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditing && selectedServiceId) {
        await updateService(selectedServiceId, {
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || undefined,
          price: formData.price,
          image_url: formData.image_url,
        });
      } else {
        await addService({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || undefined,
          price: formData.price,
          image_url: formData.image_url,
        });
      }
      setDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedServiceId) {
      await deleteService(selectedServiceId);
      setDeleteDialogOpen(false);
      setSelectedServiceId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Mes services" description="Gérez vos services proposés">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes services" description="Gérez vos services proposés">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={openNewServiceDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau service
          </Button>
        </div>

        {services.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Aucun service</h3>
                  <p className="text-muted-foreground">
                    Vous n'avez pas encore créé de service
                  </p>
                </div>
                <Button onClick={openNewServiceDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier service
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  {service.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-1">{service.title}</CardTitle>
                      <CardDescription>
                        {service.categories?.name || "Sans catégorie"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {service.status === "approved" && (
                          <DropdownMenuItem onClick={() => navigate(`/services/${service.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEditDialog(service)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDeleteDialog(service.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description || "Aucune description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {service.price.toLocaleString()} FCFA
                      </span>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Modifiez les informations de votre service"
                : "Créez un nouveau service à proposer"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du service *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Accompagnement scolaire en mathématiques"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez votre service en détail..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, category_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                  }
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image du service</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                bucket="services"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : isEditing
                  ? "Enregistrer"
                  : "Créer le service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le service sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
