import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { adminService, Consultation } from '@/services/adminService';
import { Search, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

const ConsultationsManagementPage = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await adminService.getAllConsultations();
      setConsultations(data);
      setFilteredConsultations(data);
      setIsLoading(false);
    };
    fetchConsultations();
  }, []);

  useEffect(() => {
    const filtered = consultations.filter((c) =>
      c.symptoms.some((s) => {
        const symptomName = typeof s === 'string' ? s : s.name;
        return symptomName.toLowerCase().includes(searchQuery.toLowerCase());
      }) ||
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConsultations(filtered);
  }, [consultations, searchQuery]);

  if (isLoading) return <LoadingPage />;

  return (
    <AdminLayout title="Consultations Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symptoms or disease..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Total: {consultations.length} consultations
          </p>
        </div>

        {/* Consultations List */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif">All Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation._id}
                  className="flex flex-col md:flex-row justify-between gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {consultation.user?.name || 'Unknown User'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(consultation.createdAt), 'PPP p')}
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs text-muted-foreground">Symptoms: </span>
                      {consultation.symptoms.slice(0, 3).map((symptom) => {
                        const symptomName = typeof symptom === 'string' ? symptom : symptom.name;
                        const symptomId = typeof symptom === 'string' ? symptom : symptom._id;
                        return (
                          <Badge key={symptomId} variant="secondary" className="mr-1 text-xs">
                            {symptomName}
                          </Badge>
                        );
                      })}
                      {consultation.symptoms.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{consultation.symptoms.length - 3}
                        </Badge>
                      )}
                    </div>
                    {consultation.aiAssessment && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Assessment:</span> {consultation.aiAssessment}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={consultation.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {consultation.status}
                    </Badge>
                    {consultation.doctor && (
                      <p className="text-sm text-muted-foreground">
                        Doctor: {consultation.doctor.name}
                      </p>
                    )}
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

export default ConsultationsManagementPage;
