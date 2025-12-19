import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, GraduationCap, Briefcase, Crown, BookOpen, 
  Wrench, TrendingUp, Clock, CheckCircle 
} from "lucide-react";
import { useAdminStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

const Overview = () => {
  const { stats, loading } = useAdminStats();

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    iconBg, 
    iconColor 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    iconBg: string; 
    iconColor: string; 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-lg ${iconBg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{value}</p>
            )}
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Vue d'ensemble" description="Statistiques globales de la plateforme">
      <div className="space-y-6">
        {/* Section Utilisateurs */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total utilisateurs"
              value={stats.totalUsers}
              icon={Users}
              iconBg="bg-primary/10"
              iconColor="text-primary"
            />
            <StatCard
              title="Patients"
              value={stats.patients}
              icon={Users}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Étudiants"
              value={stats.students}
              icon={GraduationCap}
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              iconColor="text-purple-600"
            />
            <StatCard
              title="Professionnels"
              value={stats.professionals}
              icon={Briefcase}
              iconBg="bg-green-100 dark:bg-green-900/30"
              iconColor="text-green-600"
            />
          </div>
        </div>

        {/* Section Formations */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Formations
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total formations"
              value={stats.totalFormations}
              icon={BookOpen}
              iconBg="bg-indigo-100 dark:bg-indigo-900/30"
              iconColor="text-indigo-600"
            />
            <StatCard
              title="En attente"
              value={stats.pendingFormations}
              icon={Clock}
              iconBg="bg-yellow-100 dark:bg-yellow-900/30"
              iconColor="text-yellow-600"
            />
            <StatCard
              title="Approuvées"
              value={stats.approvedFormations}
              icon={CheckCircle}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
            />
          </div>
        </div>

        {/* Section Services */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Services
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total services"
              value={stats.totalServices}
              icon={Wrench}
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              iconColor="text-orange-600"
            />
            <StatCard
              title="En attente"
              value={stats.pendingServices}
              icon={Clock}
              iconBg="bg-yellow-100 dark:bg-yellow-900/30"
              iconColor="text-yellow-600"
            />
            <StatCard
              title="Approuvés"
              value={stats.approvedServices}
              icon={CheckCircle}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
