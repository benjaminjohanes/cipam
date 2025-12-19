import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

const Students = () => {
  return (
    <DashboardLayout title="Étudiants" description="Gestion des étudiants de la plateforme">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Liste des étudiants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestion des étudiants sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Students;
