import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Settings, Globe, Bell, Shield, Mail, Save, 
  CreditCard, Users, FileText, Key, Eye, EyeOff, Check, AlertCircle, Wallet, Building2, MapPin, Loader2,
  Palette, Image as ImageIcon, Upload, X, Phone
} from "lucide-react";
import { toast } from "sonner";
import { 
  useAlternativePaymentSettings, 
  useUpdateAlternativePaymentSettings, 
  useBrandingSettings,
  useUpdateBrandingSettings,
  AlternativePaymentSettings,
  BrandingSettings
} from "@/hooks/usePlatformSettings";
import { supabase } from "@/integrations/supabase/client";

export default function PlatformSettings() {
  // Alternative payment settings
  const { data: alternativePaymentSettings, isLoading: isLoadingPaymentSettings } = useAlternativePaymentSettings();
  const updateAlternativePayment = useUpdateAlternativePaymentSettings();
  
  // Branding settings
  const { data: brandingSettings, isLoading: isLoadingBranding } = useBrandingSettings();
  const updateBranding = useUpdateBrandingSettings();
  
  const [altPaymentSettings, setAltPaymentSettings] = useState<AlternativePaymentSettings>({
    enabled: false,
    methods: [],
    bank_details: {
      bank_name: "",
      account_number: "",
      account_name: "",
    },
    instructions: "",
  });

  const [branding, setBranding] = useState<BrandingSettings>({
    site_name: "Allô Psy",
    slogan: "Vous méritez d'être écouté et soutenu, sans jugement",
    header_logo: "",
    footer_logo: "",
    favicon: "",
    primary_color: "215 55% 25%",
    accent_color: "135 45% 50%",
    contact_email: "cipam.global.contact@gmail.com",
    contact_phones: ["+229 01 52 01 17 77", "+229 01 59 05 40 93"],
    contact_address: "Abomey-Calavi, Benin",
  });

  const [uploading, setUploading] = useState<{ header: boolean; footer: boolean; favicon: boolean }>({
    header: false,
    footer: false,
    favicon: false,
  });

  const headerLogoRef = useRef<HTMLInputElement>(null);
  const footerLogoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (alternativePaymentSettings) {
      setAltPaymentSettings(alternativePaymentSettings);
    }
  }, [alternativePaymentSettings]);

  useEffect(() => {
    if (brandingSettings) {
      setBranding(brandingSettings);
    }
  }, [brandingSettings]);

  const [settings, setSettings] = useState({
    siteName: "Allô Psy",
    siteDescription: "Plateforme de mise en relation usagers-professionnels",
    contactEmail: "cipam.global.contact@gmail.com",
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
    setSavedKeys(prev => ({ ...prev, [keyName]: true }));
    toast.success(`Clé ${label} enregistrée avec succès`);
  };

  const toggleShowKey = (keyName: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const handleSaveAlternativePayment = () => {
    updateAlternativePayment.mutate(altPaymentSettings);
  };

  const togglePaymentMethod = (method: "bank_transfer" | "on_site") => {
    setAltPaymentSettings(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  const handleImageUpload = async (
    file: File, 
    type: "header" | "footer" | "favicon"
  ) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/x-icon", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Type de fichier non supporté. Utilisez JPG, PNG, WebP, GIF, ICO ou SVG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5MB)");
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("branding")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("branding")
        .getPublicUrl(fileName);

      const fieldMap = {
        header: "header_logo",
        footer: "footer_logo",
        favicon: "favicon",
      } as const;

      setBranding(prev => ({ ...prev, [fieldMap[type]]: publicUrl }));
      toast.success("Image téléchargée");
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSaveBranding = () => {
    updateBranding.mutate(branding);
  };

  const ImageUploadField = ({ 
    label, 
    value, 
    type, 
    inputRef,
    description
  }: { 
    label: string; 
    value: string; 
    type: "header" | "footer" | "favicon";
    inputRef: React.RefObject<HTMLInputElement>;
    description: string;
  }) => (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/x-icon,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, type);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img 
              src={value} 
              alt={label} 
              className="h-16 w-auto max-w-32 object-contain border rounded-lg bg-muted p-2" 
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                const fieldMap = { header: "header_logo", footer: "footer_logo", favicon: "favicon" } as const;
                setBranding(prev => ({ ...prev, [fieldMap[type]]: "" }));
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading[type]}
          >
            {uploading[type] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Changer"}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading[type]}
        >
          {uploading[type] ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Télécharger
        </Button>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Paramètres plateforme" description="Configuration globale de la plateforme">
      <div className="space-y-6">
        {/* Branding & Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'identité visuelle de la plateforme (logos, couleurs)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingBranding ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : (
              <>
                {/* Site Name & Slogan */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brandSiteName">Nom du site</Label>
                    <Input
                      id="brandSiteName"
                      value={branding.site_name}
                      onChange={(e) => setBranding(prev => ({ ...prev, site_name: e.target.value }))}
                      placeholder="Allô Psy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandSlogan">Slogan</Label>
                    <Input
                      id="brandSlogan"
                      value={branding.slogan}
                      onChange={(e) => setBranding(prev => ({ ...prev, slogan: e.target.value }))}
                      placeholder="Vous méritez d'être écouté et soutenu, sans jugement"
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Informations de contact</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail" className="text-sm text-muted-foreground">Email de contact</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="contactEmail"
                          type="email"
                          value={branding.contact_email}
                          onChange={(e) => setBranding(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder="contact@allopsy.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactAddress" className="text-sm text-muted-foreground">Adresse</Label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          id="contactAddress"
                          value={branding.contact_address}
                          onChange={(e) => setBranding(prev => ({ ...prev, contact_address: e.target.value }))}
                          placeholder="Abomey-Calavi, Benin"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Numéros de téléphone</Label>
                    <div className="space-y-2">
                      {(branding.contact_phones || []).map((phone, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <Input
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...(branding.contact_phones || [])];
                              newPhones[index] = e.target.value;
                              setBranding(prev => ({ ...prev, contact_phones: newPhones }));
                            }}
                            placeholder="+229 00 00 00 00 00"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newPhones = (branding.contact_phones || []).filter((_, i) => i !== index);
                              setBranding(prev => ({ ...prev, contact_phones: newPhones }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setBranding(prev => ({ 
                            ...prev, 
                            contact_phones: [...(prev.contact_phones || []), ""] 
                          }));
                        }}
                      >
                        + Ajouter un numéro
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Logos */}
                <div className="grid gap-6 md:grid-cols-3">
                  <ImageUploadField
                    label="Logo Header"
                    value={branding.header_logo}
                    type="header"
                    inputRef={headerLogoRef}
                    description="Logo affiché dans l'en-tête"
                  />
                  <ImageUploadField
                    label="Logo Footer"
                    value={branding.footer_logo}
                    type="footer"
                    inputRef={footerLogoRef}
                    description="Logo affiché dans le pied de page"
                  />
                  <ImageUploadField
                    label="Favicon"
                    value={branding.favicon}
                    type="favicon"
                    inputRef={faviconRef}
                    description="Icône du navigateur (16x16 ou 32x32)"
                  />
                </div>

                <Separator />

                {/* Colors */}
                <div className="space-y-4">
                  <Label>Couleurs de la plateforme</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="text-sm text-muted-foreground">Couleur primaire (HSL)</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg border flex-shrink-0"
                          style={{ backgroundColor: `hsl(${branding.primary_color})` }}
                        />
                        <Input
                          id="primaryColor"
                          value={branding.primary_color}
                          onChange={(e) => setBranding(prev => ({ ...prev, primary_color: e.target.value }))}
                          placeholder="215 55% 25%"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Format: H S% L% (ex: 215 55% 25%)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accentColor" className="text-sm text-muted-foreground">Couleur d'accent (HSL)</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg border flex-shrink-0"
                          style={{ backgroundColor: `hsl(${branding.accent_color})` }}
                        />
                        <Input
                          id="accentColor"
                          value={branding.accent_color}
                          onChange={(e) => setBranding(prev => ({ ...prev, accent_color: e.target.value }))}
                          placeholder="135 45% 50%"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Format: H S% L% (ex: 135 45% 50%)</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveBranding} 
                  disabled={updateBranding.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateBranding.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer le branding
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

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

        {/* Paiements alternatifs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Paiements alternatifs
            </CardTitle>
            <CardDescription>
              Configurez les options de paiement alternatives pour les événements (virement, sur place)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingPaymentSettings ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Activer les paiements alternatifs</Label>
                    <p className="text-sm text-muted-foreground">
                      Permet aux utilisateurs de payer par virement ou sur place
                    </p>
                  </div>
                  <Switch
                    checked={altPaymentSettings.enabled}
                    onCheckedChange={(checked) => setAltPaymentSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {altPaymentSettings.enabled && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <Label>Méthodes de paiement autorisées</Label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="bank_transfer"
                            checked={altPaymentSettings.methods.includes("bank_transfer")}
                            onCheckedChange={() => togglePaymentMethod("bank_transfer")}
                          />
                          <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            Virement bancaire
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            id="on_site"
                            checked={altPaymentSettings.methods.includes("on_site")}
                            onCheckedChange={() => togglePaymentMethod("on_site")}
                          />
                          <Label htmlFor="on_site" className="flex items-center gap-2 cursor-pointer">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Paiement sur place
                          </Label>
                        </div>
                      </div>
                    </div>

                    {altPaymentSettings.methods.includes("bank_transfer") && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <Label>Informations bancaires</Label>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="bankName">Nom de la banque</Label>
                              <Input
                                id="bankName"
                                placeholder="Ex: Ecobank"
                                value={altPaymentSettings.bank_details.bank_name}
                                onChange={(e) => setAltPaymentSettings(prev => ({
                                  ...prev,
                                  bank_details: { ...prev.bank_details, bank_name: e.target.value }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="accountNumber">Numéro de compte</Label>
                              <Input
                                id="accountNumber"
                                placeholder="Ex: TG1234567890"
                                value={altPaymentSettings.bank_details.account_number}
                                onChange={(e) => setAltPaymentSettings(prev => ({
                                  ...prev,
                                  bank_details: { ...prev.bank_details, account_number: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="accountName">Nom du titulaire</Label>
                            <Input
                              id="accountName"
                              placeholder="Ex: Allô Psy SARL"
                              value={altPaymentSettings.bank_details.account_name}
                              onChange={(e) => setAltPaymentSettings(prev => ({
                                ...prev,
                                bank_details: { ...prev.bank_details, account_name: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="instructions">Instructions pour les utilisateurs</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Ex: Veuillez effectuer le virement et envoyer la preuve de paiement par email à..."
                        value={altPaymentSettings.instructions}
                        onChange={(e) => setAltPaymentSettings(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <Button 
                  onClick={handleSaveAlternativePayment} 
                  disabled={updateAlternativePayment.isPending}
                  className="w-full sm:w-auto"
                >
                  {updateAlternativePayment.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les paramètres de paiement
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

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
