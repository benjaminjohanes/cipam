import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Calendar, 
  GraduationCap, 
  Euro, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  BarChart3
} from "lucide-react";
import { useStats } from "@/hooks/useStats";
import { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  confirmed: {
    label: "Confirmés",
    color: "hsl(var(--chart-1))",
  },
  completed: {
    label: "Terminés",
    color: "hsl(var(--chart-2))",
  },
  pending: {
    label: "En attente",
    color: "hsl(var(--chart-3))",
  },
  cancelled: {
    label: "Annulés",
    color: "hsl(var(--chart-4))",
  },
  revenue: {
    label: "Revenus",
    color: "hsl(var(--chart-1))",
  },
};

const Stats = () => {
  const [period, setPeriod] = useState(30);
  const { data: stats, isLoading } = useStats(period);

  const metricCards = [
    {
      title: "Total Rendez-vous",
      value: stats?.totalAppointments ?? 0,
      icon: Calendar,
      description: "Sur la période sélectionnée",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Confirmés",
      value: stats?.confirmedAppointments ?? 0,
      icon: CheckCircle,
      description: "Rendez-vous confirmés",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "En attente",
      value: stats?.pendingAppointments ?? 0,
      icon: Clock,
      description: "En attente de confirmation",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Annulés",
      value: stats?.cancelledAppointments ?? 0,
      icon: XCircle,
      description: "Rendez-vous annulés",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Formations",
      value: stats?.totalFormations ?? 0,
      icon: GraduationCap,
      description: `${stats?.publishedFormations ?? 0} publiées`,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Revenus",
      value: `${(stats?.totalRevenue ?? 0).toLocaleString("fr-FR")} €`,
      icon: Euro,
      description: "Total des ventes",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Statistiques" description="Analysez vos performances">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Statistiques" description="Analysez vos performances">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Vue d'ensemble</h2>
          </div>
          <Select value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metricCards.map((metric) => (
            <Card key={metric.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="status">Statuts</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="formations">Formations</TabsTrigger>
          </TabsList>

          {/* Appointments Over Time */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Évolution des rendez-vous
                </CardTitle>
                <CardDescription>
                  Nombre de rendez-vous par jour sur les 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.appointmentsByDay && stats.appointmentsByDay.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <AreaChart data={stats.appointmentsByDay}>
                      <defs>
                        <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="confirmed"
                        stroke="hsl(var(--chart-1))"
                        fillOpacity={1}
                        fill="url(#colorConfirmed)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="hsl(var(--chart-2))"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                        strokeWidth={2}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Aucune donnée disponible pour cette période
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments by Status */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Répartition par statut
                </CardTitle>
                <CardDescription>
                  Distribution des rendez-vous selon leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.appointmentsByStatus && stats.appointmentsByStatus.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <PieChart>
                      <Pie
                        data={stats.appointmentsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.appointmentsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Aucun rendez-vous pour cette période
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Over Time */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Évolution des revenus
                </CardTitle>
                <CardDescription>
                  Revenus mensuels sur les 6 derniers mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.revenueByMonth && stats.revenueByMonth.some((r) => r.revenue > 0) ? (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart data={stats.revenueByMonth}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} €`}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value} €`, "Revenus"]}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="url(#colorRevenue)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Aucun revenu enregistré pour cette période
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formations by Level */}
          <TabsContent value="formations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Répartition des formations
                </CardTitle>
                <CardDescription>
                  Distribution des formations par niveau
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.formationsByLevel && stats.formationsByLevel.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <PieChart>
                      <Pie
                        data={stats.formationsByLevel}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats.formationsByLevel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                    Aucune formation disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Stats;
