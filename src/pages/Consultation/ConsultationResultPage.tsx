import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { consultationService, Consultation } from '@/services/consultationService';
import { doctorService } from '@/services/doctorService';
import AyurChatbot from '@/components/chat/AyurChatbot';
import { consultationShareService } from '@/services/consultationShareService';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Leaf,
  Utensils,
  Ban,
  Heart,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Download,
  Calendar,
  Printer,
  Share2,
  FileText,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';

const ConsultationResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [patientNotes, setPatientNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isSharingConsultation, setIsSharingConsultation] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        // Validate ID exists
        if (!id || id === 'undefined') {
          console.warn('Invalid consultation ID:', id);
          toast({
            title: 'Invalid Consultation',
            description: 'No valid consultation ID provided. Redirecting to history.',
            variant: 'destructive',
          });
          setIsLoading(false);
          setTimeout(() => navigate('/consultation/history'), 2000);
          return;
        }

        console.log('Fetching consultation with ID:', id);
        const data = await consultationService.getConsultationById(id);
        
        if (!data) {
          throw new Error('No consultation data returned');
        }
        
        console.log('Consultation loaded successfully:', data);
        setConsultation(data);
        setPatientNotes(data?.patientNotes || '');
      } catch (error) {
        console.error('Error fetching consultation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load consultation details. Redirecting to history.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/consultation/history'), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsultation();
  }, [id, navigate, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!consultation || !pdfContentRef.current) {
        toast({
          title: 'Error',
          description: 'No consultation data available to download.',
          variant: 'destructive',
        });
        return;
      }

      setIsDownloadingPDF(true);
      
      // Get the HTML content
      const element = pdfContentRef.current;
      const filename = `Consultation_${consultation._id}_${format(new Date(consultation.createdAt), 'yyyy-MM-dd')}.pdf`;

      const options = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      html2pdf().set(options).from(element).save();

      toast({
        title: 'Success',
        description: `PDF downloaded as ${filename}`,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleOpenShareModal = async () => {
    setShowShareModal(true);
    setIsLoadingDoctors(true);
    try {
      const doctorsList = await doctorService.getDoctors();
      setDoctors(
        doctorsList.map(doc => ({
          id: doc._id,
          name: doc.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to empty list on error
      setDoctors([]);
      toast({
        title: 'Info',
        description: 'Could not load doctors list, but you can still share your report.',
      });
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleShareWithDoctor = async () => {
    if (!selectedDoctorId) {
      toast({
        title: 'Error',
        description: 'Please select a doctor to share with.',
        variant: 'destructive',
      });
      return;
    }

    setIsSharingConsultation(true);
    try {
      if (!consultation?._id) {
        throw new Error('Consultation ID not found');
      }

      await consultationShareService.shareConsultation(
        consultation._id,
        selectedDoctorId,
        shareMessage
      );

      const doctorName = doctors.find(d => d.id === selectedDoctorId)?.name || 'the doctor';
      toast({
        title: 'Success!',
        description: `Consultation shared with ${doctorName}. They will review it shortly.`,
      });

      setShowShareModal(false);
      setSelectedDoctorId('');
      setShareMessage('');
    } catch (error) {
      console.error('Error sharing consultation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to share consultation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSharingConsultation(false);
    }
  };

  const handleSavePatientNotes = async () => {
    if (!patientNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please write some notes before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingNotes(true);
    try {
      // Placeholder: Call consultationService.addPatientNotes(consultationId, notes)
      console.log('Saving patient notes for consultation:', consultation?._id, {
        notes: patientNotes,
      });

      await new Promise(resolve => setTimeout(resolve, 800));

      // Update local state
      if (consultation) {
        setConsultation({
          ...consultation,
          patientNotes,
        });
      }

      toast({
        title: 'Success!',
        description: 'Your notes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!consultation) {
    return (
      <DashboardLayout title="Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Consultation not found</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const triageConfig = {
    normal: { color: 'bg-herb/10 text-herb', icon: CheckCircle, label: 'Normal' },
    doctor: { color: 'bg-accent/10 text-accent', icon: AlertTriangle, label: 'Doctor Consultation Needed' },
    urgent: { color: 'bg-destructive/10 text-destructive', icon: AlertTriangle, label: 'Urgent' },
  };

  const triageInfo = triageConfig[consultation.triageLevel.toLowerCase()] || {
    color: 'bg-muted/10 text-muted-foreground',
    icon: CheckCircle,
    label: consultation.triageLevel,
  };

  return (
    <DashboardLayout title="Consultation Results">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/consultation/history">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Link>
        </Button>

        {/* PDF Content Container */}
        <div ref={pdfContentRef} className="space-y-6">
          {/* Header Card */}
          <Card className="border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {consultation.createdAt ? format(new Date(consultation.createdAt), 'PPP p') : 'Date unknown'}
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    AI Health Analysis Report
                  </h2>
                </div>
                <Badge className={triageInfo.color}>
                  <triageInfo.icon className="h-3 w-3 mr-1" />
                  {triageInfo.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms Summary */}
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Reported Symptoms
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {consultation.symptoms && consultation.symptoms.map((symptom, idx) => {
                const symptomName = typeof symptom === 'string' ? symptom : symptom.name;
                const symptomId = typeof symptom === 'string' ? symptom : symptom._id;
                return (
                  <Badge key={`${symptomId}${idx}`} variant="secondary" className="text-sm">
                    {symptomName}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Predictions */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Disease Analysis
            </CardTitle>
            <CardDescription>
              Predicted conditions based on your symptoms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultation.predictedDiseases && consultation.predictedDiseases.map((disease, index) => (
                <div
                  key={disease.name}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium text-foreground">{disease.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${disease.confidence > 1 ? disease.confidence : disease.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-primary w-12 text-right">
                      {disease.confidence > 1 ? Math.round(disease.confidence) : Math.round(disease.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Herbal Recommendations */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Leaf className="h-5 w-5 text-herb" />
              Ayurvedic Herbal Recommendations
            </CardTitle>
            <CardDescription>
              Natural herbs and their therapeutic benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {consultation.recommendedPlan?.herbs && consultation.recommendedPlan.herbs.map((herb) => (
                <div
                  key={herb}
                  className="p-4 rounded-lg border border-herb/20 bg-herb/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="h-4 w-4 text-herb" />
                    <h4 className="font-semibold text-foreground">{herb}</h4>
                  </div>
                  <p className="text-xs text-herb">Traditional Ayurvedic remedy</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Recommendations */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Utensils className="h-5 w-5 text-herb" />
              Dietary Recommendations
            </CardTitle>
            <CardDescription>
              Foods recommended for your health condition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {consultation.recommendedPlan?.diet && consultation.recommendedPlan.diet.map((food) => (
                <li key={food} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-herb" />
                  <span className="text-sm">{food}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Lifestyle Recommendations */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent" />
              Lifestyle Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {consultation.recommendedPlan?.lifestyle && consultation.recommendedPlan.lifestyle.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 print:hidden">
          <Button asChild>
            <Link to="/consultation/new">Start New Consultation</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
        </div>

        {/* Action Buttons (Not in PDF) */}
        <Card className="border-border/50 shadow-card print:hidden">
          <CardHeader>
            <CardTitle className="font-serif">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="gap-2"
              >
                {isDownloadingPDF ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenShareModal}
                variant="outline"
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share with Doctor
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Notes Section */}
        <Card className="border-border/50 shadow-card print:hidden">
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Your Notes
            </CardTitle>
            <CardDescription>
              Add your personal notes about this consultation and your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="How are you feeling about this consultation? What changes have you noticed? Share your feedback here..."
              rows={5}
              className="resize-none"
            />
            <div className="flex gap-3">
              <Button
                onClick={handleSavePatientNotes}
                disabled={isSavingNotes || !patientNotes.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSavingNotes ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Save Notes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPatientNotes('')}
                disabled={isSavingNotes}
              >
                Clear
              </Button>
            </div>
            {patientNotes && (
              <div className="text-xs text-muted-foreground">
                {patientNotes.length} characters
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ayur Chatbot - floating component, hidden in print */}
        <div className="print:hidden">
          <AyurChatbot
            initialContext={
              consultation
                ? `Current consultation: ${consultation.predictedDisease || 'General consultation'} (${consultation.triageLevel})`
                : undefined
            }
          />
        </div>
      </div>

      {/* Share with Doctor Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-green-600" />
              Share with Doctor
            </DialogTitle>
            <DialogDescription>
              Share this consultation with one of your doctors for review and recommendations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor-select" className="font-medium">
                Select a Doctor *
              </Label>
              {isLoadingDoctors ? (
                <div className="text-sm text-muted-foreground py-2">Loading doctors...</div>
              ) : (
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger id="doctor-select">
                    <SelectValue placeholder="Choose a doctor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <Label htmlFor="share-message" className="font-medium">
                Message (Optional)
              </Label>
              <Textarea
                id="share-message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add any additional message for the doctor..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowShareModal(false);
                setSelectedDoctorId('');
                setShareMessage('');
              }}
              disabled={isSharingConsultation}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareWithDoctor}
              disabled={isSharingConsultation || !selectedDoctorId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSharingConsultation ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Consultation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-gray-300 {
            border-color: #d1d5db !important;
          }
          .max-w-4xl {
            max-width: 100%;
          }
          .space-y-6 > * + * {
            margin-top: 1.5rem;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ConsultationResultPage;
