import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { adminService, Treatment, Disease } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Leaf } from 'lucide-react';

const TreatmentsManagementPage = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    disease: '',
    herbs: '',
    dietRecommendations: '',
    lifestyleRecommendations: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const [treatmentsData, diseasesData] = await Promise.all([
        adminService.getTreatments(),
        adminService.getDiseases(),
      ]);
      setTreatments(treatmentsData);
      setDiseases(diseasesData);
      setFilteredTreatments(treatmentsData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = treatments.filter((t) => {
      const diseaseName = typeof t.disease === 'string' 
        ? diseases.find((d) => d._id === t.disease)?.name || ''
        : t.disease?.name || '';
      return diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredTreatments(filtered);
  }, [treatments, searchQuery, diseases]);

  const getDiseaseName = (disease: string | { _id: string; name: string; description: string }) => {
    if (typeof disease === 'string') {
      return diseases.find((d) => d._id === disease)?.name || 'Unknown';
    }
    return disease?.name || 'Unknown';
  };

  const handleOpenDialog = (treatment?: Treatment) => {
    if (treatment) {
      setEditingTreatment(treatment);
      setFormData({
        disease: typeof treatment.disease === 'string' ? treatment.disease : treatment.disease._id,
        herbs: treatment.herbs?.join(', ') || '',
        dietRecommendations: treatment.dietRecommendations || '',
        lifestyleRecommendations: treatment.lifestyleRecommendations || '',
        notes: treatment.notes || '',
      });
    } else {
      setEditingTreatment(null);
      setFormData({
        disease: '',
        herbs: '',
        dietRecommendations: '',
        lifestyleRecommendations: '',
        notes: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.disease) {
      toast({
        title: 'Validation Error',
        description: 'Disease is required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const herbsArray = formData.herbs
        .split(',')
        .map((h) => h.trim())
        .filter((h) => h);

      const data = {
        disease: formData.disease,
        herbs: herbsArray,
        dietRecommendations: formData.dietRecommendations || undefined,
        lifestyleRecommendations: formData.lifestyleRecommendations || undefined,
        notes: formData.notes || undefined,
      };

      if (editingTreatment) {
        await adminService.updateTreatment(editingTreatment._id, data);
        toast({ title: 'Treatment updated successfully' });
      } else {
        await adminService.createTreatment(data);
        toast({ title: 'Treatment added successfully' });
      }
      
      // Refresh data
      const treatmentsData = await adminService.getTreatments();
      setTreatments(treatmentsData);
      setFilteredTreatments(treatmentsData);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save treatment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <AdminLayout title="Treatments Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Treatment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="disease">Disease</Label>
                  <select
                    id="disease"
                    value={formData.disease}
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Select a disease</option>
                    {diseases.map((disease) => (
                      <option key={disease._id} value={disease._id}>
                        {disease.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="herbs">Herbs (comma-separated)</Label>
                  <Input
                    id="herbs"
                    placeholder="e.g., Turmeric, Ginger, Neem"
                    value={formData.herbs}
                    onChange={(e) => setFormData({ ...formData, herbs: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diet">Diet Recommendations</Label>
                  <textarea
                    id="diet"
                    placeholder="Dietary guidelines..."
                    value={formData.dietRecommendations}
                    onChange={(e) => setFormData({ ...formData, dietRecommendations: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lifestyle">Lifestyle Recommendations</Label>
                  <textarea
                    id="lifestyle"
                    placeholder="Lifestyle guidelines..."
                    value={formData.lifestyleRecommendations}
                    onChange={(e) => setFormData({ ...formData, lifestyleRecommendations: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-16"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Treatment'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Treatments List */}
        <div className="grid gap-4">
          {filteredTreatments.map((treatment) => (
            <Card key={treatment._id} className="border-border/50 shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">
                          For: {getDiseaseName(treatment.disease)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {treatment.herbs && treatment.herbs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                            <Leaf className="h-4 w-4 text-herb" />
                            Herbs
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {treatment.herbs.map((herb) => (
                              <Badge
                                key={herb}
                                className="bg-herb/10 text-herb text-xs"
                              >
                                {herb}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {treatment.lifestyleRecommendations && (
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Lifestyle
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {treatment.lifestyleRecommendations}
                          </p>
                        </div>
                      )}
                    </div>

                    {treatment.dietRecommendations && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">
                          Diet Recommendations
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {treatment.dietRecommendations}
                        </p>
                      </div>
                    )}

                    {treatment.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">
                          Notes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {treatment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenDialog(treatment)}
                    >
                      Edit
                    </Button>
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

export default TreatmentsManagementPage;
