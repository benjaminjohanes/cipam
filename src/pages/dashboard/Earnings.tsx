import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const Earnings = () => {
  return (
    <DashboardLayout title="Revenus" description="Suivez vos revenus">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mes revenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun revenu enregistré pour le moment.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Earnings;
