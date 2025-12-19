import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";

const Team = () => {
  return (
    <DashboardLayout title="Équipe admin" description="Gestion de l'équipe d'administration">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Équipe d'administration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestion de l'équipe sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Team;
