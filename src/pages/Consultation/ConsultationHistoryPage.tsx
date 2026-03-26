import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { consultationService, Consultation } from '@/services/consultationService';
import { consultationShareService, ConsultationShare } from '@/services/consultationShareService';
import { Activity, Calendar, FileText, Stethoscope, Share2, User } from 'lucide-react';
import { format } from 'date-fns';

const ConsultationHistoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [sharedConsultations, setSharedConsultations] = useState<ConsultationShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-consultations');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const myData = await consultationService.getMyConsultations();
          setConsultations(myData || []);

          try {
            const response = await consultationShareService.getFeedbackFromDoctors();
            // Handle both direct array response and wrapped response { data: [...] }
            const sharedData = Array.isArray(response) ? response : (response as any)?.data || [];
            setSharedConsultations(sharedData || []);
          } catch (error) {
            console.error('Failed to fetch shared consultations:', error);
            setSharedConsultations([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch consultations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load consultations. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  if (isLoading) return <LoadingPage />;

  return (
    <DashboardLayout title="Consultations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Consultations</h2>
            <p className="text-muted-foreground">View your consultations and those shared by doctors</p>
          </div>
          <Button asChild>
            <Link to="/consultation/new">
              <Stethoscope className="mr-2 h-4 w-4" />
              New Consultation
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="my-consultations">
              My Consultations
              {consultations.length > 0 && <Badge variant="secondary" className="ml-2">{consultations.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="shared-with-me">
              Shared with Me
              {sharedConsultations.length > 0 && <Badge variant="secondary" className="ml-2">{sharedConsultations.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-consultations" className="space-y-4">
            {consultations.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No Consultations Yet</h3>
                  <p className="text-muted-foreground mb-6">Start your first consultation to get personalized Ayurvedic recommendations</p>
                  <Button asChild>
                    <Link to="/consultation/new">Start Consultation</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <ConsultationCard key={consultation._id} consultation={consultation} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared-with-me" className="space-y-4">
            {sharedConsultations.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">No Shared Consultations</h3>
                  <p className="text-muted-foreground">Consultations shared by doctors will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sharedConsultations.map((share) => (
                  <SharedConsultationCard key={share._id} share={share} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
  return (
    <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {consultation.createdAt ? format(new Date(consultation.createdAt), 'PPP') : 'Date unknown'}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(consultation.symptoms) && consultation.symptoms.map((symptom, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {typeof symptom === 'string' ? symptom : symptom.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Prediction</h4>
              <p className="font-medium text-foreground">
                {consultation.predictedDiseases?.[0]?.name || 'N/A'}
                <span className="text-sm text-muted-foreground ml-2">
                  ({(consultation.predictedDiseases?.[0]?.confidence || 0) > 1 ? Math.round(consultation.predictedDiseases[0]?.confidence) : Math.round((consultation.predictedDiseases?.[0]?.confidence || 0) * 100)}% confidence)
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end gap-4">
            <Badge className={consultation.triageLevel === 'Normal' ? 'bg-herb/10 text-herb' : consultation.triageLevel === 'Urgent' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}>
              {consultation.triageLevel}
            </Badge>
            <Link to={`/consultation/${consultation._id}`}>
              <Button variant="outline" size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SharedConsultationCard = ({ share }: { share: ConsultationShare }) => {
  return (
    <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all border-l-4 border-l-primary">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Shared by <span className="text-primary">{share.sharedWith?.name || 'Dr. Unknown'}</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {share.createdAt ? format(new Date(share.createdAt), 'PPP') : 'Date unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {share.consultation?.symptoms && share.consultation.symptoms.map((symptom, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {typeof symptom === 'string' ? symptom : symptom.name}
                  </Badge>
                ))}
              </div>
            </div>

            {share.message && (
              <div className="mb-3 p-3 bg-muted rounded-lg border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Doctor's Message</h4>
                <p className="text-sm text-foreground">{share.message}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
              <Badge variant={share.status === 'accepted' ? 'default' : share.status === 'rejected' ? 'destructive' : 'secondary'}>
                {share.status?.charAt(0).toUpperCase() + share.status?.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Doctor</p>
              <p className="font-medium text-foreground">{share.sharedWith?.name}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsultationHistoryPage;
