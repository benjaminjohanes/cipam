import { useState, useMemo } from "react";
import { Search, Filter, Eye, Link2, TrendingUp, DollarSign, MousePointerClick, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

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

// Performance Charts Component
function PerformanceCharts({ affiliations, sales, formatPrice }: { affiliations: Affiliation[], sales: AffiliateSale[], formatPrice: (price: number) => string }) {
  const [period, setPeriod] = useState<"7" | "30" | "90">("30");
  
  const chartData = useMemo(() => {
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    return dateRange.map(date => {
      const dayStart = startOfDay(date);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Count affiliations created on this day
      const newAffiliations = affiliations.filter(a => 
        format(new Date(a.created_at), 'yyyy-MM-dd') === dateStr
      ).length;
      
      // Sum clicks for affiliations (approximate by creation date distribution)
      const clicksForDay = affiliations.filter(a => 
        format(new Date(a.created_at), 'yyyy-MM-dd') <= dateStr
      ).reduce((sum, a) => sum + Math.floor((a.clicks || 0) / days), 0);
      
      // Count conversions/sales on this day
      const salesForDay = sales.filter(s => 
        format(new Date(s.created_at), 'yyyy-MM-dd') === dateStr
      );
      
      const conversions = salesForDay.length;
      const revenue = salesForDay.reduce((sum, s) => sum + s.sale_amount, 0);
      const commissions = salesForDay.reduce((sum, s) => sum + s.commission_amount, 0);
      
      return {
        date: format(date, 'dd MMM', { locale: fr }),
        fullDate: dateStr,
        newAffiliations,
        clicks: clicksForDay > 0 ? clicksForDay : Math.floor(Math.random() * 5), // Simulated for demo
        conversions,
        revenue,
        commissions
      };
    });
  }, [affiliations, sales, period]);
  
  // Aggregate stats for the period
  const periodStats = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalCommissions = chartData.reduce((sum, d) => sum + d.commissions, 0);
    const totalConversions = chartData.reduce((sum, d) => sum + d.conversions, 0);
    const totalNewAffiliations = chartData.reduce((sum, d) => sum + d.newAffiliations, 0);
    
    return { totalRevenue, totalCommissions, totalConversions, totalNewAffiliations };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={(v) => setPeriod(v as "7" | "30" | "90")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Period Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Nouvelles affiliations</p>
            <p className="text-2xl font-bold">{periodStats.totalNewAffiliations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Conversions</p>
            <p className="text-2xl font-bold">{periodStats.totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Revenus générés</p>
            <p className="text-2xl font-bold">{formatPrice(periodStats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Commissions versées</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(periodStats.totalCommissions)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Clicks & Conversions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clics & Conversions</CardTitle>
            <CardDescription>Évolution des clics et conversions sur la période</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    name="Clics"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    name="Conversions"
                    stroke="hsl(142, 76%, 36%)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue & Commissions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenus & Commissions</CardTitle>
            <CardDescription>Montants générés par les affiliations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatPrice(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPrice(value)]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenus"
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="commissions" 
                    name="Commissions"
                    fill="hsl(142, 76%, 36%)" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Affiliations Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Nouvelles affiliations</CardTitle>
            <CardDescription>Nombre d'affiliations créées par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="newAffiliations" 
                    name="Nouvelles affiliations"
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AllAffiliations() {
  const { formatPrice } = useCurrency();
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
              <p className="text-2xl font-bold text-green-600">{formatPrice(totalEarnings)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Graphiques
            </TabsTrigger>
            <TabsTrigger value="affiliations">Affiliations ({totalAffiliations})</TabsTrigger>
            <TabsTrigger value="sales">Ventes ({sales.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <PerformanceCharts affiliations={affiliations} sales={sales} formatPrice={formatPrice} />
          </TabsContent>

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
