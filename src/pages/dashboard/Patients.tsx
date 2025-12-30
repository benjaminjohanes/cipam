import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Patients = () => {
  return (
    <DashboardLayout title="Mes usagers" description="Gérez vos usagers">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des usagers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun usager pour le moment.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Patients;
