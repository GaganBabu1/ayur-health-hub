import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading-spinner';
import { symptomService, Symptom } from '@/services/symptomService';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const SymptomsManagementPage = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    severity: 'mild' as Symptom['severity'],
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchSymptoms();
  }, []);

  useEffect(() => {
    const filtered = symptoms.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSymptoms(filtered);
  }, [symptoms, searchQuery]);

  const fetchSymptoms = async () => {
    const data = await symptomService.getSymptoms();
    setSymptoms(data);
    setFilteredSymptoms(data);
    setIsLoading(false);
  };

  const handleOpenDialog = (symptom?: Symptom) => {
    if (symptom) {
      setEditingSymptom(symptom);
      setFormData({
        name: symptom.name,
        category: symptom.category,
        description: symptom.description,
        severity: symptom.severity,
      });
    } else {
      setEditingSymptom(null);
      setFormData({ name: '', category: '', description: '', severity: 'mild' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Name and category are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSymptom) {
        await symptomService.updateSymptom(editingSymptom.id, formData);
        toast({ title: 'Symptom updated successfully' });
      } else {
        await symptomService.addSymptom(formData);
        toast({ title: 'Symptom added successfully' });
      }
      await fetchSymptoms();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this symptom?')) return;
    
    try {
      await symptomService.deleteSymptom(id);
      toast({ title: 'Symptom deleted successfully' });
      await fetchSymptoms();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete symptom',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingPage />;

  const categories = [...new Set(symptoms.map((s) => s.category))];

  return (
    <AdminLayout title="Symptoms Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}
                </DialogTitle>
                <DialogDescription>
                  {editingSymptom
                    ? 'Update the symptom details below'
                    : 'Enter the details for the new symptom'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Headache"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: Symptom['severity']) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  {editingSymptom ? 'Update' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Symptoms List */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">
              All Symptoms ({filteredSymptoms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredSymptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-foreground">{symptom.name}</p>
                      <p className="text-sm text-muted-foreground">{symptom.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{symptom.category}</Badge>
                    <Badge
                      className={
                        symptom.severity === 'mild'
                          ? 'bg-herb/10 text-herb'
                          : symptom.severity === 'moderate'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-destructive/10 text-destructive'
                      }
                    >
                      {symptom.severity}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(symptom)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(symptom.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SymptomsManagementPage;
