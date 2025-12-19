import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Professionnels from "./pages/Professionnels";
import Formations from "./pages/Formations";
import Articles from "./pages/Articles";
import Services from "./pages/Services";
import Auth from "./pages/Auth";
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
import AdminUsers from "./pages/dashboard/admin/Users";
import AdminUpgradeRequests from "./pages/dashboard/admin/UpgradeRequests";
import AllServices from "./pages/dashboard/admin/AllServices";
import AllFormations from "./pages/dashboard/admin/AllFormations";
import Reports from "./pages/dashboard/admin/Reports";
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
            <Route path="/formations" element={<Formations />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/services" element={<Services />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/appointments" element={<Appointments />} />
            <Route path="/dashboard/my-formations" element={<MyFormations />} />
            <Route path="/dashboard/upgrade-request" element={<UpgradeRequest />} />
            <Route path="/dashboard/availability" element={<Availability />} />
            <Route path="/dashboard/my-services" element={<MyServices />} />
            <Route path="/dashboard/create-formation" element={<CreateFormation />} />
            <Route path="/dashboard/propose-service" element={<ProposeService />} />
            
            {/* Admin Routes */}
            <Route path="/dashboard/users" element={<AdminUsers />} />
            <Route path="/dashboard/upgrade-requests" element={<AdminUpgradeRequests />} />
            <Route path="/dashboard/all-services" element={<AllServices />} />
            <Route path="/dashboard/all-formations" element={<AllFormations />} />
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
