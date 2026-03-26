import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingPage } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, FileText, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { doctorService } from '@/services/doctorService';
import { appointmentService } from '@/services/appointmentService';

interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  experience?: number;
  rating?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface FormData {
  doctorId: string;
  date: string;
  timeSlot: string;
  reason: string;
}

// Mock doctors data
const mockDoctors: Doctor[] = [
  {
    _id: '1',
    name: 'Dr. Sharma',
    specialization: 'Ayurvedic Physician',
    experience: 15,
    rating: 4.8,
  },
  {
    _id: '2',
    name: 'Dr. Patel',
    specialization: 'Holistic Health',
    experience: 12,
    rating: 4.7,
  },
  {
    _id: '3',
    name: 'Dr. Kumar',
    specialization: 'Digestive Health',
    experience: 10,
    rating: 4.9,
  },
  {
    _id: '4',
    name: 'Dr. Singh',
    specialization: 'Mental Wellness',
    experience: 8,
    rating: 4.6,
  },
];

// Mock time slots
const mockTimeSlots: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '02:00 PM', available: true },
  { time: '02:30 PM', available: false },
  { time: '03:00 PM', available: true },
  { time: '03:30 PM', available: true },
  { time: '04:00 PM', available: true },
];

const NewAppointmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [formData, setFormData] = useState<FormData>({
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const fetchedDoctors = await doctorService.getDoctors();
        setDoctors(fetchedDoctors || mockDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Fallback to mock data on error
        setDoctors(mockDoctors);
        toast({
          title: 'Info',
          description: 'Using available doctors list.',
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch available slots when doctor or date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.doctorId || !formData.date) {
        setAvailableSlots([]);
        return;
      }

      try {
        const slots = await doctorService.getAvailableSlots(formData.doctorId, formData.date);
        setAvailableSlots(slots || mockTimeSlots);
      } catch (error) {
        console.error('Error fetching slots:', error);
        // Fallback to mock data on error
        setAvailableSlots(mockTimeSlots);
      }
    };

    fetchAvailableSlots();
  }, [formData.doctorId, formData.date]);

  // Get minimum date (today + 1 day)
  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from now)
  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a doctor';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'doctorId' && { timeSlot: '' }),
      ...(field === 'date' && { timeSlot: '' }),
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await appointmentService.createAppointment({
        doctor: formData.doctorId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        reason: formData.reason,
      });

      toast({
        title: 'Success!',
        description: 'Your appointment has been booked successfully.',
      });

      // Redirect to appointments page
      navigate('/appointments');
    } catch (error) {
      console.error('Appointment booking error:', error);
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Book Appointment">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to book an appointment.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoadingDoctors) return <LoadingPage />;

  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
  const selectedSlot = availableSlots.find(s => s.time === formData.timeSlot);

  return (
    <DashboardLayout title="Book an Appointment">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/appointments')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Button>

        {/* Header Card */}
        <Card className="border-border/50 shadow-card bg-gradient-to-r from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Book Your Appointment</h2>
              <p className="text-muted-foreground mt-2">
                Schedule a consultation with one of our Ayurvedic practitioners
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Selection */}
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Select a Doctor
              </CardTitle>
              <CardDescription>
                Choose from our experienced Ayurvedic practitioners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor" className="text-base font-medium">
                  Doctor *
                </Label>
                <Select value={formData.doctorId} onValueChange={(value) => handleChange('doctorId', value)}>
                  <SelectTrigger id="doctor" className="text-base">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        <div className="flex items-center gap-2">
                          <span>Dr. {doctor.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({doctor.specialization})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.doctorId}
                  </p>
                )}
              </div>

              {/* Doctor Details */}
              {formData.doctorId && selectedDoctor && (
                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                      <p className="text-base text-foreground">{selectedDoctor.specialization}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Experience</p>
                      <p className="text-base text-foreground">{selectedDoctor.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Rating</p>
                      <p className="text-base text-foreground">⭐ {selectedDoctor.rating}/5.0</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          {formData.doctorId && (
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Select Date & Time
                </CardTitle>
                <CardDescription>
                  Choose your preferred appointment date and time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-base font-medium">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Select a date between tomorrow and 3 months from now
                  </p>
                  {errors.date && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.date}
                    </p>
                  )}
                </div>

                {/* Time Slot Selection */}
                {formData.date && (
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot" className="text-base font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Slot *
                    </Label>

                    {availableSlots.length > 0 ? (
                      <>
                        <Select value={formData.timeSlot} onValueChange={(value) => handleChange('timeSlot', value)}>
                          <SelectTrigger id="timeSlot" className="text-base">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSlots.map(slot => (
                              <SelectItem
                                key={slot.time}
                                value={slot.time}
                                disabled={!slot.available}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{slot.time}</span>
                                  {!slot.available && (
                                    <span className="text-xs text-red-600">(Unavailable)</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Available Slots Grid View */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Available slots for {formData.date}:
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {availableSlots.map(slot => (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => handleChange('timeSlot', slot.time)}
                                disabled={!slot.available}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                  formData.timeSlot === slot.time
                                    ? 'bg-green-600 text-white border-2 border-green-700'
                                    : slot.available
                                    ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                                }`}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No available slots for the selected date. Please choose another date.
                        </AlertDescription>
                      </Alert>
                    )}

                    {errors.timeSlot && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.timeSlot}
                      </p>
                    )}
                  </div>
                )}

                {/* Selected Slot Summary */}
                {formData.timeSlot && selectedSlot && (
                  <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <div>
                        <p className="font-medium">
                          {formData.date} at {selectedSlot.time}
                        </p>
                        <p className="text-sm">
                          with Dr. {selectedDoctor?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reason / Notes */}
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Appointment Details
              </CardTitle>
              <CardDescription>
                Tell us the reason for your appointment (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-base font-medium">
                  Reason / Additional Notes
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  placeholder="E.g., I'd like to discuss digestive issues and get a personalized wellness plan..."
                  className="resize-none text-base"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This helps the doctor prepare for your consultation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/appointments')}
              className="flex-1 h-11 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewAppointmentPage;
