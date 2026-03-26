import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { adminService, Disease } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DiseasesManagementPage = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<Disease[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    symptoms: '',
    severityLevel: 'mild' as const,
  });

  useEffect(() => {
    const fetchDiseases = async () => {
      const data = await adminService.getDiseases();
      setDiseases(data);
      setFilteredDiseases(data);
      setIsLoading(false);
    };
    fetchDiseases();
  }, []);

  useEffect(() => {
    const filtered = diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDiseases(filtered);
  }, [diseases, searchQuery]);

  const handleOpenFormDialog = (disease?: Disease) => {
    if (disease) {
      setEditingDisease(disease);
      setFormData({
        name: disease.name,
        description: disease.description || '',
        symptoms: Array.isArray(disease.symptoms)
          ? disease.symptoms.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')
          : '',
        severityLevel: disease.severityLevel || 'mild',
      });
    } else {
      setEditingDisease(null);
      setFormData({
        name: '',
        description: '',
        symptoms: '',
        severityLevel: 'mild',
      });
    }
    setIsFormDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Disease name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const symptomsArray = formData.symptoms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      const data = {
        name: formData.name,
        description: formData.description || undefined,
        symptoms: symptomsArray,
        severityLevel: formData.severityLevel,
      };

      if (editingDisease) {
        await adminService.updateDisease(editingDisease._id, data);
        toast({ title: 'Disease updated successfully' });
      } else {
        await adminService.createDisease(data);
        toast({ title: 'Disease added successfully' });
      }

      // Refresh data
      const diseasesData = await adminService.getDiseases();
      setDiseases(diseasesData);
      setFilteredDiseases(diseasesData);
      setIsFormDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save disease',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <AdminLayout title="Diseases Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingDisease ? 'Edit Disease' : 'Add New Disease'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Disease Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Diabetes"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    placeholder="Disease description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
                  <Input
                    id="symptoms"
                    placeholder="e.g., Fatigue, Thirst, Frequent urination"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Level</Label>
                  <select
                    id="severity"
                    value={formData.severityLevel}
                    onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Disease'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Diseases List */}
        <div className="grid gap-4">
          {filteredDiseases.map((disease) => (
            <Card key={disease._id} className="border-border/50 shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {disease.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {disease.description || 'No description available'}
                    </p>
                    {disease.symptoms && disease.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(disease.symptoms) && disease.symptoms.slice(0, 3).map((symptom: any) => (
                          <Badge key={typeof symptom === 'string' ? symptom : symptom._id} variant="secondary">
                            {typeof symptom === 'string' ? symptom : symptom.name}
                          </Badge>
                        ))}
                        {disease.symptoms.length > 3 && (
                          <Badge variant="outline">
                            +{disease.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDisease(disease)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-serif">
                            {selectedDisease?.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {selectedDisease?.description && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">Description</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedDisease.description}
                              </p>
                            </div>
                          )}
                          {selectedDisease?.severityLevel && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">Severity Level</h4>
                              <Badge className="capitalize">
                                {selectedDisease.severityLevel}
                              </Badge>
                            </div>
                          )}
                          {selectedDisease?.symptoms && selectedDisease.symptoms.length > 0 && (
                            <div>
                              <h4 className="font-medium text-foreground mb-2">Associated Symptoms</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedDisease.symptoms.map((symptom: any) => (
                                  <Badge key={typeof symptom === 'string' ? symptom : symptom._id} variant="secondary">
                                    {typeof symptom === 'string' ? symptom : symptom.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DiseasesManagementPage;
