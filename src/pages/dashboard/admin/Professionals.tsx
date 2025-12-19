import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

const Professionals = () => {
  return (
    <DashboardLayout title="Professionnels" description="Gestion des professionnels de la plateforme">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Liste des professionnels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestion des professionnels sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Professionals;
