import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const AllArticles = () => {
  return (
    <DashboardLayout title="Articles" description="Gestion des articles de la plateforme">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tous les articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">La gestion des articles sera bientôt disponible.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AllArticles;
