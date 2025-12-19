import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const Payments = () => {
  return (
    <DashboardLayout title="Historique des paiements" description="Consultez vos transactions et factures">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mes paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun paiement pour le moment.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Payments;
