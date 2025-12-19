import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const PendingServices = () => {
  return (
    <DashboardLayout title="Demandes en attente" description="Services en attente de validation">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Services en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun service en attente de validation.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PendingServices;
