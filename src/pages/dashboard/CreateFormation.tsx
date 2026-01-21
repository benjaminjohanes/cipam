import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, GripVertical, Save, Eye, Loader2, Link2, FileText, Video, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";
import { useFormations } from "@/hooks/useFormations";
import { useFormationModules } from "@/hooks/useFormationModules";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { VideoUpload } from "@/components/upload/VideoUpload";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  contentType: "text" | "video";
  content: string;
  videoUrl: string;
}

export default function CreateFormation() {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories('formation');
  const { addFormation } = useFormations(true);
  const { addModules } = useFormationModules();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    level: "débutant",
    price: "",
    isFree: false,
    thumbnail: "",
    affiliationEnabled: false,
    affiliationType: "percentage" as "percentage" | "fixed",
    affiliationValue: "",
  });

  // Learning objectives
  const [learningObjectives, setLearningObjectives] = useState<string[]>([""]);

  // Formation includes options
  const [includes, setIncludes] = useState({
    certificate: false,
    lifetimeAccess: true,
    resources: false,
    community: false,
    updates: false,
  });

  const [modules, setModules] = useState<Module[]>([
    { id: "1", title: "", description: "", duration: 30, contentType: "text", content: "", videoUrl: "" },
  ]);

  // Learning objectives handlers
  const addObjective = () => {
    setLearningObjectives(prev => [...prev, ""]);
  };

  const removeObjective = (index: number) => {
    if (learningObjectives.length > 1) {
      setLearningObjectives(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateObjective = (index: number, value: string) => {
    setLearningObjectives(prev => prev.map((obj, i) => i === index ? value : obj));
  };

  const addModule = () => {
    setModules(prev => [
      ...prev,
      { id: Date.now().toString(), title: "", description: "", duration: 30, contentType: "text", content: "", videoUrl: "" },
    ]);
  };

  const removeModule = (id: string) => {
    if (modules.length > 1) {
      setModules(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateModule = (id: string, field: keyof Module, value: string | number) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const calculateTotalDuration = () => {
    const totalMinutes = modules.reduce((acc, m) => acc + m.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h${minutes > 0 ? minutes : ''}` : `${minutes}min`;
  };

  const saveFormation = async (asDraft: boolean) => {
    if (!formData.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    setSubmitting(true);

    // Filter out empty objectives
    const validObjectives = learningObjectives.filter(obj => obj.trim());

    const result = await addFormation({
      title: formData.title,
      description: formData.description || undefined,
      category_id: formData.category_id || undefined,
      level: formData.level,
      price: formData.isFree ? 0 : Number(formData.price) || 0,
      duration: calculateTotalDuration(),
      modules_count: modules.filter(m => m.title.trim()).length,
      image_url: formData.thumbnail || undefined,
      affiliation_enabled: formData.affiliationEnabled,
      affiliation_type: formData.affiliationType,
      affiliation_value: formData.affiliationEnabled ? Number(formData.affiliationValue) || 0 : 0,
      learning_objectives: validObjectives,
      includes_certificate: includes.certificate,
      includes_lifetime_access: includes.lifetimeAccess,
      includes_resources: includes.resources,
      includes_community: includes.community,
      includes_updates: includes.updates,
    });

    if (result) {
      // Save modules to the database
      const validModules = modules.filter(m => m.title.trim());
      if (validModules.length > 0) {
        const modulesToInsert = validModules.map((module, index) => ({
          formation_id: result.id,
          title: module.title,
          description: module.description || undefined,
          content_type: module.contentType as 'text' | 'video',
          content: module.contentType === 'text' ? module.content : undefined,
          video_url: module.contentType === 'video' ? module.videoUrl : undefined,
          duration_minutes: module.duration,
          position: index,
        }));

        await addModules(modulesToInsert);
      }

      toast.success(asDraft ? "Formation créée avec succès" : "Formation soumise pour validation");
      navigate("/dashboard/my-formations");
    }

    setSubmitting(false);
  };

  const handleSaveDraft = () => saveFormation(true);
  const handlePublish = () => saveFormation(false);

  return (
    <DashboardLayout title="Créer une formation" description="Partagez vos connaissances avec la communauté">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="content">Contenu & Objectifs</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>Décrivez votre formation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la formation *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Gestion du stress au quotidien"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le contenu et les objectifs de votre formation..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Chargement..." : "Sélectionnez"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.is_active).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Niveau</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData(prev => ({ ...prev, level: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">Débutant</SelectItem>
                      <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <ImageUpload
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                  bucket="formation-images"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="free"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked, affiliationEnabled: checked ? false : prev.affiliationEnabled }))}
                />
                <Label htmlFor="free">Formation gratuite</Label>
              </div>

              {!formData.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="25000"
                    className="w-40"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affiliation Card */}
          {!formData.isFree && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Programme d'affiliation
                </CardTitle>
                <CardDescription>
                  Permettez à d'autres utilisateurs de promouvoir votre formation et gagner une commission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="affiliation"
                    checked={formData.affiliationEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, affiliationEnabled: checked }))}
                  />
                  <Label htmlFor="affiliation">Activer l'affiliation</Label>
                </div>

                {formData.affiliationEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-3">
                      <Label>Type de commission</Label>
                      <RadioGroup
                        value={formData.affiliationType}
                        onValueChange={(value: "percentage" | "fixed") => setFormData(prev => ({ ...prev, affiliationType: value, affiliationValue: "" }))}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="percentage" id="percentage" />
                          <Label htmlFor="percentage" className="cursor-pointer">Pourcentage (%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed" className="cursor-pointer">Montant fixe (FCFA)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="affiliationValue">
                        {formData.affiliationType === "percentage" ? "Pourcentage de commission" : "Montant de commission"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="affiliationValue"
                          type="number"
                          value={formData.affiliationValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, affiliationValue: e.target.value }))}
                          placeholder={formData.affiliationType === "percentage" ? "10" : "5000"}
                          className="w-40"
                          min="0"
                          max={formData.affiliationType === "percentage" ? "100" : undefined}
                        />
                        <span className="text-muted-foreground">
                          {formData.affiliationType === "percentage" ? "%" : "FCFA"}
                        </span>
                      </div>
                      {formData.affiliationType === "percentage" && formData.price && formData.affiliationValue && (
                        <p className="text-sm text-muted-foreground">
                          Commission estimée: {Math.round(Number(formData.price) * Number(formData.affiliationValue) / 100)} FCFA par vente
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* New Content & Objectives Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ce que les apprenants vont acquérir
              </CardTitle>
              <CardDescription>
                Listez les compétences et connaissances que les participants acquerront
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <Input
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Ex: Comprendre les mécanismes du stress`}
                    className="flex-1"
                  />
                  {learningObjectives.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeObjective(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addObjective} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un objectif
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cette formation inclut</CardTitle>
              <CardDescription>
                Cochez ce que votre formation offre aux participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includes-certificate"
                  checked={includes.certificate}
                  onCheckedChange={(checked) => setIncludes(prev => ({ ...prev, certificate: checked === true }))}
                />
                <Label htmlFor="includes-certificate" className="cursor-pointer">
                  Certificat de complétion
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includes-lifetime"
                  checked={includes.lifetimeAccess}
                  onCheckedChange={(checked) => setIncludes(prev => ({ ...prev, lifetimeAccess: checked === true }))}
                />
                <Label htmlFor="includes-lifetime" className="cursor-pointer">
                  Accès illimité au contenu
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includes-resources"
                  checked={includes.resources}
                  onCheckedChange={(checked) => setIncludes(prev => ({ ...prev, resources: checked === true }))}
                />
                <Label htmlFor="includes-resources" className="cursor-pointer">
                  Ressources téléchargeables
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includes-community"
                  checked={includes.community}
                  onCheckedChange={(checked) => setIncludes(prev => ({ ...prev, community: checked === true }))}
                />
                <Label htmlFor="includes-community" className="cursor-pointer">
                  Accès à la communauté / Support
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="includes-updates"
                  checked={includes.updates}
                  onCheckedChange={(checked) => setIncludes(prev => ({ ...prev, updates: checked === true }))}
                />
                <Label htmlFor="includes-updates" className="cursor-pointer">
                  Mises à jour gratuites
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Modules de la formation</CardTitle>
                  <CardDescription>Organisez le contenu en modules</CardDescription>
                </div>
                <Button onClick={addModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un module
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="cursor-move text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Module {index + 1}</h4>
                        {modules.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Titre du module</Label>
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(module.id, "title", e.target.value)}
                            placeholder="Ex: Introduction à la gestion du stress"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={module.description}
                            onChange={(e) => updateModule(module.id, "description", e.target.value)}
                            placeholder="Décrivez ce que les participants apprendront..."
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Durée estimée (min)</Label>
                            <Input
                              type="number"
                              value={module.duration}
                              onChange={(e) => updateModule(module.id, "duration", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type de contenu</Label>
                            <Select
                              value={module.contentType}
                              onValueChange={(v: "text" | "video") => updateModule(module.id, "contentType", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Texte
                                  </div>
                                </SelectItem>
                                <SelectItem value="video">
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    Vidéo
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {module.contentType === "text" ? (
                          <div className="space-y-2">
                            <Label>Contenu du module</Label>
                            <Textarea
                              value={module.content}
                              onChange={(e) => updateModule(module.id, "content", e.target.value)}
                              placeholder="Rédigez le contenu détaillé du module..."
                              rows={6}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Vidéo du module</Label>
                            <VideoUpload
                              value={module.videoUrl}
                              onChange={(url) => updateModule(module.id, "videoUrl", url)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu de la formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.thumbnail ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={formData.thumbnail} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold">{formData.title || "Titre de la formation"}</h2>
                  <p className="text-muted-foreground mt-2">
                    {formData.description || "Description de la formation..."}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">
                    {formData.isFree ? "Gratuit" : `${formData.price || "0"} FCFA`}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{modules.filter(m => m.title.trim()).length} module(s)</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{calculateTotalDuration()}</span>
                </div>

                {/* Learning objectives preview */}
                {learningObjectives.some(obj => obj.trim()) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Ce que vous apprendrez</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {learningObjectives.filter(obj => obj.trim()).map((objective, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Includes preview */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Cette formation inclut</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {includes.lifetimeAccess && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Accès illimité au contenu
                      </li>
                    )}
                    {includes.certificate && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Certificat de complétion
                      </li>
                    )}
                    {includes.resources && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Ressources téléchargeables
                      </li>
                    )}
                    {includes.community && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Accès à la communauté / Support
                      </li>
                    )}
                    {includes.updates && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Mises à jour gratuites
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Programme</h3>
                  {modules.map((module, index) => (
                    <div key={module.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span>{module.title || `Module ${index + 1}`}</span>
                      <span className="text-sm text-muted-foreground ml-auto">{module.duration} min</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={handleSaveDraft} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer le brouillon
        </Button>
        <Button onClick={handlePublish} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Soumettre pour validation
        </Button>
      </div>
    </DashboardLayout>
  );
}
