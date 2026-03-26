import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doctorService } from '@/services/doctorService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Send,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';


// Mock consultation data
interface ConsultationItem {
  id: string;
  userId: string;
  patientName: string;
  date: string;
  symptoms: string[];
  predictedDiseases: { name: string; confidence: number }[];
  triageLevel: 'normal' | 'doctor' | 'urgent';
  status: 'pending' | 'reviewed' | 'completed';
  mentalCondition: {
    stressLevel: number;
    sleepQuality: number;
    mood: string;
  };
  diseaseHistory: string;
  mentalConditionNotes: string;
  aiRecommendations: string;
  doctorNotes?: string;
  followUpRecommendation?: string;
}

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingRecommendation, setIsSavingRecommendation] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackSaved, setShowFeedbackSaved] = useState(false);

  // Filter and search states
  const [triageLevelFilter, setTriageLevelFilter] = useState<'all' | 'normal' | 'doctor' | 'urgent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Form states
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpRecommendation, setFollowUpRecommendation] = useState('');

  // Fetch consultations on mount
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const backendConsultations = await doctorService.getConsultationsForDoctor();

        // Map backend consultation structure to frontend ConsultationItem
        const mappedConsultations: ConsultationItem[] = backendConsultations.map(consultation => {
          // Get symptom names from populated symptom objects
          const symptoms = Array.isArray(consultation.symptoms)
            ? consultation.symptoms.map((s: any) => (typeof s === 'string' ? s : s.name || s._id))
            : [];

          return {
            id: consultation._id,
            userId: typeof consultation.user === 'string' ? consultation.user : consultation.user._id,
            patientName: typeof consultation.user === 'string' ? 'Unknown Patient' : consultation.user.name,
            date: consultation.createdAt ? new Date(consultation.createdAt).toISOString().split('T')[0] : '',
            symptoms,
            predictedDiseases: consultation.predictedDiseases.map(pd => ({
              name: pd.name,
              confidence: pd.confidence || 0,
            })),
            triageLevel: consultation.triageLevel,
            status: consultation.status === 'review_pending' ? 'reviewed' : (consultation.status as any),
            mentalCondition: {
              stressLevel: consultation.mentalState?.stressLevel || 0,
              sleepQuality: consultation.mentalState?.sleepQuality || 0,
              mood: consultation.mentalState?.mood || '',
            },
            diseaseHistory: consultation.diseaseHistory || '',
            mentalConditionNotes: consultation.aiAssessment || '',
            aiRecommendations: consultation.recommendedPlan
              ? `Herbs: ${consultation.recommendedPlan.herbs?.join(', ') || 'N/A'}. Diet: ${consultation.recommendedPlan.diet?.join(', ') || 'N/A'}. Lifestyle: ${consultation.recommendedPlan.lifestyle?.join(', ') || 'N/A'}`
              : '',
            doctorNotes: consultation.doctorNotes,
            followUpRecommendation: consultation.followUpRecommendation,
          };
        });

        setConsultations(mappedConsultations);
      } catch (error) {
        console.error('Error fetching consultations:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load consultations. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered and searched consultations
  const filteredConsultations = consultations.filter(consultation => {
    // Triage level filter
    if (triageLevelFilter !== 'all' && consultation.triageLevel !== triageLevelFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && consultation.status !== statusFilter) {
      return false;
    }

    // Search query (patient name or ID)
    if (searchQuery && !consultation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !consultation.userId.includes(searchQuery)) {
      return false;
    }

    // Date range filter
    const consultationDate = new Date(consultation.date);
    if (dateFromFilter && consultationDate < new Date(dateFromFilter)) {
      return false;
    }
    if (dateToFilter && consultationDate > new Date(dateToFilter)) {
      return false;
    }

    return true;
  });

  const handleSelectConsultation = (consultation: ConsultationItem) => {
    setSelectedConsultation(consultation);
    setDoctorNotes(consultation.doctorNotes || '');
    setFollowUpRecommendation(consultation.followUpRecommendation || '');
    setShowDetailModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedConsultation) return;

    if (!doctorNotes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Doctor notes are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await doctorService.addFeedback(selectedConsultation.id, {
        doctorNotes,
        followUpRecommendation,
        status: 'completed',
      });

      // Update local state
      setConsultations(prev =>
        prev.map(c =>
          c.id === selectedConsultation.id
            ? {
                ...c,
                doctorNotes,
                followUpRecommendation,
                status: 'reviewed' as const,
              }
            : c
        )
      );

      setShowFeedbackSaved(true);
      setTimeout(() => {
        setShowDetailModal(false);
        setShowFeedbackSaved(false);
        setDoctorNotes('');
        setFollowUpRecommendation('');
        setSelectedConsultation(null);
      }, 2000);

      toast({
        title: 'Success!',
        description: 'Your feedback has been saved successfully.',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTriageBadgeColor = (triageLevel: string) => {
    switch (triageLevel) {
      case 'urgent':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'doctor':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'normal':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'reviewed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'completed':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingPage />;

  // Calculate stats
  const pendingCount = filteredConsultations.filter(c => c.status === 'pending').length;
  const urgentCount = filteredConsultations.filter(c => c.triageLevel === 'urgent').length;
  const needsDoctorCount = filteredConsultations.filter(c => c.triageLevel === 'doctor').length;
  const reviewedCount = filteredConsultations.filter(c => c.status === 'reviewed').length;

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg p-6 border border-green-200">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, Dr. {user?.name?.split(' ').pop() || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">
            Review patient consultations and provide your expert guidance to improve their health outcomes.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">PENDING REVIEW</p>
                  <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground mt-2">consultations</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">URGENT CASES</p>
                  <p className="text-3xl font-bold text-red-600">{urgentCount}</p>
                  <p className="text-xs text-muted-foreground mt-2">require immediate</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">NEEDS DOCTOR</p>
                  <p className="text-3xl font-bold text-yellow-600">{needsDoctorCount}</p>
                  <p className="text-xs text-muted-foreground mt-2">consultations</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">REVIEWED TODAY</p>
                  <p className="text-3xl font-bold text-green-600">{reviewedCount}</p>
                  <p className="text-xs text-muted-foreground mt-2">completed</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium">Search Patient</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Triage Level Filter */}
              <div>
                <Label className="text-sm font-medium">Triage Level</Label>
                <Select value={triageLevelFilter} onValueChange={(value: any) => setTriageLevelFilter(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="doctor">Needs Doctor</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div>
                <Label className="text-sm font-medium">From Date</Label>
                <Input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Date To */}
              <div>
                <Label className="text-sm font-medium">To Date</Label>
                <Input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Reset Filters */}
            {(searchQuery || triageLevelFilter !== 'all' || statusFilter !== 'all' || dateFromFilter || dateToFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setTriageLevelFilter('all');
                  setStatusFilter('all');
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Consultations Table/List */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Consultations
                </CardTitle>
                <CardDescription>
                  {filteredConsultations.length} consultation{filteredConsultations.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredConsultations.length > 0 ? (
              <div className="space-y-3">
                {filteredConsultations.map(consultation => (
                  <div
                    key={consultation.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-muted">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{consultation.patientName}</h3>
                        <p className="text-sm text-muted-foreground">ID: {consultation.userId}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(consultation.date), 'PPP')}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-1">
                        {consultation.symptoms.slice(0, 3).map(symptom => (
                          <Badge key={symptom} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {consultation.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{consultation.symptoms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Predicted Diseases */}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Top Disease</p>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {consultation.predictedDiseases[0]?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {consultation.predictedDiseases[0]?.confidence}% confidence
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <Badge className={getTriageBadgeColor(consultation.triageLevel)}>
                        {consultation.triageLevel.charAt(0).toUpperCase() + consultation.triageLevel.slice(1)}
                      </Badge>
                      <Badge className={getStatusBadgeColor(consultation.status)}>
                        {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleSelectConsultation(consultation)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No consultations found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consultation Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Consultation Review
            </DialogTitle>
            <DialogDescription>
              {selectedConsultation && (
                <>
                  Patient: {selectedConsultation.patientName} (ID: {selectedConsultation.userId}) • Date:{' '}
                  {format(new Date(selectedConsultation.date), 'PPP')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedConsultation && !showFeedbackSaved ? (
            <div className="space-y-6 py-4">
              {/* Triage and Status */}
              <div className="flex gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Triage Level</Label>
                  <Badge className={`${getTriageBadgeColor(selectedConsultation.triageLevel)} mt-1`}>
                    {selectedConsultation.triageLevel.charAt(0).toUpperCase() + selectedConsultation.triageLevel.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Badge className={`${getStatusBadgeColor(selectedConsultation.status)} mt-1`}>
                    {selectedConsultation.status.charAt(0).toUpperCase() + selectedConsultation.status.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  Reported Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedConsultation.symptoms.map(symptom => (
                    <Badge key={symptom} variant="secondary">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* AI Predictions */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  AI Predicted Diseases
                </h4>
                <div className="space-y-2">
                  {selectedConsultation.predictedDiseases.map((disease, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${disease.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground w-12 text-right">
                          {disease.confidence > 1 ? Math.round(disease.confidence) : Math.round(disease.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mental Condition */}
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  Mental Condition
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Stress Level</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedConsultation.mentalCondition.stressLevel}/10
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Sleep Quality</p>
                    <p className="text-xl font-bold text-foreground">
                      {selectedConsultation.mentalCondition.sleepQuality}/10
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Mood</p>
                    <p className="text-sm font-bold text-foreground capitalize">
                      {selectedConsultation.mentalCondition.mood}
                    </p>
                  </div>
                </div>
                {selectedConsultation.mentalConditionNotes && (
                  <p className="text-sm text-muted-foreground mt-2 p-2 rounded bg-muted/30">
                    {selectedConsultation.mentalConditionNotes}
                  </p>
                )}
              </div>

              {/* Disease History */}
              {selectedConsultation.diseaseHistory && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Disease History</h4>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{selectedConsultation.diseaseHistory}</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* AI Recommendations */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">AI Recommendations</h4>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-foreground">{selectedConsultation.aiRecommendations}</p>
                </div>
              </div>

              {/* Doctor Notes */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  Your Notes & Recommendations
                </h4>
                <Textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add your professional assessment, recommendations, and treatment plan here..."
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Follow-up Recommendation */}
              <div>
                <h4 className="font-semibold text-foreground mb-2">Follow-up Recommendation</h4>
                <Select value={followUpRecommendation} onValueChange={setFollowUpRecommendation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select follow-up type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Follow-up Required</SelectItem>
                    <SelectItem value="follow-up-1week">Follow-up in 1 Week</SelectItem>
                    <SelectItem value="follow-up-2weeks">Follow-up in 2 Weeks</SelectItem>
                    <SelectItem value="follow-up-1month">Follow-up in 1 Month</SelectItem>
                    <SelectItem value="in-person-visit">In-Person Visit Required</SelectItem>
                    <SelectItem value="urgent-follow-up">Urgent Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : showFeedbackSaved ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Feedback Saved Successfully</h3>
              <p className="text-muted-foreground">Your review has been recorded.</p>
            </div>
          ) : null}

          <DialogFooter className={showFeedbackSaved ? 'hidden' : ''}>
            <Button
              variant="outline"
              onClick={() => setShowDetailModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              disabled={isSubmitting || !doctorNotes.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Save Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorDashboardPage;
