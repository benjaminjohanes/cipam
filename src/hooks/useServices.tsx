import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Service {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  price: number;
  image_url: string | null;
  status: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
  } | null;
}

export interface ServiceInsert {
  title: string;
  description?: string;
  category_id?: string;
  price?: number;
  image_url?: string;
}

export const useServices = (onlyOwn: boolean = false) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchServices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          categories (id, name)
        `)
        .order('created_at', { ascending: false });

      if (onlyOwn && user) {
        query = query.eq('provider_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices((data as Service[]) || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (service: ServiceInsert) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un service",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          ...service,
          provider_id: user.id,
          status: 'pending'
        }])
        .select(`
          *,
          categories (id, name)
        `)
        .single();

      if (error) throw error;
      
      setServices(prev => [data as Service, ...prev]);
      toast({
        title: "Succès",
        description: "Service créé avec succès"
      });
      return data;
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le service",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateService = async (id: string, updates: Partial<ServiceInsert>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories (id, name)
        `)
        .single();

      if (error) throw error;
      
      setServices(prev => prev.map(s => s.id === id ? (data as Service) : s));
      toast({
        title: "Succès",
        description: "Service mis à jour"
      });
      return data;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le service",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setServices(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Succès",
        description: "Service supprimé"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (!onlyOwn || user) {
      fetchServices();
    }
  }, [onlyOwn, user?.id]);

  return {
    services,
    loading,
    fetchServices,
    addService,
    updateService,
    deleteService
  };
};
