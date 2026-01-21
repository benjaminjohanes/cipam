import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FormationModule {
  id: string;
  formation_id: string;
  title: string;
  description: string | null;
  content_type: 'text' | 'video';
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ModuleInsert {
  formation_id: string;
  title: string;
  description?: string;
  content_type?: 'text' | 'video';
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  position?: number;
}

export const useFormationModules = () => {
  const [modules, setModules] = useState<FormationModule[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchModulesByFormation = async (formationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('formation_modules')
        .select('*')
        .eq('formation_id', formationId)
        .order('position', { ascending: true });

      if (error) throw error;
      setModules((data as FormationModule[]) || []);
      return data as FormationModule[];
    } catch (error: any) {
      console.error('Error fetching modules:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addModules = async (modulesData: ModuleInsert[]) => {
    if (modulesData.length === 0) return [];

    try {
      const { data, error } = await supabase
        .from('formation_modules')
        .insert(modulesData)
        .select();

      if (error) throw error;
      return data as FormationModule[];
    } catch (error: any) {
      console.error('Error adding modules:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les modules",
        variant: "destructive"
      });
      return [];
    }
  };

  const updateModule = async (id: string, updates: Partial<ModuleInsert>) => {
    try {
      const { data, error } = await supabase
        .from('formation_modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setModules(prev => prev.map(m => m.id === id ? (data as FormationModule) : m));
      return data as FormationModule;
    } catch (error: any) {
      console.error('Error updating module:', error);
      return null;
    }
  };

  const deleteModule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('formation_modules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setModules(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting module:', error);
      return false;
    }
  };

  const deleteModulesByFormation = async (formationId: string) => {
    try {
      const { error } = await supabase
        .from('formation_modules')
        .delete()
        .eq('formation_id', formationId);

      if (error) throw error;
      setModules([]);
      return true;
    } catch (error: any) {
      console.error('Error deleting modules:', error);
      return false;
    }
  };

  return {
    modules,
    loading,
    fetchModulesByFormation,
    addModules,
    updateModule,
    deleteModule,
    deleteModulesByFormation
  };
};
