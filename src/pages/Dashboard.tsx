import { motion } from "framer-motion";
import { Calendar, BookOpen, CreditCard, Users, Clock, CheckCircle, TrendingUp, Star } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

// Patient Dashboard
function PatientDashboard() {
  const { formatPrice } = useCurrency();
  
  return (
    <DashboardLayout title="Bienvenue" description="Gérez vos rendez-vous et formations">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Rendez-vous à venir" 
          value="2" 
          icon={Calendar}
          description="Cette semaine"
          trend="+1"
        />
        <StatCard 
          title="Formations en cours" 
          value="3" 
          icon={BookOpen}
          description="En progression"
        />
        <StatCard 
          title="Consultations totales" 
          value="12" 
          icon={Users}
          description="Depuis votre inscription"
        />
        <StatCard 
          title="Dépenses" 
          value={formatPrice(280000)} 
          icon={CreditCard}
          description="Ce mois"
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
            <div className="space-y-4">
              <AppointmentItem 
                professional="Dr. Marie Dupont"
                specialty="Psychologue clinicienne"
                date="Demain, 14h00"
                status="confirmed"
              />
              <AppointmentItem 
                professional="Dr. Jean Martin"
                specialty="Psychothérapeute"
                date="Vendredi, 10h30"
                status="pending"
              />
            </div>
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
            <div className="space-y-4">
              <FormationProgressItem 
                title="Gestion du stress au quotidien"
                progress={65}
                nextLesson="Module 4: Techniques de respiration"
              />
              <FormationProgressItem 
                title="Introduction à la méditation"
                progress={30}
                nextLesson="Module 2: Les fondamentaux"
              />
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
  
  return (
    <DashboardLayout title="Tableau de bord étudiant" description="Gérez vos services et formations">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Services proposés" 
          value="3" 
          icon={Users}
          description="1 en attente de validation"
        />
        <StatCard 
          title="Formations suivies" 
          value="5" 
          icon={BookOpen}
          description="2 terminées"
        />
        <StatCard 
          title="Revenus" 
          value={formatPrice(200000)} 
          icon={CreditCard}
          description="Ce mois"
        />
        <StatCard 
          title="Avis clients" 
          value="4.8" 
          icon={Star}
          description="Sur 12 avis"
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
            <div className="space-y-4">
              <ServiceItem 
                title="Accompagnement scolaire"
                status="pending"
                submittedAt="Il y a 2 jours"
              />
            </div>
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
  
  return (
    <DashboardLayout title="Tableau de bord professionnel" description="Gérez votre activité">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Rendez-vous aujourd'hui" 
          value="4" 
          icon={Calendar}
          description="2 confirmés, 2 en attente"
        />
        <StatCard 
          title="Patients actifs" 
          value="28" 
          icon={Users}
          description="+3 ce mois"
          trend="+12%"
        />
        <StatCard 
          title="Revenus du mois" 
          value={formatPrice(1530625)} 
          icon={CreditCard}
          description="+15% vs mois dernier"
          trend="+15%"
        />
        <StatCard 
          title="Note moyenne" 
          value="4.9" 
          icon={Star}
          description="Sur 47 avis"
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
            <div className="space-y-3">
              <ProfessionalAppointmentItem 
                patient="Sophie Martin"
                time="09:00 - 10:00"
                type="Première consultation"
                status="confirmed"
              />
              <ProfessionalAppointmentItem 
                patient="Pierre Durand"
                time="10:30 - 11:30"
                type="Suivi thérapeutique"
                status="confirmed"
              />
              <ProfessionalAppointmentItem 
                patient="Marie Lambert"
                time="14:00 - 15:00"
                type="Consultation TCC"
                status="pending"
              />
              <ProfessionalAppointmentItem 
                patient="Jean Petit"
                time="16:00 - 17:00"
                type="Bilan psychologique"
                status="pending"
              />
            </div>
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
  
  return (
    <DashboardLayout title="Administration CIPAM" description="Vue d'ensemble de la plateforme">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard 
          title="Utilisateurs totaux" 
          value="1,247" 
          icon={Users}
          description="+23 cette semaine"
          trend="+8%"
        />
        <StatCard 
          title="Professionnels actifs" 
          value="86" 
          icon={Users}
          description="12 en attente de validation"
        />
        <StatCard 
          title="Formations" 
          value="124" 
          icon={BookOpen}
          description="8 nouvelles ce mois"
        />
        <StatCard 
          title="Revenus plateforme" 
          value={formatPrice(7781250)} 
          icon={CreditCard}
          description="+22% vs mois dernier"
          trend="+22%"
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
            <div className="space-y-4">
              <AdminActionItem 
                title="Demandes d'upgrade étudiant → professionnel"
                count={5}
                link="/dashboard/upgrade-requests"
                urgent
              />
              <AdminActionItem 
                title="Services à valider"
                count={12}
                link="/dashboard/all-services"
              />
              <AdminActionItem 
                title="Nouvelles formations à approuver"
                count={3}
                link="/dashboard/all-formations"
              />
              <AdminActionItem 
                title="Signalements utilisateurs"
                count={2}
                link="/dashboard/reports"
                urgent
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <ActivityItem 
                text="Nouveau professionnel inscrit"
                time="Il y a 5 min"
              />
              <ActivityItem 
                text="Formation publiée par Dr. Dupont"
                time="Il y a 15 min"
              />
              <ActivityItem 
                text={`Paiement reçu - ${formatPrice(93750)}`}
                time="Il y a 1h"
              />
              <ActivityItem 
                text="Nouveau patient inscrit"
                time="Il y a 2h"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, description, trend }: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  trend?: string;
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
          <p className="text-2xl font-bold text-foreground">{value}</p>
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

function FormationProgressItem({ title, progress, nextLesson }: {
  title: string;
  progress: number;
  nextLesson: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <span className="text-xs font-medium text-primary">{progress}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Prochain: {nextLesson}</p>
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
        <p className="text-xs text-muted-foreground">Soumis {submittedAt}</p>
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
        {urgent && <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />}
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
