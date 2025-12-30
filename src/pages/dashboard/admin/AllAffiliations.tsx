import { useState } from "react";
import { Search, Filter, Eye, Link2, TrendingUp, Users, DollarSign, MousePointerClick } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Affiliation {
  id: string;
  affiliate_code: string;
  clicks: number;
  conversions: number;
  total_earned: number;
  status: string;
  created_at: string;
  affiliate: {
    id: string;
    full_name: string;
    email: string;
  };
  formation: {
    id: string;
    title: string;
    price: number;
    affiliation_type: string;
    affiliation_value: number;
  };
}

interface AffiliateSale {
  id: string;
  sale_amount: number;
  commission_amount: number;
  commission_type: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  buyer: {
    full_name: string;
    email: string;
  };
  affiliation: {
    affiliate_code: string;
    affiliate: {
      full_name: string;
    };
    formation: {
      title: string;
    };
  };
}

export default function AllAffiliations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAffiliation, setSelectedAffiliation] = useState<Affiliation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch all affiliations
  const { data: affiliations = [], isLoading: affiliationsLoading } = useQuery({
    queryKey: ['admin-affiliations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliations')
        .select(`
          *,
          affiliate:profiles!affiliations_affiliate_id_fkey(id, full_name, email),
          formation:formations!affiliations_formation_id_fkey(id, title, price, affiliation_type, affiliation_value)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Affiliation[];
    }
  });

  // Fetch all affiliate sales
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['admin-affiliate-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_sales')
        .select(`
          *,
          buyer:profiles!affiliate_sales_buyer_id_fkey(full_name, email),
          affiliation:affiliations!affiliate_sales_affiliation_id_fkey(
            affiliate_code,
            affiliate:profiles!affiliations_affiliate_id_fkey(full_name),
            formation:formations!affiliations_formation_id_fkey(title)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AffiliateSale[];
    }
  });

  const filteredAffiliations = affiliations.filter(aff => {
    const matchesSearch = 
      aff.affiliate?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.formation?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aff.affiliate_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || aff.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">Actif</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300">En pause</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSaleStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">Payé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300">En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Stats calculations
  const totalAffiliations = affiliations.length;
  const activeAffiliations = affiliations.filter(a => a.status === "active").length;
  const totalClicks = affiliations.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const totalConversions = affiliations.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalEarnings = affiliations.reduce((sum, a) => sum + (a.total_earned || 0), 0);
  const totalSalesAmount = sales.reduce((sum, s) => sum + s.sale_amount, 0);
  const totalCommissions = sales.reduce((sum, s) => sum + s.commission_amount, 0);
  const pendingSalesCount = sales.filter(s => s.status === "pending").length;

  const openDetail = (affiliation: Affiliation) => {
    setSelectedAffiliation(affiliation);
    setIsDetailOpen(true);
  };

  return (
    <DashboardLayout title="Gestion des affiliations" description="Visualisez toutes les affiliations et ventes">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Affiliations actives</p>
              </div>
              <p className="text-2xl font-bold">{activeAffiliations} <span className="text-sm font-normal text-muted-foreground">/ {totalAffiliations}</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total clics</p>
              </div>
              <p className="text-2xl font-bold">{totalClicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
              <p className="text-2xl font-bold">{totalConversions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Commissions totales</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{totalEarnings.toFixed(2)}€</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="affiliations">Affiliations ({totalAffiliations})</TabsTrigger>
            <TabsTrigger value="sales">Ventes ({sales.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliations">
            <Card>
              <CardHeader>
                <CardTitle>Toutes les affiliations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par affilié, formation ou code..."
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
                      <SelectItem value="active">Actifs</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {affiliationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredAffiliations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune affiliation trouvée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Affilié</TableHead>
                        <TableHead>Formation</TableHead>
                        <TableHead>Clics</TableHead>
                        <TableHead>Conversions</TableHead>
                        <TableHead>Gains</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAffiliations.map((affiliation) => (
                        <TableRow key={affiliation.id}>
                          <TableCell className="font-mono text-sm">{affiliation.affiliate_code}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{affiliation.affiliate?.full_name || 'Inconnu'}</p>
                              <p className="text-xs text-muted-foreground">{affiliation.affiliate?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{affiliation.formation?.title || 'Formation supprimée'}</p>
                              <p className="text-xs text-muted-foreground">
                                {affiliation.formation?.affiliation_type === 'percentage' 
                                  ? `${affiliation.formation?.affiliation_value}%` 
                                  : `${affiliation.formation?.affiliation_value}€`}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{affiliation.clicks || 0}</TableCell>
                          <TableCell>{affiliation.conversions || 0}</TableCell>
                          <TableCell className="font-medium text-green-600">{(affiliation.total_earned || 0).toFixed(2)}€</TableCell>
                          <TableCell>{getStatusBadge(affiliation.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openDetail(affiliation)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ventes par affiliation</CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span>Ventes totales: <strong>{totalSalesAmount.toFixed(2)}€</strong></span>
                    <span>Commissions: <strong className="text-green-600">{totalCommissions.toFixed(2)}€</strong></span>
                    <span>En attente: <strong className="text-yellow-600">{pendingSalesCount}</strong></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune vente enregistrée
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Formation</TableHead>
                        <TableHead>Affilié</TableHead>
                        <TableHead>Acheteur</TableHead>
                        <TableHead>Montant vente</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="text-sm">
                            {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {sale.affiliation?.formation?.title || 'Formation supprimée'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{sale.affiliation?.affiliate?.full_name || 'Inconnu'}</p>
                              <p className="text-xs text-muted-foreground font-mono">{sale.affiliation?.affiliate_code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{sale.buyer?.full_name || 'Inconnu'}</p>
                              <p className="text-xs text-muted-foreground">{sale.buyer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{sale.sale_amount.toFixed(2)}€</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {sale.commission_amount.toFixed(2)}€
                            <span className="text-xs text-muted-foreground ml-1">
                              ({sale.commission_type === 'percentage' ? '%' : '€ fixe'})
                            </span>
                          </TableCell>
                          <TableCell>{getSaleStatusBadge(sale.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            {selectedAffiliation && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Affiliation {selectedAffiliation.affiliate_code}
                  </DialogTitle>
                  <DialogDescription>
                    Détails de l'affiliation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Affilié</p>
                      <p className="text-sm">{selectedAffiliation.affiliate?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedAffiliation.affiliate?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Formation</p>
                      <p className="text-sm">{selectedAffiliation.formation?.title}</p>
                      <p className="text-xs text-muted-foreground">{selectedAffiliation.formation?.price}€</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Clics</p>
                      <p className="text-2xl font-bold">{selectedAffiliation.clicks || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Conversions</p>
                      <p className="text-2xl font-bold">{selectedAffiliation.conversions || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Gains</p>
                      <p className="text-2xl font-bold text-green-600">{(selectedAffiliation.total_earned || 0).toFixed(2)}€</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Commission</p>
                      <p className="text-sm">
                        {selectedAffiliation.formation?.affiliation_type === 'percentage' 
                          ? `${selectedAffiliation.formation?.affiliation_value}% par vente`
                          : `${selectedAffiliation.formation?.affiliation_value}€ par vente`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Taux de conversion</p>
                      <p className="text-sm">
                        {selectedAffiliation.clicks > 0 
                          ? `${((selectedAffiliation.conversions / selectedAffiliation.clicks) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Statut</p>
                    {getStatusBadge(selectedAffiliation.status)}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Créé le</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedAffiliation.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
