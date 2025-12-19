import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

const FormationsCatalog = () => {
  return (
    <DashboardLayout title="Catalogue des formations" description="Découvrez toutes les formations disponibles">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Formations disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Le catalogue de formations sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FormationsCatalog;
