import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const PlatformSettings = () => {
  return (
    <DashboardLayout title="Paramètres plateforme" description="Configuration globale de la plateforme">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration de la plateforme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les paramètres de la plateforme seront bientôt disponibles.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PlatformSettings;
