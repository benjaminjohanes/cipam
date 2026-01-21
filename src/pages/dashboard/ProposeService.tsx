import { useState } from "react";
import { motion } from "framer-motion";
import { Send, HelpCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { ImageUpload } from "@/components/upload/ImageUpload";

export default function ProposeService() {
  const navigate = useNavigate();
  const { addService } = useServices(true);
  const { categories } = useCategories("service");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: 0,
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await addService({
      title: formData.title,
      description: formData.description,
      category_id: formData.category_id || undefined,
      price: formData.price,
      image_url: formData.image_url,
    });
    
    if (result) {
      navigate("/dashboard/my-services");
    }
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout title="Proposer un service" description="Soumettez votre proposition pour validation">
      <div className="max-w-2xl mx-auto space-y-6">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>Comment ça marche ?</AlertTitle>
          <AlertDescription>
            Votre proposition sera examinée par notre équipe dans un délai de 48h. 
            Une fois approuvée, votre service sera visible sur la plateforme.
          </AlertDescription>
        </Alert>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Détails du service</CardTitle>
              <CardDescription>Décrivez le service que vous souhaitez proposer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du service *</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Accompagnement scolaire en mathématiques"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez en détail votre service, votre approche, ce que le client peut attendre..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (FCFA) *</Label>
                    <Input
                      id="price"
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image du service</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    bucket="services"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Soumettre ma proposition
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
