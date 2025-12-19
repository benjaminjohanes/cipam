import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  return (
    <DashboardLayout title="Messages" description="Vos conversations">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messagerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun message pour le moment.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Messages;
