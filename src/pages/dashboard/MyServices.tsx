import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, EyeOff, MoreVertical } from "lucide-react";
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
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: "active" | "inactive" | "pending";
  bookings: number;
}

const mockServices: Service[] = [
  {
    id: "1",
    title: "Consultation individuelle",
    description: "Séance de consultation personnalisée pour accompagnement psychologique",
    category: "Consultation",
    price: 80,
    duration: 60,
    status: "active",
    bookings: 24,
  },
  {
    id: "2",
    title: "Thérapie de couple",
    description: "Accompagnement pour les couples en difficulté",
    category: "Thérapie",
    price: 120,
    duration: 90,
    status: "active",
    bookings: 8,
  },
  {
    id: "3",
    title: "Bilan psychologique",
    description: "Évaluation complète avec rapport détaillé",
    category: "Évaluation",
    price: 200,
    duration: 120,
    status: "pending",
    bookings: 0,
  },
];

export default function MyServices() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    duration: "60",
  });

  const openNewServiceDialog = () => {
    setEditingService(null);
    setFormData({ title: "", description: "", category: "", price: "", duration: "60" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      duration: service.duration.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingService) {
      setServices(prev => prev.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData, price: Number(formData.price), duration: Number(formData.duration) }
          : s
      ));
      toast.success("Service modifié avec succès");
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        status: "pending",
        bookings: 0,
      };
      setServices(prev => [...prev, newService]);
      toast.success("Service créé avec succès");
    }
    setIsDialogOpen(false);
  };

  const toggleServiceStatus = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id 
        ? { ...s, status: s.status === "active" ? "inactive" : "active" }
        : s
    ));
    toast.success("Statut du service modifié");
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success("Service supprimé");
  };

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

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
                  <Label htmlFor="title">Titre du service</Label>
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
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Thérapie">Thérapie</SelectItem>
                      <SelectItem value="Évaluation">Évaluation</SelectItem>
                      <SelectItem value="Coaching">Coaching</SelectItem>
                      <SelectItem value="Formation">Formation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (min)</Label>
                    <Select value={formData.duration} onValueChange={(v) => setFormData(prev => ({ ...prev, duration: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="90">1h30</SelectItem>
                        <SelectItem value="120">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSubmit}>{editingService ? "Enregistrer" : "Créer"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                      <CardDescription>{service.category}</CardDescription>
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
                        <DropdownMenuItem onClick={() => toggleServiceStatus(service.id)}>
                          {service.status === "active" ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-primary">{service.price}€</p>
                      <p className="text-xs text-muted-foreground">{service.duration} min</p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(service.status)}
                      <p className="text-xs text-muted-foreground">{service.bookings} réservations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
