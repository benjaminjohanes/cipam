import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, Service } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";

export default function MyServices() {
  const { services, loading, addService, updateService, deleteService } = useServices(true);
  const { categories, loading: categoriesLoading } = useCategories('service');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
  });

  const openNewServiceDialog = () => {
    setEditingService(null);
    setFormData({ title: "", description: "", category_id: "", price: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || "",
      category_id: service.category_id || "",
      price: service.price.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }

    setSubmitting(true);
    
    if (editingService) {
      await updateService(editingService.id, {
        title: formData.title,
        description: formData.description || undefined,
        category_id: formData.category_id || undefined,
        price: Number(formData.price) || 0,
      });
    } else {
      await addService({
        title: formData.title,
        description: formData.description || undefined,
        category_id: formData.category_id || undefined,
        price: Number(formData.price) || 0,
      });
    }
    
    setSubmitting(false);
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteService(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Mes services" description="Gérez vos prestations et tarifs">
        <div className="space-y-6">
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mes services" description="Gérez vos prestations et tarifs">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewServiceDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? "Modifier le service" : "Créer un service"}</DialogTitle>
                <DialogDescription>
                  {editingService ? "Modifiez les informations du service" : "Ajoutez un nouveau service à votre catalogue"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du service *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Consultation individuelle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre service..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Chargement..." : "Sélectionnez une catégorie"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.is_active).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="80"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSubmit} disabled={submitting || !formData.title.trim()}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingService ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">Vous n'avez pas encore de services</p>
              <Button onClick={openNewServiceDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier service
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription>{service.categories?.name || "Non catégorisé"}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(service)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description || "Aucune description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">{service.price}€</p>
                      {getStatusBadge(service.status)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
