import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Professionnels from "./pages/Professionnels";
import ProfessionalDetail from "./pages/ProfessionalDetail";
import Formations from "./pages/Formations";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";
import Appointments from "./pages/dashboard/Appointments";
import MyFormations from "./pages/dashboard/MyFormations";
import UpgradeRequest from "./pages/dashboard/UpgradeRequest";
import Availability from "./pages/dashboard/Availability";
import MyServices from "./pages/dashboard/MyServices";
import CreateFormation from "./pages/dashboard/CreateFormation";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/professionnels" element={<Professionnels />} />
            <Route path="/professionnels/:id" element={<ProfessionalDetail />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Dashboard Routes - Common */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/appointments" element={<Appointments />} />
            <Route path="/dashboard/my-formations" element={<MyFormations />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            
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
            <Route path="/dashboard/earnings" element={<Earnings />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/overview" element={<Overview />} />
            <Route path="/dashboard/users" element={<AdminUsers />} />
            <Route path="/dashboard/professionals" element={<Professionals />} />
            <Route path="/dashboard/students" element={<Students />} />
            <Route path="/dashboard/upgrade-requests" element={<AdminUpgradeRequests />} />
            <Route path="/dashboard/categories" element={<Categories />} />
            <Route path="/dashboard/all-formations" element={<AllFormations />} />
            <Route path="/dashboard/all-services" element={<AllServices />} />
            <Route path="/dashboard/all-articles" element={<AllArticles />} />
            <Route path="/dashboard/create-article" element={<CreateArticle />} />
            <Route path="/dashboard/all-appointments" element={<AllAppointments />} />
            <Route path="/dashboard/team" element={<Team />} />
            <Route path="/dashboard/roles" element={<Roles />} />
            <Route path="/dashboard/platform-settings" element={<PlatformSettings />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
