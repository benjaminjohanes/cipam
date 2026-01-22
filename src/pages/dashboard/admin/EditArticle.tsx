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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Save, Send, ArrowLeft, Loader2, CalendarIcon, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("09:00");

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
        scheduled_at: string | null;
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
      if (article.scheduled_at) {
        const scheduled = new Date(article.scheduled_at);
        setScheduledDate(scheduled);
        setScheduledTime(format(scheduled, "HH:mm"));
      }
    }
  }, [article]);

  const updateArticle = useMutation({
    mutationFn: async (status: "draft" | "published" | "scheduled") => {
      if (!id) throw new Error("ID manquant");
      
      let scheduledAt: string | null = null;
      if (status === "scheduled" && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduled = new Date(scheduledDate);
        scheduled.setHours(hours, minutes, 0, 0);
        scheduledAt = scheduled.toISOString();
      }
      
      const articleData: Record<string, unknown> = {
        title,
        excerpt: excerpt || null,
        content,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        status: status === "scheduled" ? "scheduled" : status,
        updated_at: new Date().toISOString(),
        scheduled_at: scheduledAt,
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
      const messages = {
        published: "Article publié",
        draft: "Modifications enregistrées",
        scheduled: `Publication planifiée pour le ${scheduledDate ? format(scheduledDate, "dd MMMM yyyy", { locale: fr }) : ""} à ${scheduledTime}`,
      };
      toast({ title: messages[status] });
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

            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Planifier la publication (optionnel)
              </Label>
              <div className="grid gap-4 md:grid-cols-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP", { locale: fr }) : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
              {scheduledDate && (
                <p className="text-sm text-muted-foreground">
                  L'article sera automatiquement publié le {format(scheduledDate, "dd MMMM yyyy", { locale: fr })} à {scheduledTime}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end flex-wrap">
              <Button
                variant="outline"
                onClick={() => updateArticle.mutate("draft")}
                disabled={!isValid || updateArticle.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Brouillon
              </Button>
              {scheduledDate && (
                <Button
                  variant="secondary"
                  onClick={() => updateArticle.mutate("scheduled")}
                  disabled={!isValid || updateArticle.isPending}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Planifier
                </Button>
              )}
              <Button
                onClick={() => updateArticle.mutate("published")}
                disabled={!isValid || updateArticle.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Publier maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditArticle;
