import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const Roles = () => {
  return (
    <DashboardLayout title="Rôles & Permissions" description="Gestion des rôles et permissions">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Rôles et permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestion des rôles sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Roles;
