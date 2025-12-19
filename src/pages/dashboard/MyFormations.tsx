import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Play, CheckCircle, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const inProgressFormations = [
  {
    id: 1,
    title: "Gestion du stress au quotidien",
    instructor: "Dr. Marie Dupont",
    progress: 65,
    totalModules: 8,
    completedModules: 5,
    nextLesson: "Module 6: Techniques de respiration avancées",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Introduction à la méditation pleine conscience",
    instructor: "Dr. Jean Martin",
    progress: 30,
    totalModules: 6,
    completedModules: 2,
    nextLesson: "Module 3: Méditation guidée",
    image: "/placeholder.svg",
  },
];

const completedFormations = [
  {
    id: 3,
    title: "Comprendre l'anxiété",
    instructor: "Dr. Sophie Lambert",
    completedAt: "2024-01-10",
    certificateAvailable: true,
  },
];

export default function MyFormations() {
  return (
    <DashboardLayout title="Mes formations" description="Suivez votre progression">
      <Tabs defaultValue="in-progress" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="in-progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to="/formations">Découvrir plus de formations</Link>
          </Button>
        </div>

        <TabsContent value="in-progress">
          <div className="grid gap-6 md:grid-cols-2">
            {inProgressFormations.map((formation) => (
              <Card key={formation.id} className="overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-1">{formation.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Par {formation.instructor}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium text-primary">{formation.progress}%</span>
                    </div>
                    <Progress value={formation.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {formation.completedModules}/{formation.totalModules} modules complétés
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground">Prochain cours</p>
                    <p className="text-sm font-medium text-foreground">{formation.nextLesson}</p>
                  </div>

                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Continuer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {completedFormations.map((formation) => (
              <Card key={formation.id}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{formation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Par {formation.instructor} • Terminé le {new Date(formation.completedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {formation.certificateAvailable && (
                    <Button variant="outline">
                      <Award className="h-4 w-4 mr-2" />
                      Télécharger le certificat
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
