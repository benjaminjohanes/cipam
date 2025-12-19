import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { FileText, Save, Send, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CreateArticle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

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

  const createArticle = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      if (!user) throw new Error("Non authentifié");
      
      const articleData = {
        title,
        excerpt: excerpt || null,
        content,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        author_id: user.id,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from("articles" as any)
        .insert(articleData);

      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast({ 
        title: status === "published" ? "Article publié" : "Brouillon enregistré",
        description: status === "published" 
          ? "L'article est maintenant visible" 
          : "Vous pouvez le modifier plus tard"
      });
      navigate("/dashboard/all-articles");
    },
    onError: () => {
      toast({ 
        title: "Erreur", 
        description: "Impossible de créer l'article", 
        variant: "destructive" 
      });
    },
  });

  const isValid = title.trim() && content.trim();

  return (
    <DashboardLayout title="Créer un article" description="Rédiger un nouvel article pour la plateforme">
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/dashboard/all-articles")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux articles
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nouvel article
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
                onClick={() => createArticle.mutate("draft")}
                disabled={!isValid || createArticle.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer en brouillon
              </Button>
              <Button
                onClick={() => createArticle.mutate("published")}
                disabled={!isValid || createArticle.isPending}
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

export default CreateArticle;
