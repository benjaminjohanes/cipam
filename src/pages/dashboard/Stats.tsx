import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const Stats = () => {
  return (
    <DashboardLayout title="Statistiques" description="Analysez vos performances">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Mes statistiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Les statistiques seront bientôt disponibles.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Stats;
