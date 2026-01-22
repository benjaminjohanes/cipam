import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, CheckCircle, XCircle, Plus, Pencil, RotateCcw } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AllArticles = () => {
  const navigate = useNavigate();
  const { articles, isLoading, updateArticleStatus, deleteArticle } = useArticles();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publié</Badge>;
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "archived":
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Articles" description="Gestion des articles de la plateforme">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tous les articles ({articles?.length || 0})
            </CardTitle>
            <Button onClick={() => navigate("/dashboard/create-article")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : articles && articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.author?.full_name || article.author?.email || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(article.status)}</TableCell>
                    <TableCell>
                      {format(new Date(article.created_at), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/edit-article/${article.id}`)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {article.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateArticleStatus.mutate({ id: article.id, status: "published" })}
                            title="Publier"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {article.status === "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateArticleStatus.mutate({ id: article.id, status: "archived" })}
                            title="Archiver"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {article.status === "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateArticleStatus.mutate({ id: article.id, status: "published" })}
                            title="Republier"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteArticle.mutate(article.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Aucun article pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AllArticles;
