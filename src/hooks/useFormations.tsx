import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Formation {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  price: number;
  level: string;
  duration: string | null;
  modules_count: number | null;
  image_url: string | null;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  affiliation_enabled: boolean | null;
  affiliation_type: string | null;
  affiliation_value: number | null;
  categories?: {
    id: string;
    name: string;
  } | null;
}

export interface FormationInsert {
  title: string;
  description?: string;
  category_id?: string;
  price?: number;
  level?: string;
  duration?: string;
  modules_count?: number;
  image_url?: string;
  affiliation_enabled?: boolean;
  affiliation_type?: string;
  affiliation_value?: number;
}

export const useFormations = (onlyOwn: boolean = false) => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchFormations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('formations')
        .select(`
          *,
          categories (id, name)
        `)
        .order('created_at', { ascending: false });

      if (onlyOwn && user) {
        query = query.eq('author_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFormations((data as Formation[]) || []);
    } catch (error: any) {
      console.error('Error fetching formations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFormation = async (formation: FormationInsert) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer une formation",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('formations')
        .insert([{
          ...formation,
          author_id: user.id,
          status: 'pending'
        }])
        .select(`
          *,
          categories (id, name)
        `)
        .single();

      if (error) throw error;
      
      setFormations(prev => [data as Formation, ...prev]);
      toast({
        title: "Succès",
        description: "Formation créée avec succès"
      });
      return data;
    } catch (error: any) {
      console.error('Error adding formation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la formation",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateFormation = async (id: string, updates: Partial<FormationInsert>) => {
    try {
      const { data, error } = await supabase
        .from('formations')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          categories (id, name)
        `)
        .single();

      if (error) throw error;
      
      setFormations(prev => prev.map(f => f.id === id ? (data as Formation) : f));
      toast({
        title: "Succès",
        description: "Formation mise à jour"
      });
      return data;
    } catch (error: any) {
      console.error('Error updating formation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la formation",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteFormation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('formations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFormations(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Succès",
        description: "Formation supprimée"
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting formation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la formation",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (!onlyOwn || user) {
      fetchFormations();
    }
  }, [onlyOwn, user?.id]);

  return {
    formations,
    loading,
    fetchFormations,
    addFormation,
    updateFormation,
    deleteFormation
  };
};
