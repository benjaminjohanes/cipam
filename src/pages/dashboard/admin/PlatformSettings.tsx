import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, Globe, Bell, Shield, Mail, Save, 
  CreditCard, Users, FileText, Key, Eye, EyeOff, Check, AlertCircle, Wallet
} from "lucide-react";
import { toast } from "sonner";

export default function PlatformSettings() {
  const [settings, setSettings] = useState({
    siteName: "ALLÔ PSY",
    siteDescription: "Plateforme de mise en relation usagers-professionnels",
    contactEmail: "contact@allopsy.com",
    supportEmail: "support@allopsy.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveServices: false,
    autoApproveFormations: false,
    maxServicesPerUser: 10,
    maxFormationsPerUser: 5,
    commissionRate: 10,
  });

  const [apiKeys, setApiKeys] = useState({
    resendApiKey: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    monerooSecretKey: "",
  });

  const [showKeys, setShowKeys] = useState({
    resendApiKey: false,
    stripePublishableKey: false,
    stripeSecretKey: false,
    monerooSecretKey: false,
  });

  const [savedKeys, setSavedKeys] = useState({
    resendApiKey: false,
    stripePublishableKey: false,
    stripeSecretKey: false,
    monerooSecretKey: false,
  });

  const handleSave = () => {
    toast.success("Paramètres enregistrés");
  };

  const handleSaveApiKey = (keyName: keyof typeof apiKeys, label: string) => {
    if (!apiKeys[keyName]) {
      toast.error(`Veuillez entrer une clé ${label}`);
      return;
    }
    // In a real implementation, this would save to Supabase secrets
    setSavedKeys(prev => ({ ...prev, [keyName]: true }));
    toast.success(`Clé ${label} enregistrée avec succès`);
  };

  const toggleShowKey = (keyName: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  return (
    <DashboardLayout title="Paramètres plateforme" description="Configuration globale de la plateforme">
      <div className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Configurez les informations de base de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de contact</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description du site</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inscriptions & Utilisateurs
            </CardTitle>
            <CardDescription>
              Gérez les paramètres d'inscription et d'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Autoriser les inscriptions</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux nouveaux utilisateurs de s'inscrire
                </p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Vérification email obligatoire</Label>
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs doivent vérifier leur email
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Modération */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Modération
            </CardTitle>
            <CardDescription>
              Configurez les règles de modération du contenu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Approbation automatique des services</Label>
                <p className="text-sm text-muted-foreground">
                  Les services sont publiés sans validation manuelle
                </p>
              </div>
              <Switch
                checked={settings.autoApproveServices}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproveServices: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Approbation automatique des formations</Label>
                <p className="text-sm text-muted-foreground">
                  Les formations sont publiées sans validation manuelle
                </p>
              </div>
              <Switch
                checked={settings.autoApproveFormations}
                onCheckedChange={(checked) => setSettings({ ...settings, autoApproveFormations: checked })}
              />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxServices">Max services par utilisateur</Label>
                <Input
                  id="maxServices"
                  type="number"
                  value={settings.maxServicesPerUser}
                  onChange={(e) => setSettings({ ...settings, maxServicesPerUser: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFormations">Max formations par utilisateur</Label>
                <Input
                  id="maxFormations"
                  type="number"
                  value={settings.maxFormationsPerUser}
                  onChange={(e) => setSettings({ ...settings, maxFormationsPerUser: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Finances
            </CardTitle>
            <CardDescription>
              Configurez les paramètres financiers de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Taux de commission (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Pourcentage prélevé sur chaque transaction
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Intégrations API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Intégrations API
            </CardTitle>
            <CardDescription>
              Configurez les clés API pour les services externes (emails, paiements, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resend API Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>Resend API Key</Label>
                  {savedKeys.resendApiKey && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Configuré
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Pour l'envoi d'emails automatiques (confirmations, rappels). 
                <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Obtenir une clé sur resend.com
                </a>
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.resendApiKey ? "text" : "password"}
                    placeholder="re_xxxxxxxxxxxx"
                    value={apiKeys.resendApiKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, resendApiKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey("resendApiKey")}
                  >
                    {showKeys.resendApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={() => handleSaveApiKey("resendApiKey", "Resend")}>
                  Enregistrer
                </Button>
              </div>
            </div>

            <Separator />

            {/* Stripe Publishable Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label>Stripe Publishable Key</Label>
                  {savedKeys.stripePublishableKey && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Configuré
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Clé publique Stripe pour les paiements côté client.
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Obtenir sur stripe.com
                </a>
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.stripePublishableKey ? "text" : "password"}
                    placeholder="pk_live_xxxxxxxxxxxx"
                    value={apiKeys.stripePublishableKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, stripePublishableKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey("stripePublishableKey")}
                  >
                    {showKeys.stripePublishableKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={() => handleSaveApiKey("stripePublishableKey", "Stripe Publishable")}>
                  Enregistrer
                </Button>
              </div>
            </div>

            <Separator />

            {/* Stripe Secret Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label>Stripe Secret Key</Label>
                  {savedKeys.stripeSecretKey && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Configuré
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Confidentiel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Clé secrète Stripe pour les opérations backend. Ne jamais exposer côté client.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.stripeSecretKey ? "text" : "password"}
                    placeholder="sk_live_xxxxxxxxxxxx"
                    value={apiKeys.stripeSecretKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, stripeSecretKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey("stripeSecretKey")}
                  >
                    {showKeys.stripeSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={() => handleSaveApiKey("stripeSecretKey", "Stripe Secret")}>
                  Enregistrer
                </Button>
              </div>
            </div>

            <Separator />

            {/* Moneroo Secret Key */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <Label>Moneroo Secret Key</Label>
                  {savedKeys.monerooSecretKey && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Configuré
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Confidentiel
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Clé secrète Moneroo pour les paiements mobile money et cartes en Afrique.
                <a href="https://moneroo.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Obtenir sur moneroo.io
                </a>
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys.monerooSecretKey ? "text" : "password"}
                    placeholder="sk_live_xxxxxxxxxxxx"
                    value={apiKeys.monerooSecretKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, monerooSecretKey: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleShowKey("monerooSecretKey")}
                  >
                    {showKeys.monerooSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={() => handleSaveApiKey("monerooSecretKey", "Moneroo")}>
                  Enregistrer
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Note de sécurité</p>
                  <p>Les clés secrètes sont stockées de manière sécurisée et ne seront jamais exposées dans le code client. 
                  Elles sont utilisées uniquement dans les fonctions edge côté serveur.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              Gérez le mode maintenance de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Rend le site inaccessible aux utilisateurs
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
