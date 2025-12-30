import { Link, useLocation } from "react-router-dom";
import { 
  Home, User, BookOpen, Calendar, FileText, Settings, 
  Users, ShieldCheck, CreditCard, Bell, MessageSquare,
  GraduationCap, Briefcase, ClipboardList, TrendingUp,
  Building, UserCog, FolderOpen, Award, Tags, Ticket, Link2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import cipamLogo from "@/assets/cipam_logo.jpg";

type AppRole = 'student' | 'professional' | 'patient' | 'admin';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menusByRole: Record<AppRole, MenuGroup[]> = {
  patient: [
    {
      label: "Général",
      items: [
        { title: "Tableau de bord", url: "/dashboard", icon: Home },
        { title: "Mon profil", url: "/dashboard/profile", icon: User },
      ]
    },
    {
      label: "Services",
      items: [
        { title: "Mes rendez-vous", url: "/dashboard/appointments", icon: Calendar },
        { title: "Mes événements", url: "/dashboard/my-events", icon: Ticket },
        { title: "Trouver un professionnel", url: "/dashboard/find-professional", icon: Users },
        { title: "Mes formations", url: "/dashboard/my-formations", icon: BookOpen },
      ]
    },
    {
      label: "Compte",
      items: [
        { title: "Historique paiements", url: "/dashboard/payments", icon: CreditCard },
        { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
        { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
      ]
    }
  ],
  student: [
    {
      label: "Général",
      items: [
        { title: "Tableau de bord", url: "/dashboard", icon: Home },
        { title: "Mon profil", url: "/dashboard/profile", icon: User },
      ]
    },
    {
      label: "Mes Services",
      items: [
        { title: "Proposer un service", url: "/dashboard/propose-service", icon: ClipboardList },
        { title: "Mes services", url: "/dashboard/my-services", icon: Briefcase },
        { title: "Demandes en attente", url: "/dashboard/pending-services", icon: FileText },
      ]
    },
    {
      label: "Formations & Événements",
      items: [
        { title: "Mes formations", url: "/dashboard/my-formations", icon: BookOpen },
        { title: "Mes événements", url: "/dashboard/my-events", icon: Ticket },
        { title: "Catalogue", url: "/dashboard/formations-catalog", icon: GraduationCap },
      ]
    },
    {
      label: "Évolution",
      items: [
        { title: "Devenir professionnel", url: "/dashboard/upgrade-request", icon: Award },
        { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
      ]
    }
  ],
  professional: [
    {
      label: "Général",
      items: [
        { title: "Tableau de bord", url: "/dashboard", icon: Home },
        { title: "Mon profil public", url: "/dashboard/profile", icon: User },
        { title: "Statistiques", url: "/dashboard/stats", icon: TrendingUp },
      ]
    },
    {
      label: "Consultations",
      items: [
        { title: "Mes rendez-vous", url: "/dashboard/appointments", icon: Calendar },
        { title: "Disponibilités", url: "/dashboard/availability", icon: ClipboardList },
        { title: "Mes usagers", url: "/dashboard/patients", icon: Users },
      ]
    },
    {
      label: "Services & Formations",
      items: [
        { title: "Mes services", url: "/dashboard/my-services", icon: Briefcase },
        { title: "Mes formations", url: "/dashboard/my-formations", icon: BookOpen },
        { title: "Mes événements", url: "/dashboard/my-events", icon: Ticket },
        { title: "Créer une formation", url: "/dashboard/create-formation", icon: GraduationCap },
        { title: "Mes affiliations", url: "/dashboard/my-affiliations", icon: Link2 },
      ]
    },
    {
      label: "Compte",
      items: [
        { title: "Revenus", url: "/dashboard/earnings", icon: CreditCard },
        { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
        { title: "Paramètres", url: "/dashboard/settings", icon: Settings },
      ]
    }
  ],
  admin: [
    {
      label: "Administration",
      items: [
        { title: "Tableau de bord", url: "/dashboard", icon: Home },
        { title: "Vue d'ensemble", url: "/dashboard/overview", icon: TrendingUp },
      ]
    },
    {
      label: "Gestion des utilisateurs",
      items: [
        { title: "Tous les utilisateurs", url: "/dashboard/users", icon: Users },
        { title: "Professionnels", url: "/dashboard/professionals", icon: Briefcase },
        { title: "Étudiants", url: "/dashboard/students", icon: GraduationCap },
        { title: "Demandes d'upgrade", url: "/dashboard/upgrade-requests", icon: Award },
      ]
    },
    {
      label: "Contenu",
      items: [
        { title: "Catégories", url: "/dashboard/categories", icon: Tags },
        { title: "Formations", url: "/dashboard/all-formations", icon: BookOpen },
        { title: "Services", url: "/dashboard/all-services", icon: ClipboardList },
        { title: "Événements", url: "/dashboard/all-events", icon: Ticket },
        { title: "Participants", url: "/dashboard/event-participants", icon: Users },
        { title: "Articles", url: "/dashboard/all-articles", icon: FileText },
        { title: "Rendez-vous", url: "/dashboard/all-appointments", icon: Calendar },
      ]
    },
    {
      label: "Configuration",
      items: [
        { title: "Équipe admin", url: "/dashboard/team", icon: UserCog },
        { title: "Rôles & Permissions", url: "/dashboard/roles", icon: ShieldCheck },
        { title: "Paramètres plateforme", url: "/dashboard/platform-settings", icon: Settings },
      ]
    }
  ]
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { role, profile } = useAuth();
  const location = useLocation();
  const collapsed = state === "collapsed";
  
  const menus = role ? menusByRole[role as AppRole] : menusByRole.patient;
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={cipamLogo} alt="ALLÔ PSY" className="h-10 w-10 rounded-lg object-cover" />
          {!collapsed && (
            <div>
              <span className="text-lg font-display font-semibold text-foreground">ALLÔ PSY</span>
              <p className="text-xs text-muted-foreground">Espace personnel</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {menus.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink 
                        to={item.url} 
                        end 
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        {!collapsed && profile && (
          <div className="text-sm">
            <p className="font-medium text-foreground truncate">{profile.full_name || 'Utilisateur'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
