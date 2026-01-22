import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { FileText, Save, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EditArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("articles" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as {
        id: string;
        title: string;
        excerpt: string | null;
        content: string | null;
        image_url: string | null;
        category_id: string | null;
        status: string;
      };
    },
    enabled: !!id,
  });

  const { data: categories } = useQuery({
    queryKey: ["article-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("type", "article")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title || "");
      setExcerpt(article.excerpt || "");
      setContent(article.content || "");
      setImageUrl(article.image_url || "");
      setCategoryId(article.category_id || "");
    }
  }, [article]);

  const updateArticle = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      if (!id) throw new Error("ID manquant");
      
      const articleData: Record<string, unknown> = {
        title,
        excerpt: excerpt || null,
        content,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "published" && article?.status !== "published") {
        articleData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("articles" as any)
        .update(articleData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      toast({ 
        title: status === "published" ? "Article publié" : "Modifications enregistrées",
      });
      navigate("/dashboard/all-articles");
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour l'article", 
        variant: "destructive" 
      });
    },
  });

  const isValid = title.trim() && content.trim();

  if (articleLoading) {
    return (
      <DashboardLayout title="Modifier l'article" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout title="Article introuvable" description="">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Cet article n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/dashboard/all-articles")}>
            Retour aux articles
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Modifier l'article" description="Éditer un article existant">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/all-articles")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux articles
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Modifier l'article
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'article"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Résumé</Label>
              <Input
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Court résumé de l'article (optionnel)"
              />
            </div>

            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                bucket="article-images"
              />
            </div>

            <div className="space-y-2">
              <Label>Contenu *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Rédigez le contenu de votre article..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => updateArticle.mutate("draft")}
                disabled={!isValid || updateArticle.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer en brouillon
              </Button>
              <Button
                onClick={() => updateArticle.mutate("published")}
                disabled={!isValid || updateArticle.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Publier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditArticle;
