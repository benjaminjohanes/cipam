import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const FindProfessional = () => {
  return (
    <DashboardLayout title="Trouver un professionnel" description="Recherchez et contactez des professionnels de santé">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Annuaire des professionnels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cette fonctionnalité sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FindProfessional;
