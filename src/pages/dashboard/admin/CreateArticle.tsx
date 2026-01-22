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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, Save, Send, ArrowLeft, CalendarIcon, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
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
    mutationFn: async (status: "draft" | "published" | "scheduled") => {
      if (!user) throw new Error("Non authentifié");
      
      let scheduledAt: string | null = null;
      if (status === "scheduled" && scheduledDate) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduled = new Date(scheduledDate);
        scheduled.setHours(hours, minutes, 0, 0);
        scheduledAt = scheduled.toISOString();
      }
      
      const articleData = {
        title,
        excerpt: excerpt || null,
        content,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        author_id: user.id,
        status: status === "scheduled" ? "scheduled" : status,
        published_at: status === "published" ? new Date().toISOString() : null,
        scheduled_at: scheduledAt,
      };

      const { error } = await supabase
        .from("articles" as any)
        .insert(articleData);

      if (error) throw error;
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      const messages = {
        published: { title: "Article publié", description: "L'article est maintenant visible" },
        draft: { title: "Brouillon enregistré", description: "Vous pouvez le modifier plus tard" },
        scheduled: { title: "Publication planifiée", description: `L'article sera publié le ${scheduledDate ? format(scheduledDate, "dd MMMM yyyy", { locale: fr }) : ""} à ${scheduledTime}` },
      };
      toast(messages[status]);
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
                onClick={() => createArticle.mutate("draft")}
                disabled={!isValid || createArticle.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Brouillon
              </Button>
              {scheduledDate && (
                <Button
                  variant="secondary"
                  onClick={() => createArticle.mutate("scheduled")}
                  disabled={!isValid || createArticle.isPending}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Planifier
                </Button>
              )}
              <Button
                onClick={() => createArticle.mutate("published")}
                disabled={!isValid || createArticle.isPending}
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

export default CreateArticle;
