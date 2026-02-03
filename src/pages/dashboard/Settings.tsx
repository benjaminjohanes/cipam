import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Shield, Moon, Globe, DollarSign } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Currency } from "@/lib/currency";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  return (
    <DashboardLayout title="Paramètres" description="Configurez votre compte">
      <div className="max-w-2xl space-y-6">
        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Devise
            </CardTitle>
            <CardDescription>
              Choisissez la devise par défaut pour l'affichage des prix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={currency} 
              onValueChange={(value) => setCurrency(value as Currency)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FCFA" id="fcfa" />
                <Label htmlFor="fcfa" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-lg">🇨🇫</span>
                  <div>
                    <p className="font-medium">Franc CFA (FCFA)</p>
                    <p className="text-xs text-muted-foreground">Devise locale</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <Label htmlFor="usd" className="flex items-center gap-2 cursor-pointer">
                  <span className="text-lg">🇺🇸</span>
                  <div>
                    <p className="font-medium">Dollar US (USD)</p>
                    <p className="text-xs text-muted-foreground">Devise internationale</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground mt-4">
              Note : Les taux de conversion sont approximatifs (1 USD ≈ 625 FCFA)
            </p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications email</Label>
                <p className="text-sm text-muted-foreground">Recevez des emails pour les rendez-vous</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Rappels de rendez-vous</Label>
                <p className="text-sm text-muted-foreground">Rappel 24h avant chaque rendez-vous</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Nouvelles formations</Label>
                <p className="text-sm text-muted-foreground">Alertes pour les nouvelles formations</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Confidentialité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Profil public</Label>
                <p className="text-sm text-muted-foreground">Votre profil est visible par tous</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Afficher le téléphone</Label>
                <p className="text-sm text-muted-foreground">Votre numéro est visible sur votre profil</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode sombre</Label>
                <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
              </div>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Langue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">La langue de l'interface</p>
            <Button variant="outline">Français</Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Supprimer mon compte</p>
                <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
              </div>
              <Button variant="destructive" size="sm">Supprimer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
