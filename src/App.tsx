import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { RequirePermission } from "@/components/auth/RequirePermission";
import Index from "./pages/Index";
import Professionnels from "./pages/Professionnels";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Formations from "./pages/Formations";
import FormationDetail from "./pages/FormationDetail";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Auth from "./pages/Auth";
import FAQ from "./pages/FAQ";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import Appointments from "./pages/dashboard/Appointments";
import MyFormations from "./pages/dashboard/MyFormations";
import UpgradeRequest from "./pages/dashboard/UpgradeRequest";
import Availability from "./pages/dashboard/Availability";
import MyServices from "./pages/dashboard/MyServices";
import CreateFormation from "./pages/dashboard/CreateFormation";
import EditFormation from "./pages/dashboard/EditFormation";
import ProposeService from "./pages/dashboard/ProposeService";
import FindProfessional from "./pages/dashboard/FindProfessional";
import Payments from "./pages/dashboard/Payments";
import Notifications from "./pages/dashboard/Notifications";
import PendingServices from "./pages/dashboard/PendingServices";
import FormationsCatalog from "./pages/dashboard/FormationsCatalog";
import Stats from "./pages/dashboard/Stats";
import Patients from "./pages/dashboard/Patients";
import Earnings from "./pages/dashboard/Earnings";
import Messages from "./pages/dashboard/Messages";
import MyEventRegistrations from "./pages/dashboard/MyEventRegistrations";
import MyAffiliations from "./pages/dashboard/MyAffiliations";
import AdminUsers from "./pages/dashboard/admin/Users";
import AdminUpgradeRequests from "./pages/dashboard/admin/UpgradeRequests";
import AllServices from "./pages/dashboard/admin/AllServices";
import AllFormations from "./pages/dashboard/admin/AllFormations";
import Reports from "./pages/dashboard/admin/Reports";
import Categories from "./pages/dashboard/admin/Categories";
import Overview from "./pages/dashboard/admin/Overview";
import Professionals from "./pages/dashboard/admin/Professionals";
import Students from "./pages/dashboard/admin/Students";
import AllArticles from "./pages/dashboard/admin/AllArticles";
import AllAppointments from "./pages/dashboard/admin/AllAppointments";
import Team from "./pages/dashboard/admin/Team";
import Roles from "./pages/dashboard/admin/Roles";
import PlatformSettings from "./pages/dashboard/admin/PlatformSettings";
import CreateArticle from "./pages/dashboard/admin/CreateArticle";
import EditArticle from "./pages/dashboard/admin/EditArticle";
import AllEvents from "./pages/dashboard/admin/AllEvents";
import EventParticipants from "./pages/dashboard/admin/EventParticipants";
import AllAffiliations from "./pages/dashboard/admin/AllAffiliations";
import Finance from "./pages/dashboard/admin/Finance";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <BrandingProvider>
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/professionnels" element={<Professionnels />} />
            <Route path="/professionnels/:id" element={<ProfessionalDetail />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/formations/:id" element={<FormationDetail />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/evenements" element={<Events />} />
            <Route path="/evenements/:id" element={<EventDetail />} />
            <Route path="/forbidden" element={<Forbidden />} />
            
            {/* Dashboard Routes - Common */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/appointments" element={<Appointments />} />
            <Route path="/dashboard/my-formations" element={<MyFormations />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/my-events" element={<MyEventRegistrations />} />
            
            {/* Dashboard Routes - Patient */}
            <Route path="/dashboard/find-professional" element={<FindProfessional />} />
            <Route path="/dashboard/payments" element={<Payments />} />
            
            {/* Dashboard Routes - Student */}
            <Route path="/dashboard/propose-service" element={<ProposeService />} />
            <Route path="/dashboard/my-services" element={<MyServices />} />
            <Route path="/dashboard/pending-services" element={<PendingServices />} />
            <Route path="/dashboard/formations-catalog" element={<FormationsCatalog />} />
            <Route path="/dashboard/upgrade-request" element={<UpgradeRequest />} />
            
            {/* Dashboard Routes - Professional */}
            <Route path="/dashboard/availability" element={<Availability />} />
            <Route path="/dashboard/patients" element={<Patients />} />
            <Route path="/dashboard/stats" element={<Stats />} />
            <Route path="/dashboard/create-formation" element={<CreateFormation />} />
            <Route path="/dashboard/edit-formation/:id" element={<EditFormation />} />
            <Route path="/dashboard/earnings" element={<Earnings />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/my-affiliations" element={<MyAffiliations />} />
            
            {/* Admin Routes - Protected by permissions */}
            <Route path="/dashboard/overview" element={
              <RequirePermission permission="view_stats"><Overview /></RequirePermission>
            } />
            <Route path="/dashboard/users" element={
              <RequirePermission permission="manage_users"><AdminUsers /></RequirePermission>
            } />
            <Route path="/dashboard/professionals" element={
              <RequirePermission permission="manage_users"><Professionals /></RequirePermission>
            } />
            <Route path="/dashboard/students" element={
              <RequirePermission permission="manage_users"><Students /></RequirePermission>
            } />
            <Route path="/dashboard/upgrade-requests" element={
              <RequirePermission permission="manage_users"><AdminUpgradeRequests /></RequirePermission>
            } />
            <Route path="/dashboard/categories" element={
              <RequirePermission permission="manage_categories"><Categories /></RequirePermission>
            } />
            <Route path="/dashboard/all-formations" element={
              <RequirePermission permission="manage_formations"><AllFormations /></RequirePermission>
            } />
            <Route path="/dashboard/all-services" element={
              <RequirePermission permission="manage_services"><AllServices /></RequirePermission>
            } />
            <Route path="/dashboard/all-articles" element={
              <RequirePermission permission="manage_articles"><AllArticles /></RequirePermission>
            } />
            <Route path="/dashboard/create-article" element={
              <RequirePermission permission="manage_articles"><CreateArticle /></RequirePermission>
            } />
            <Route path="/dashboard/edit-article/:id" element={
              <RequirePermission permission="manage_articles"><EditArticle /></RequirePermission>
            } />
            <Route path="/dashboard/all-appointments" element={
              <RequirePermission permission="manage_users"><AllAppointments /></RequirePermission>
            } />
            <Route path="/dashboard/all-events" element={
              <RequirePermission permission="manage_events"><AllEvents /></RequirePermission>
            } />
            <Route path="/dashboard/event-participants" element={
              <RequirePermission permission="manage_events"><EventParticipants /></RequirePermission>
            } />
            <Route path="/dashboard/all-affiliations" element={
              <RequirePermission permission="manage_affiliations"><AllAffiliations /></RequirePermission>
            } />
            <Route path="/dashboard/team" element={
              <RequirePermission permission="manage_team"><Team /></RequirePermission>
            } />
            <Route path="/dashboard/roles" element={
              <RequirePermission permission="manage_team"><Roles /></RequirePermission>
            } />
            <Route path="/dashboard/platform-settings" element={
              <RequirePermission permission="manage_settings"><PlatformSettings /></RequirePermission>
            } />
            <Route path="/dashboard/reports" element={
              <RequirePermission permission="view_stats"><Reports /></RequirePermission>
            } />
            <Route path="/dashboard/finance" element={
              <RequirePermission permission="view_stats"><Finance /></RequirePermission>
            } />
            
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrandingProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
