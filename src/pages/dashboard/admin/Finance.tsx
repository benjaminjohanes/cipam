import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  BookOpen,
  Ticket,
  Calendar,
  Link2,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useFinanceData, Transaction } from "@/hooks/useFinanceData";
import { useCurrency } from "@/contexts/CurrencyContext";
import CurrencyToggle from "@/components/CurrencyToggle";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const typeLabels: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  formation: { label: "Formation", icon: BookOpen, color: "text-indigo-600" },
  event: { label: "Événement", icon: Ticket, color: "text-purple-600" },
  appointment: { label: "Consultation", icon: Calendar, color: "text-blue-600" },
  affiliation: { label: "Affiliation", icon: Link2, color: "text-emerald-600" },
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Payé", variant: "default" },
  completed: { label: "Terminé", variant: "default" },
  pending: { label: "En attente", variant: "secondary" },
  confirmed: { label: "Confirmé", variant: "outline" },
  cancelled: { label: "Annulé", variant: "destructive" },
};

const CHART_COLORS = ["#6366f1", "#a855f7", "#3b82f6", "#10b981"];

export default function Finance() {
  const [period, setPeriod] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useFinanceData(period);
  const { formatPrice } = useCurrency();

  const filteredTransactions = data?.transactions.filter((t) => {
    const matchesSearch =
      t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.item_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.payment_status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const exportToCSV = () => {
    if (!filteredTransactions.length) return;

    const headers = ["Date", "Type", "Utilisateur", "Email", "Article", "Montant", "Commission", "Statut"];
    const rows = filteredTransactions.map((t) => [
      format(new Date(t.created_at), "dd/MM/yyyy HH:mm"),
      typeLabels[t.type]?.label || t.type,
      t.user_name,
      t.user_email,
      t.item_title,
      t.amount,
      t.commission,
      statusLabels[t.payment_status]?.label || t.payment_status,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare pie chart data
  const pieData = data?.stats
    ? [
        { name: "Formations", value: data.stats.formationsRevenue, color: CHART_COLORS[0] },
        { name: "Événements", value: data.stats.eventsRevenue, color: CHART_COLORS[1] },
        { name: "Consultations", value: data.stats.appointmentsRevenue, color: CHART_COLORS[2] },
      ].filter((d) => d.value > 0)
    : [];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg,
    iconColor,
    trend,
    loading,
  }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    trend?: { value: number; positive: boolean };
    loading?: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
          {trend && !loading && (
            <div className={`flex items-center gap-1 text-sm ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Finance" description="Vue d'ensemble de la comptabilité et des transactions">
      <div className="space-y-6">
        {/* Period Selector & Currency Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Select value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 derniers jours</SelectItem>
                <SelectItem value="30">30 derniers jours</SelectItem>
                <SelectItem value="90">90 derniers jours</SelectItem>
                <SelectItem value="365">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <CurrencyToggle />
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={!filteredTransactions.length}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenus totaux"
            value={formatPrice(data?.stats.totalRevenue || 0)}
            icon={DollarSign}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600"
            loading={isLoading}
          />
          <StatCard
            title="Paiements reçus"
            value={formatPrice(data?.stats.completedPayments || 0)}
            icon={CheckCircle}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            loading={isLoading}
          />
          <StatCard
            title="En attente"
            value={formatPrice(data?.stats.pendingPayments || 0)}
            icon={Clock}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600"
            loading={isLoading}
          />
          <StatCard
            title="Transactions"
            value={data?.stats.transactionCount?.toString() || "0"}
            icon={TrendingUp}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            loading={isLoading}
          />
        </div>

        {/* Revenue by Category Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Formations"
            value={formatPrice(data?.stats.formationsRevenue || 0)}
            icon={BookOpen}
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600"
            loading={isLoading}
          />
          <StatCard
            title="Événements"
            value={formatPrice(data?.stats.eventsRevenue || 0)}
            icon={Ticket}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
            loading={isLoading}
          />
          <StatCard
            title="Consultations"
            value={formatPrice(data?.stats.appointmentsRevenue || 0)}
            icon={Calendar}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            loading={isLoading}
          />
          <StatCard
            title="Commissions affiliés"
            value={formatPrice(data?.stats.affiliationsCommissions || 0)}
            icon={Link2}
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600"
            loading={isLoading}
          />
        </div>

        {/* Tabs for Charts and Transactions */}
        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution des revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : data?.revenueByMonth.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={data.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(v) => {
                            const [year, month] = v.split("-");
                            return format(new Date(Number(year), Number(month) - 1), "MMM", { locale: fr });
                          }}
                          className="text-xs"
                        />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => formatPrice(value)}
                          labelFormatter={(v) => {
                            const [year, month] = v.split("-");
                            return format(new Date(Number(year), Number(month) - 1), "MMMM yyyy", { locale: fr });
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="formations"
                          name="Formations"
                          stackId="1"
                          stroke={CHART_COLORS[0]}
                          fill={CHART_COLORS[0]}
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="events"
                          name="Événements"
                          stackId="1"
                          stroke={CHART_COLORS[1]}
                          fill={CHART_COLORS[1]}
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="appointments"
                          name="Consultations"
                          stackId="1"
                          stroke={CHART_COLORS[2]}
                          fill={CHART_COLORS[2]}
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Répartition des revenus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : pieData.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatPrice(value)} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue by Category Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenus par catégorie et période</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : data?.revenueByMonth.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(v) => {
                            const [year, month] = v.split("-");
                            return format(new Date(Number(year), Number(month) - 1), "MMM", { locale: fr });
                          }}
                          className="text-xs"
                        />
                        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => formatPrice(value)}
                          labelFormatter={(v) => {
                            const [year, month] = v.split("-");
                            return format(new Date(Number(year), Number(month) - 1), "MMMM yyyy", { locale: fr });
                          }}
                        />
                        <Legend />
                        <Bar dataKey="formations" name="Formations" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="events" name="Événements" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="appointments" name="Consultations" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée pour cette période
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="formation">Formations</SelectItem>
                      <SelectItem value="event">Événements</SelectItem>
                      <SelectItem value="appointment">Consultations</SelectItem>
                      <SelectItem value="affiliation">Affiliations</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    Aucune transaction trouvée pour cette période
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Article</TableHead>
                          <TableHead className="text-right">Montant</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => {
                          const typeInfo = typeLabels[transaction.type];
                          const TypeIcon = typeInfo?.icon || DollarSign;
                          const statusInfo = statusLabels[transaction.payment_status] || statusLabels.pending;

                          return (
                            <TableRow key={transaction.id}>
                              <TableCell className="whitespace-nowrap">
                                {format(new Date(transaction.created_at), "dd MMM yyyy", { locale: fr })}
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(transaction.created_at), "HH:mm")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <TypeIcon className={`h-4 w-4 ${typeInfo?.color}`} />
                                  <span>{typeInfo?.label}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{transaction.user_name}</div>
                                <div className="text-xs text-muted-foreground">{transaction.user_email}</div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-[200px] truncate">{transaction.item_title}</div>
                                {transaction.professional_name && (
                                  <div className="text-xs text-muted-foreground">
                                    Par {transaction.professional_name}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatPrice(transaction.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {transaction.commission > 0 ? (
                                  <span className="text-emerald-600">{formatPrice(transaction.commission)}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
