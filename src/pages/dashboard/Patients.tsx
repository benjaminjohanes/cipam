import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const Patients = () => {
  return (
    <DashboardLayout title="Mes patients" description="Gérez vos patients">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun patient pour le moment.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Patients;
