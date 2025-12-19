import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const Overview = () => {
  return (
    <DashboardLayout title="Vue d'ensemble" description="Statistiques globales de la plateforme">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vue d'ensemble
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les statistiques globales seront bientôt disponibles.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Overview;
