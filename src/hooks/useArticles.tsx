import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Article {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  author_id: string;
  category_id: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    email: string;
  };
}

export const useArticles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch authors separately
      const authorIds = [...new Set((data || []).map((a: any) => a.author_id))];
      const { data: authors } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", authorIds);
      
      const authorsMap = new Map((authors || []).map(a => [a.id, a]));
      
      return (data || []).map((article: any) => ({
        ...article,
        author: authorsMap.get(article.author_id),
      })) as Article[];
    },
  });

  const updateArticleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: { status: string; published_at?: string | null } = { status };
      if (status === "published") {
        updates.published_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("articles" as any)
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ title: "Article supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article", variant: "destructive" });
    },
  });

  return { articles, isLoading, updateArticleStatus, deleteArticle };
};
