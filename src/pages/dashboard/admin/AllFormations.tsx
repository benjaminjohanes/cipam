import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Check, X, Eye, MoreVertical, BookOpen } from "lucide-react";
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

interface Formation {
  id: string;
  title: string;
  author: string;
  category: string;
  level: string;
  price: number;
  modules: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  description: string;
}

const mockFormations: Formation[] = [
  {
    id: "1",
    title: "Gestion du stress au quotidien",
    author: "Dr. Marie Dupont",
    category: "Bien-être",
    level: "Débutant",
    price: 49,
    modules: 6,
    status: "pending",
    submittedAt: "2024-01-15",
    description: "Apprenez à gérer votre stress avec des techniques pratiques et scientifiquement prouvées.",
  },
  {
    id: "2",
    title: "Introduction à la TCC",
    author: "Dr. Jean Martin",
    category: "Thérapie",
    level: "Intermédiaire",
    price: 89,
    modules: 8,
    status: "pending",
    submittedAt: "2024-01-14",
    description: "Découvrez les fondamentaux de la thérapie cognitivo-comportementale.",
  },
  {
    id: "3",
    title: "Méditation pour débutants",
    author: "Sophie Bernard",
    category: "Méditation",
    level: "Débutant",
    price: 0,
    modules: 4,
    status: "approved",
    submittedAt: "2024-01-10",
    description: "Un guide complet pour commencer la méditation.",
  },
];

export default function AllFormations() {
  const [formations, setFormations] = useState<Formation[]>(mockFormations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          formation.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || formation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setFormations(prev => prev.map(f => f.id === id ? { ...f, status: "approved" } : f));
    toast.success("Formation approuvée et publiée");
    setIsDetailOpen(false);
  };

  const handleReject = (id: string) => {
    setFormations(prev => prev.map(f => f.id === id ? { ...f, status: "rejected" } : f));
    toast.success("Formation refusée");
    setIsDetailOpen(false);
    setRejectionReason("");
  };

  const openDetail = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: Formation["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publiée</Badge>;
      case "rejected":
        return <Badge variant="destructive">Refusée</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  const pendingCount = formations.filter(f => f.status === "pending").length;

  return (
    <DashboardLayout title="Gestion des formations" description="Validez les formations soumises">
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
              <p className="text-sm text-muted-foreground">Publiées</p>
              <p className="text-2xl font-bold text-green-600">
                {formations.filter(f => f.status === "approved").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Refusées</p>
              <p className="text-2xl font-bold text-red-600">
                {formations.filter(f => f.status === "rejected").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les formations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une formation..."
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
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Publiées</SelectItem>
                  <SelectItem value="rejected">Refusées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormations.map((formation) => (
                  <TableRow key={formation.id}>
                    <TableCell className="font-medium">{formation.title}</TableCell>
                    <TableCell>{formation.author}</TableCell>
                    <TableCell>{formation.category}</TableCell>
                    <TableCell>{formation.level}</TableCell>
                    <TableCell>{formation.price === 0 ? "Gratuit" : `${formation.price}€`}</TableCell>
                    <TableCell>{formation.modules}</TableCell>
                    <TableCell>{getStatusBadge(formation.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(formation)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          {formation.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(formation.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openDetail(formation)}
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
            {selectedFormation && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {selectedFormation.title}
                  </DialogTitle>
                  <DialogDescription>
                    Par {selectedFormation.author}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedFormation.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Catégorie</p>
                      <p className="text-sm text-muted-foreground">{selectedFormation.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Niveau</p>
                      <p className="text-sm text-muted-foreground">{selectedFormation.level}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Prix</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedFormation.price === 0 ? "Gratuit" : `${selectedFormation.price}€`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Modules</p>
                      <p className="text-sm text-muted-foreground">{selectedFormation.modules} modules</p>
                    </div>
                  </div>
                  
                  {selectedFormation.status === "pending" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Motif de refus (optionnel)</p>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Expliquez pourquoi cette formation ne peut pas être publiée..."
                      />
                    </div>
                  )}
                </div>
                {selectedFormation.status === "pending" && (
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleReject(selectedFormation.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                    <Button onClick={() => handleApprove(selectedFormation.id)}>
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
