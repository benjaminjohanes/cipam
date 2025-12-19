import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Check, X, Eye, MoreVertical } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  provider: string;
  providerType: "student" | "professional";
  category: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  description: string;
}

const mockServices: Service[] = [
  {
    id: "1",
    title: "Accompagnement scolaire en maths",
    provider: "Lucas Martin",
    providerType: "student",
    category: "Soutien scolaire",
    price: 25,
    status: "pending",
    submittedAt: "2024-01-15",
    description: "Aide aux devoirs et préparation aux examens pour collégiens et lycéens.",
  },
  {
    id: "2",
    title: "Coaching en développement personnel",
    provider: "Dr. Sophie Bernard",
    providerType: "professional",
    category: "Coaching",
    price: 80,
    status: "pending",
    submittedAt: "2024-01-14",
    description: "Accompagnement personnalisé pour atteindre vos objectifs de vie.",
  },
  {
    id: "3",
    title: "Cours de méditation",
    provider: "Emma Petit",
    providerType: "student",
    category: "Bien-être",
    price: 30,
    status: "approved",
    submittedAt: "2024-01-10",
    description: "Initiation à la méditation pleine conscience.",
  },
];

export default function AllServices() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: "approved" } : s));
    toast.success("Service approuvé");
    setIsDetailOpen(false);
  };

  const handleReject = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, status: "rejected" } : s));
    toast.success("Service refusé");
    setIsDetailOpen(false);
    setRejectionReason("");
  };

  const openDetail = (service: Service) => {
    setSelectedService(service);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: Service["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive">Refusé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  const pendingCount = services.filter(s => s.status === "pending").length;

  return (
    <DashboardLayout title="Gestion des services" description="Validez les services proposés">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approuvés</p>
              <p className="text-2xl font-bold text-green-600">
                {services.filter(s => s.status === "approved").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Refusés</p>
              <p className="text-2xl font-bold text-red-600">
                {services.filter(s => s.status === "rejected").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un service..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Prestataire</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell>
                      <div>
                        <p>{service.provider}</p>
                        <p className="text-xs text-muted-foreground">
                          {service.providerType === "student" ? "Étudiant" : "Professionnel"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.price}€</TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{new Date(service.submittedAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(service)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          {service.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(service.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openDetail(service)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Refuser
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            {selectedService && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedService.title}</DialogTitle>
                  <DialogDescription>
                    Proposé par {selectedService.provider}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Catégorie</p>
                      <p className="text-sm text-muted-foreground">{selectedService.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Prix</p>
                      <p className="text-sm text-muted-foreground">{selectedService.price}€</p>
                    </div>
                  </div>
                  
                  {selectedService.status === "pending" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Motif de refus (optionnel)</p>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Expliquez pourquoi ce service ne peut pas être approuvé..."
                      />
                    </div>
                  )}
                </div>
                {selectedService.status === "pending" && (
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleReject(selectedService.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                    <Button onClick={() => handleApprove(selectedService.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  </DialogFooter>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
