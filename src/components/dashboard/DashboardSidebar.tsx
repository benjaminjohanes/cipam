import { Link, useLocation } from "react-router-dom";
import { 
  Home, User, BookOpen, Calendar, FileText, Settings, 
  Users, ShieldCheck, CreditCard, Bell, MessageSquare,
  GraduationCap, Briefcase, ClipboardList, TrendingUp, Wallet,
  UserCog, Award, Tags, Ticket, Link2
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
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import logo from "@/assets/logo.png";
import type { AdminPermission } from "@/components/admin/PermissionsDialog";

type AppRole = 'student' | 'professional' | 'patient' | 'admin';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: AdminPermission; // Required permission for admin menu items
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  permissions?: AdminPermission[]; // If any of these permissions, show the group
}

// Mapping of admin routes to required permissions
const adminMenus: MenuGroup[] = [
  {
    label: "Administration",
    items: [
      { title: "Tableau de bord", url: "/dashboard", icon: Home },
      { title: "Vue d'ensemble", url: "/dashboard/overview", icon: TrendingUp, permission: "view_stats" },
      { title: "Finance", url: "/dashboard/finance", icon: Wallet, permission: "view_stats" },
    ],
  },
  {
    label: "Gestion des utilisateurs",
    permissions: ["manage_users"],
    items: [
      { title: "Tous les utilisateurs", url: "/dashboard/users", icon: Users, permission: "manage_users" },
      { title: "Professionnels", url: "/dashboard/professionals", icon: Briefcase, permission: "manage_users" },
      { title: "Étudiants", url: "/dashboard/students", icon: GraduationCap, permission: "manage_users" },
      { title: "Demandes d'upgrade", url: "/dashboard/upgrade-requests", icon: Award, permission: "manage_users" },
    ],
  },
  {
    label: "Contenu",
    permissions: ["manage_categories", "manage_formations", "manage_services", "manage_events", "manage_articles", "manage_affiliations"],
    items: [
      { title: "Catégories", url: "/dashboard/categories", icon: Tags, permission: "manage_categories" },
      { title: "Formations", url: "/dashboard/all-formations", icon: BookOpen, permission: "manage_formations" },
      { title: "Services", url: "/dashboard/all-services", icon: ClipboardList, permission: "manage_services" },
      { title: "Événements", url: "/dashboard/all-events", icon: Ticket, permission: "manage_events" },
      { title: "Participants", url: "/dashboard/event-participants", icon: Users, permission: "manage_events" },
      { title: "Articles", url: "/dashboard/all-articles", icon: FileText, permission: "manage_articles" },
      { title: "Rendez-vous", url: "/dashboard/all-appointments", icon: Calendar, permission: "manage_users" },
      { title: "Affiliations", url: "/dashboard/all-affiliations", icon: Link2, permission: "manage_affiliations" },
    ],
  },
  {
    label: "Configuration",
    permissions: ["manage_team", "manage_settings"],
    items: [
      { title: "Équipe admin", url: "/dashboard/team", icon: UserCog, permission: "manage_team" },
      { title: "Rôles & Permissions", url: "/dashboard/roles", icon: ShieldCheck, permission: "manage_team" },
      { title: "Paramètres plateforme", url: "/dashboard/platform-settings", icon: Settings, permission: "manage_settings" },
    ],
  },
];

const menusByRole: Record<Exclude<AppRole, 'admin'>, MenuGroup[]> = {
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
        { title: "Mes affiliations", url: "/dashboard/my-affiliations", icon: Link2 },
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
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { role, profile, user } = useAuth();
  const location = useLocation();
  const collapsed = state === "collapsed";
  
  // Fetch permissions for admin users
  const { permissions } = useAdminPermissions(role === 'admin' ? user?.id : undefined);
  
  // Filter admin menus based on permissions
  const getFilteredAdminMenus = (): MenuGroup[] => {
    return adminMenus
      .map(group => {
        // Filter items based on permission
        const filteredItems = group.items.filter(item => {
          // Items without permission requirement are always shown
          if (!item.permission) return true;
          // Check if user has the required permission
          return permissions.includes(item.permission);
        });
        
        return { ...group, items: filteredItems };
      })
      .filter(group => group.items.length > 0); // Remove empty groups
  };
  
  // Get menus based on role
  const getMenus = (): MenuGroup[] => {
    if (role === 'admin') {
      return getFilteredAdminMenus();
    }
    return menusByRole[role as Exclude<AppRole, 'admin'>] || menusByRole.patient;
  };
  
  const menus = getMenus();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="ALLÔ PSY" className="h-10 w-10 rounded-lg object-contain" />
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
