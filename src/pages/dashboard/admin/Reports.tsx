import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, X, Eye, MoreVertical, MessageSquare, User, Flag } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Report {
  id: string;
  type: "user" | "content" | "service";
  reportedItem: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

const mockReports: Report[] = [
  {
    id: "1",
    type: "user",
    reportedItem: "Pierre Martin",
    reportedBy: "Sophie Durand",
    reason: "Comportement inapproprié",
    description: "L'utilisateur a envoyé des messages inappropriés pendant une consultation.",
    status: "pending",
    priority: "high",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    type: "content",
    reportedItem: "Formation: Hypnose rapide",
    reportedBy: "Dr. Marie Bernard",
    reason: "Contenu trompeur",
    description: "La formation contient des affirmations non scientifiquement prouvées.",
    status: "pending",
    priority: "medium",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    type: "service",
    reportedItem: "Consultation astrologie",
    reportedBy: "Admin",
    reason: "Non conforme",
    description: "Service non conforme à la charte de la plateforme.",
    status: "resolved",
    priority: "low",
    createdAt: "2024-01-10",
  },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionNote, setActionNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = reports.filter(report => 
    statusFilter === "all" || report.status === statusFilter
  );

  const handleResolve = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" } : r));
    toast.success("Signalement traité");
    setIsDetailOpen(false);
    setActionNote("");
  };

  const handleDismiss = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" } : r));
    toast.success("Signalement classé sans suite");
    setIsDetailOpen(false);
    setActionNote("");
  };

  const openDetail = (report: Report) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Résolu</Badge>;
      case "dismissed":
        return <Badge variant="secondary">Classé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">En attente</Badge>;
    }
  };

  const getPriorityBadge = (priority: Report["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Urgent</Badge>;
      case "medium":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Moyen</Badge>;
      case "low":
        return <Badge variant="outline">Faible</Badge>;
    }
  };

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />;
      case "content":
        return <MessageSquare className="h-4 w-4" />;
      case "service":
        return <Flag className="h-4 w-4" />;
    }
  };

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const urgentCount = reports.filter(r => r.status === "pending" && r.priority === "high").length;

  return (
    <DashboardLayout title="Signalements" description="Gérez les signalements utilisateurs">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={urgentCount > 0 ? "border-destructive" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${urgentCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
                <p className="text-sm text-muted-foreground">Urgents</p>
              </div>
              <p className={`text-2xl font-bold ${urgentCount > 0 ? "text-destructive" : ""}`}>{urgentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Résolus ce mois</p>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === "resolved").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tous les signalements</CardTitle>
                <CardDescription>Examinez et traitez les signalements</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="resolved">Résolus</SelectItem>
                  <SelectItem value="dismissed">Classés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Élément signalé</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Signalé par</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(report.type)}
                        <span className="capitalize">{report.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{report.reportedItem}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>{report.reportedBy}</TableCell>
                    <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          {report.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleResolve(report.id)}>
                                <Check className="h-4 w-4 mr-2" />
                                Marquer résolu
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDismiss(report.id)}>
                                <X className="h-4 w-4 mr-2" />
                                Classer sans suite
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
            {selectedReport && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedReport.type)}
                    <DialogTitle>Signalement: {selectedReport.reportedItem}</DialogTitle>
                  </div>
                  <DialogDescription>
                    Signalé par {selectedReport.reportedBy} le {new Date(selectedReport.createdAt).toLocaleDateString("fr-FR")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedReport.priority)}
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Raison</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Description détaillée</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>
                  
                  {selectedReport.status === "pending" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Note d'action (optionnel)</p>
                      <Textarea
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        placeholder="Décrivez les actions prises..."
                      />
                    </div>
                  )}
                </div>
                {selectedReport.status === "pending" && (
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDismiss(selectedReport.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Classer sans suite
                    </Button>
                    <Button onClick={() => handleResolve(selectedReport.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Marquer résolu
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
