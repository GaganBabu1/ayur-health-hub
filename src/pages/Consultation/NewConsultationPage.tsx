import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingPage } from '@/components/ui/loading-spinner';
import { symptomService, Symptom } from '@/services/symptomService';
import { consultationService } from '@/services/consultationService';
import {
  Stethoscope,
  Brain,
  Heart,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const NewConsultationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    selectedSymptoms: [] as string[],
    healthInfo: {
      weight: '',
      lifestyle: '',
      dietaryHabits: '',
    },
    mentalCondition: {
      stressLevel: 5,
      sleepQuality: 5,
      mood: 'neutral',
    },
    diseaseHistory: '',
    oldTreatments: '',
  });

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const data = await symptomService.getSymptoms();
        setSymptoms(data || []);
      } catch (error) {
        console.error('Failed to fetch symptoms:', error);
        setSymptoms([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSymptoms();
  }, []);

  const handleSymptomToggle = (symptomId: string, symptomName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSymptoms: prev.selectedSymptoms.includes(symptomId)
        ? prev.selectedSymptoms.filter(s => s !== symptomId)
        : [...prev.selectedSymptoms, symptomId],
    }));
  };

  const handleSubmit = async () => {
    if (formData.selectedSymptoms.length === 0) {
      toast({
        title: 'Please select symptoms',
        description: 'At least one symptom is required for consultation',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const consultation = await consultationService.createConsultation({
        symptomIds: formData.selectedSymptoms,
        mentalState: {
          stressLevel: formData.mentalCondition.stressLevel,
          sleepQuality: formData.mentalCondition.sleepQuality,
          mood: formData.mentalCondition.mood,
        },
        diseaseHistory: formData.diseaseHistory,
        oldTreatments: formData.oldTreatments,
      });
      
      toast({
        title: 'Consultation Complete!',
        description: 'Analyzing your symptoms...',
      });
      
      // Redirect to consultation result page
      navigate(`/consultation/${consultation._id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process consultation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  const steps = [
    { num: 1, title: 'Symptoms', icon: Stethoscope },
    { num: 2, title: 'Health Info', icon: Heart },
    { num: 3, title: 'Mental State', icon: Brain },
    { num: 4, title: 'History', icon: FileText },
  ];

  // Group symptoms by category
  const groupedSymptoms = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, Symptom[]>);

  return (
    <DashboardLayout title="New Consultation">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    step >= s.num
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${
                      step > s.num ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <Card className="border-border/50 shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Select Your Symptoms
              </CardTitle>
              <CardDescription>
                Choose all symptoms you are currently experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                <div key={category}>
                  <h4 className="text-sm font-semibold text-foreground mb-3">{category}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {categorySymptoms.map((symptom) => (
                      <label
                        key={symptom.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedSymptoms.includes(symptom.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          checked={formData.selectedSymptoms.includes(symptom.id)}
                          onCheckedChange={() => handleSymptomToggle(symptom.id, symptom.name)}
                        />
                        <span className="text-sm font-medium">{symptom.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {formData.selectedSymptoms.length > 0 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-2">Selected symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedSymptoms.map((symptomId) => {
                      const symptomObj = symptoms.find(s => s.id === symptomId);
                      return (
                        <span
                          key={symptomId}
                          className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {symptomObj?.name || symptomId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Health Info */}
        {step === 2 && (
          <Card className="border-border/50 shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Basic Health Information
              </CardTitle>
              <CardDescription>
                Tell us about your general health and lifestyle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 70"
                  value={formData.healthInfo.weight}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      healthInfo: { ...prev.healthInfo, weight: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lifestyle">Lifestyle</Label>
                <Select
                  value={formData.healthInfo.lifestyle}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      healthInfo: { ...prev.healthInfo, lifestyle: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your lifestyle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Desk job, minimal exercise)</SelectItem>
                    <SelectItem value="moderately-active">Moderately Active (Some exercise)</SelectItem>
                    <SelectItem value="active">Active (Regular exercise)</SelectItem>
                    <SelectItem value="very-active">Very Active (Intense exercise)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary">Dietary Habits</Label>
                <Textarea
                  id="dietary"
                  placeholder="Describe your typical diet, meal timings, any restrictions..."
                  value={formData.healthInfo.dietaryHabits}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      healthInfo: { ...prev.healthInfo, dietaryHabits: e.target.value },
                    }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Mental State */}
        {step === 3 && (
          <Card className="border-border/50 shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Mental & Emotional State
              </CardTitle>
              <CardDescription>
                Help us understand your current mental well-being
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Stress Level</Label>
                  <span className="text-sm font-medium text-primary">
                    {formData.mentalCondition.stressLevel}/10
                  </span>
                </div>
                <Slider
                  value={[formData.mentalCondition.stressLevel]}
                  onValueChange={([value]) =>
                    setFormData(prev => ({
                      ...prev,
                      mentalCondition: { ...prev.mentalCondition, stressLevel: value },
                    }))
                  }
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Sleep Quality</Label>
                  <span className="text-sm font-medium text-primary">
                    {formData.mentalCondition.sleepQuality}/10
                  </span>
                </div>
                <Slider
                  value={[formData.mentalCondition.sleepQuality]}
                  onValueChange={([value]) =>
                    setFormData(prev => ({
                      ...prev,
                      mentalCondition: { ...prev.mentalCondition, sleepQuality: value },
                    }))
                  }
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Poor</span>
                  <span>Average</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Mood</Label>
                <Select
                  value={formData.mentalCondition.mood}
                  onValueChange={(value) =>
                    setFormData(prev => ({
                      ...prev,
                      mentalCondition: { ...prev.mentalCondition, mood: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="happy">Happy / Content</SelectItem>
                    <SelectItem value="neutral">Neutral / Calm</SelectItem>
                    <SelectItem value="anxious">Anxious / Worried</SelectItem>
                    <SelectItem value="sad">Sad / Low</SelectItem>
                    <SelectItem value="irritable">Irritable / Frustrated</SelectItem>
                    <SelectItem value="overwhelmed">Overwhelmed / Stressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Medical History */}
        {step === 4 && (
          <Card className="border-border/50 shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Medical History
              </CardTitle>
              <CardDescription>
                Share any relevant medical history for better recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="history">Previous Diseases / Conditions</Label>
                <Textarea
                  id="history"
                  placeholder="List any past illnesses, chronic conditions, surgeries, allergies..."
                  value={formData.diseaseHistory}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, diseaseHistory: e.target.value }))
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatments">Current / Past Medications & Treatments</Label>
                <Textarea
                  id="treatments"
                  placeholder="List any medications, supplements, or treatments you've tried..."
                  value={formData.oldTreatments}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, oldTreatments: e.target.value }))
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(prev => prev + 1)}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get Recommendations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewConsultationPage;
