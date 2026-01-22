import { motion } from "framer-motion";
import { Calendar, BookOpen, CreditCard, Users, Clock, CheckCircle, TrendingUp, Star } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  usePatientDashboard, 
  useStudentDashboard, 
  useProfessionalDashboard, 
  useAdminDashboard 
} from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Patient Dashboard
function PatientDashboard() {
  const { formatPrice } = useCurrency();
  const { data, isLoading } = usePatientDashboard();
  
  return (
    <DashboardLayout title="Bienvenue" description="Gérez vos rendez-vous et formations">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Rendez-vous à venir" 
          value={isLoading ? null : String(data?.upcomingAppointments || 0)} 
          icon={Calendar}
          description="Cette semaine"
          loading={isLoading}
        />
        <StatCard 
          title="Formations en cours" 
          value={isLoading ? null : String(data?.formationsInProgress || 0)} 
          icon={BookOpen}
          description="En progression"
          loading={isLoading}
        />
        <StatCard 
          title="Consultations totales" 
          value={isLoading ? null : String(data?.totalConsultations || 0)} 
          icon={Users}
          description="Depuis votre inscription"
          loading={isLoading}
        />
        <StatCard 
          title="Dépenses" 
          value={isLoading ? null : formatPrice(data?.monthlyExpenses || 0)} 
          icon={CreditCard}
          description="Ce mois"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Prochains rendez-vous</CardTitle>
              <CardDescription>Vos consultations à venir</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/appointments">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data?.nextAppointments && data.nextAppointments.length > 0 ? (
              <div className="space-y-4">
                {data.nextAppointments.slice(0, 3).map((apt) => (
                  <AppointmentItem 
                    key={apt.id}
                    professional={apt.professional_name}
                    specialty={apt.specialty || "Professionnel"}
                    date={format(new Date(apt.scheduled_at), "EEEE dd MMM, HH:mm", { locale: fr })}
                    status={apt.status as 'confirmed' | 'pending'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun rendez-vous à venir</p>
            )}
          </CardContent>
        </Card>

        {/* Formations in Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Formations en cours</CardTitle>
              <CardDescription>Continuez votre apprentissage</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/my-formations">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Découvrez nos formations</p>
              <Button className="mt-4" asChild>
                <Link to="/formations">Explorer les formations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Student Dashboard
function StudentDashboard() {
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useStudentDashboard();
  
  return (
    <DashboardLayout title="Tableau de bord étudiant" description="Gérez vos services et formations">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Services proposés" 
          value={isLoading ? null : String(data?.servicesCount || 0)} 
          icon={Users}
          description={data?.pendingServicesCount ? `${data.pendingServicesCount} en attente` : "Actifs"}
          loading={isLoading}
        />
        <StatCard 
          title="Formations suivies" 
          value={isLoading ? null : String(data?.formationsFollowed || 0)} 
          icon={BookOpen}
          description={data?.completedFormations ? `${data.completedFormations} terminées` : "En cours"}
          loading={isLoading}
        />
        <StatCard 
          title="Revenus" 
          value={isLoading ? null : formatPrice(data?.monthlyRevenue || 0)} 
          icon={CreditCard}
          description="Ce mois"
          loading={isLoading}
        />
        <StatCard 
          title="Avis clients" 
          value={isLoading ? null : String(data?.averageRating || 0)} 
          icon={Star}
          description={data?.reviewsCount ? `Sur ${data.reviewsCount} avis` : "Aucun avis"}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services en attente</CardTitle>
            <CardDescription>En cours de validation par l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : data?.pendingServices && data.pendingServices.length > 0 ? (
              <div className="space-y-4">
                {data.pendingServices.map((service) => (
                  <ServiceItem 
                    key={service.id}
                    title={service.title}
                    status="pending"
                    submittedAt={format(new Date(service.created_at), "dd MMM yyyy", { locale: fr })}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun service en attente</p>
            )}
            <Button className="w-full mt-4" asChild>
              <Link to="/dashboard/propose-service">Proposer un nouveau service</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upgrade to Professional */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Évoluez vers le statut Professionnel
            </CardTitle>
            <CardDescription>
              Débloquez plus de fonctionnalités et augmentez votre visibilité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Proposez des consultations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Créez vos propres formations
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Profil vérifié et mis en avant
              </li>
            </ul>
            <Button className="w-full" asChild>
              <Link to="/dashboard/upgrade-request">Faire une demande</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Professional Dashboard
function ProfessionalDashboard() {
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useProfessionalDashboard();
  
  return (
    <DashboardLayout title="Tableau de bord professionnel" description="Gérez votre activité">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Rendez-vous aujourd'hui" 
          value={isLoading ? null : String(data?.todayAppointments || 0)} 
          icon={Calendar}
          description={data ? `${data.confirmedToday} confirmés, ${data.pendingToday} en attente` : ""}
          loading={isLoading}
        />
        <StatCard 
          title="Patients actifs" 
          value={isLoading ? null : String(data?.activePatients || 0)} 
          icon={Users}
          description={data?.newPatientsThisMonth ? `+${data.newPatientsThisMonth} ce mois` : "Total"}
          trend={data?.newPatientsThisMonth ? `+${data.newPatientsThisMonth}` : undefined}
          loading={isLoading}
        />
        <StatCard 
          title="Revenus du mois" 
          value={isLoading ? null : formatPrice(data?.monthlyRevenue || 0)} 
          icon={CreditCard}
          description="Ce mois"
          loading={isLoading}
        />
        <StatCard 
          title="Note moyenne" 
          value={isLoading ? null : String(data?.averageRating || 0)} 
          icon={Star}
          description={data?.reviewsCount ? `Sur ${data.reviewsCount} avis` : "Aucun avis"}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rendez-vous du jour</CardTitle>
              <CardDescription>Votre planning d'aujourd'hui</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/appointments">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : data?.todaySchedule && data.todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {data.todaySchedule.map((apt) => (
                  <ProfessionalAppointmentItem 
                    key={apt.id}
                    patient={apt.patient_name}
                    time={format(new Date(apt.scheduled_at), "HH:mm", { locale: fr })}
                    type={apt.type}
                    status={apt.status as 'confirmed' | 'pending'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Aucun rendez-vous aujourd'hui</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/availability">
                <Clock className="h-4 w-4 mr-2" />
                Gérer mes disponibilités
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/create-formation">
                <BookOpen className="h-4 w-4 mr-2" />
                Créer une formation
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/dashboard/my-services">
                <Users className="h-4 w-4 mr-2" />
                Mes services
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { formatPrice } = useCurrency();
  const { data, isLoading } = useAdminDashboard();
  
  return (
    <DashboardLayout title="Administration Allô Psy" description="Vue d'ensemble de la plateforme">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Utilisateurs totaux" 
          value={isLoading ? null : String(data?.totalUsers || 0)} 
          icon={Users}
          description={data?.newUsersThisWeek ? `+${data.newUsersThisWeek} cette semaine` : "Total"}
          trend={data?.newUsersThisWeek ? `+${data.newUsersThisWeek}` : undefined}
          loading={isLoading}
        />
        <StatCard 
          title="Professionnels actifs" 
          value={isLoading ? null : String(data?.professionalsActive || 0)} 
          icon={Users}
          description={data?.pendingProfessionals ? `${data.pendingProfessionals} en attente` : "Vérifiés"}
          loading={isLoading}
        />
        <StatCard 
          title="Formations" 
          value={isLoading ? null : String(data?.totalFormations || 0)} 
          icon={BookOpen}
          description={data?.newFormationsThisMonth ? `${data.newFormationsThisMonth} nouvelles ce mois` : "Total"}
          loading={isLoading}
        />
        <StatCard 
          title="Revenus plateforme" 
          value={isLoading ? null : formatPrice(data?.platformRevenue || 0)} 
          icon={CreditCard}
          description="Ce mois"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actions en attente</CardTitle>
            <CardDescription>Éléments nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <AdminActionItem 
                  title="Demandes d'upgrade étudiant → professionnel"
                  count={data?.pendingUpgradeRequests || 0}
                  link="/dashboard/upgrade-requests"
                  urgent={(data?.pendingUpgradeRequests || 0) > 0}
                />
                <AdminActionItem 
                  title="Services à valider"
                  count={data?.pendingServices || 0}
                  link="/dashboard/all-services"
                />
                <AdminActionItem 
                  title="Nouvelles formations à approuver"
                  count={data?.pendingFormations || 0}
                  link="/dashboard/all-formations"
                />
                <AdminActionItem 
                  title="Signalements utilisateurs"
                  count={data?.pendingReports || 0}
                  link="/dashboard/reports"
                  urgent={(data?.pendingReports || 0) > 0}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-4 text-sm">
                {data.recentActivity.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    text={activity.text}
                    time={activity.time}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune activité récente</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, description, trend, loading }: {
  title: string;
  value: string | null;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {trend && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {trend}
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-8 w-16 mb-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{value}</p>
          )}
          <p className="text-sm font-medium text-foreground mt-1">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AppointmentItem({ professional, specialty, date, status }: {
  professional: string;
  specialty: string;
  date: string;
  status: 'confirmed' | 'pending';
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium text-primary">{professional.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{professional}</p>
        <p className="text-xs text-muted-foreground">{specialty}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{date}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'confirmed' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'confirmed' ? 'Confirmé' : 'En attente'}
        </span>
      </div>
    </div>
  );
}

function ServiceItem({ title, status, submittedAt }: {
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">Soumis le {submittedAt}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        status === 'pending' 
          ? 'bg-yellow-100 text-yellow-700'
          : status === 'approved'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvé' : 'Refusé'}
      </span>
    </div>
  );
}

function ProfessionalAppointmentItem({ patient, time, type, status }: {
  patient: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending';
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-border">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-medium text-primary">{patient.charAt(0)}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{patient}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{time}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          status === 'confirmed' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'confirmed' ? 'Confirmé' : 'En attente'}
        </span>
      </div>
    </div>
  );
}

function AdminActionItem({ title, count, link, urgent }: {
  title: string;
  count: number;
  link: string;
  urgent?: boolean;
}) {
  return (
    <Link 
      to={link}
      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        {urgent && count > 0 && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        {count}
      </span>
    </Link>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
      <div>
        <p className="text-foreground">{text}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

// Main Dashboard Component with role-based routing
export default function Dashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  switch (role) {
    case 'admin':
      return <AdminDashboard />;
    case 'professional':
      return <ProfessionalDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'patient':
    default:
      return <PatientDashboard />;
  }
}
