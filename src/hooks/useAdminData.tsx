import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  specialty: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  role: 'student' | 'professional' | 'patient' | 'admin';
}

export interface AdminStats {
  totalUsers: number;
  patients: number;
  students: number;
  professionals: number;
  admins: number;
  totalFormations: number;
  pendingFormations: number;
  approvedFormations: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    patients: 0,
    students: 0,
    professionals: 0,
    admins: 0,
    totalFormations: 0,
    pendingFormations: 0,
    approvedFormations: 0,
    totalServices: 0,
    pendingServices: 0,
    approvedServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch user role counts
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role');

      if (rolesError) throw rolesError;

      const roleCounts = roles?.reduce((acc, { role }) => {
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Fetch formations stats
      const { data: formations, error: formationsError } = await supabase
        .from('formations')
        .select('status');

      if (formationsError) throw formationsError;

      // Fetch services stats
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('status');

      if (servicesError) throw servicesError;

      setStats({
        totalUsers: roles?.length || 0,
        patients: roleCounts['patient'] || 0,
        students: roleCounts['student'] || 0,
        professionals: roleCounts['professional'] || 0,
        admins: roleCounts['admin'] || 0,
        totalFormations: formations?.length || 0,
        pendingFormations: formations?.filter(f => f.status === 'pending').length || 0,
        approvedFormations: formations?.filter(f => f.status === 'approved').length || 0,
        totalServices: services?.length || 0,
        pendingServices: services?.filter(s => s.status === 'pending').length || 0,
        approvedServices: services?.filter(s => s.status === 'approved').length || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        specialty: profile.specialty,
        is_verified: profile.is_verified,
        created_at: profile.created_at,
        role: roleMap.get(profile.id) || 'patient',
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  return { users, loading, refetch: fetchUsers };
}

export function useAdminFormations() {
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select(`
          *,
          author:profiles!formations_author_id_fkey(full_name, email),
          category:categories!formations_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFormations(data || []);
    } catch (error) {
      console.error('Error fetching formations:', error);
      toast.error('Erreur lors du chargement des formations');
    } finally {
      setLoading(false);
    }
  };

  const updateFormationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('formations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setFormations(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      toast.success(status === 'approved' ? 'Formation approuvée' : 'Formation refusée');
    } catch (error) {
      console.error('Error updating formation:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return { formations, loading, refetch: fetchFormations, updateFormationStatus };
}

export function useAdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:profiles!services_provider_id_fkey(full_name, email),
          category:categories!services_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      toast.success(status === 'approved' ? 'Service approuvé' : 'Service refusé');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return { services, loading, refetch: fetchServices, updateServiceStatus };
}
