import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Tags, BookOpen, Briefcase, Layers } from 'lucide-react';
import { useCategories, Category } from '@/hooks/useCategories';

const Categories = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'both' as 'formation' | 'service' | 'both'
  });

  const handleAdd = async () => {
    if (!formData.name.trim()) return;
    
    try {
      await addCategory(formData);
      setFormData({ name: '', description: '', type: 'both' });
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEdit = async () => {
    if (!selectedCategory || !formData.name.trim()) return;
    
    try {
      await updateCategory(selectedCategory.id, formData);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      await deleteCategory(id);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type
    });
    setIsEditDialogOpen(true);
  };

  const toggleActive = async (category: Category) => {
    await updateCategory(category.id, { is_active: !category.is_active });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'formation': return <BookOpen className="h-4 w-4" />;
      case 'service': return <Briefcase className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      formation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      service: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      both: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    const labels: Record<string, string> = {
      formation: 'Formation',
      service: 'Service',
      both: 'Les deux'
    };
    return (
      <Badge className={variants[type]}>
        {getTypeIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    );
  };

  const stats = {
    total: categories.length,
    formations: categories.filter(c => c.type === 'formation' || c.type === 'both').length,
    services: categories.filter(c => c.type === 'service' || c.type === 'both').length,
    active: categories.filter(c => c.is_active).length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des Catégories</h1>
            <p className="text-muted-foreground">Gérez les catégories de formations et services</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de la catégorie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la catégorie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'formation' | 'service' | 'both') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Les deux (Formation & Service)</SelectItem>
                      <SelectItem value="formation">Formation uniquement</SelectItem>
                      <SelectItem value="service">Service uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Tags className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total catégories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.formations}</p>
                  <p className="text-sm text-muted-foreground">Pour formations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Briefcase className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.services}</p>
                  <p className="text-sm text-muted-foreground">Pour services</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                  <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les catégories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune catégorie trouvée
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>{getTypeBadge(category.type)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={category.is_active}
                          onCheckedChange={() => toggleActive(category)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'formation' | 'service' | 'both') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Les deux (Formation & Service)</SelectItem>
                    <SelectItem value="formation">Formation uniquement</SelectItem>
                    <SelectItem value="service">Service uniquement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEdit} className="w-full">
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Categories;
