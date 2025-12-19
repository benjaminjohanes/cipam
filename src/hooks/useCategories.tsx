import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  type: 'formation' | 'service' | 'both';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = (type?: 'formation' | 'service' | 'both') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name');

      if (type && type !== 'both') {
        query = query.or(`type.eq.${type},type.eq.both`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCategories((data as Category[]) || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les catégories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: { name: string; description?: string; type: 'formation' | 'service' | 'both' }) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data as Category].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: "Succès",
        description: "Catégorie ajoutée avec succès"
      });
      return data;
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => prev.map(c => c.id === id ? (data as Category) : c));
      toast({
        title: "Succès",
        description: "Catégorie mise à jour"
      });
      return data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Succès",
        description: "Catégorie supprimée"
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
};
