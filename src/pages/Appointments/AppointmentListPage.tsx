import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { appointmentService } from '@/services/appointmentService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  Clock,
  User,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  reason?: string;
}

const AppointmentListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const result = await appointmentService.getMyAppointments();

        // Map backend appointments to local interface format
        const mappedAppointments: Appointment[] = [
          ...result.upcoming,
          ...result.past,
        ].map((apt) => ({
          id: apt._id,
          doctorName: typeof apt.doctor === 'string' ? 'Unknown Doctor' : apt.doctor.name,
          doctorSpecialization: 'Ayurvedic Physician', // Backend doesn't have specialization
          date: new Date(apt.date).toISOString().split('T')[0],
          time: apt.timeSlot.split('–')[0], // Extract start time from "10:00–10:30"
          status: apt.status,
          notes: apt.reason || '',
          reason: apt.reason,
        }));

        setAppointments(mappedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load appointments',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get today's date for comparison
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  // Separate upcoming and past appointments
  const todayDate = getTodayDate();
  const upcomingAppointments = appointments.filter(
    apt => apt.date >= todayDate && apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    apt => apt.date < todayDate || apt.status === 'completed' || apt.status === 'cancelled'
  );

  // Sort appointments by date
  const sortByDate = (appts: Appointment[]): Appointment[] => {
    return [...appts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppointment) return;

    setCancellingId(selectedAppointment.id);

    try {
      await appointmentService.cancelAppointment(selectedAppointment.id);

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      );

      toast({
        title: 'Success',
        description: `Appointment with ${selectedAppointment.doctorName} has been cancelled.`,
      });

      setShowCancelDialog(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel appointment',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="border-border/50 shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Doctor Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Stethoscope className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-foreground">
                  {appointment.doctorName}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {appointment.doctorSpecialization}
              </p>
            </div>
            <div>{getStatusBadge(appointment.status)}</div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Date</p>
                <p className="text-base font-semibold text-foreground">
                  {formatDate(appointment.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Time</p>
                <p className="text-base font-semibold text-foreground">
                  {appointment.time}
                </p>
              </div>
            </div>
          </div>

          {/* Reason and Notes */}
          {(appointment.reason || appointment.notes) && (
            <div className="space-y-3 bg-green-50 p-4 rounded-lg">
              {appointment.reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    Reason
                  </p>
                  <p className="text-sm text-foreground">{appointment.reason}</p>
                </div>
              )}
              {appointment.notes && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    Notes
                  </p>
                  <p className="text-sm text-foreground">{appointment.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Cancel Button for Scheduled Appointments */}
          {appointment.status === 'scheduled' && (
            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelClick(appointment)}
                disabled={cancellingId === appointment.id}
                className="w-full"
              >
                {cancellingId === appointment.id ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Appointment
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <DashboardLayout title="My Appointments">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view appointments.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) return <LoadingPage />;

  return (
    <DashboardLayout title="My Appointments">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Book Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
            <p className="text-muted-foreground mt-2">
              Manage your upcoming and past appointments
            </p>
          </div>
          <Button
            onClick={() => navigate('/appointments/new')}
            className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>

        {/* Tabs for Upcoming and Past */}
        {appointments.length > 0 ? (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming
                {upcomingAppointments.length > 0 && (
                  <Badge className="ml-2 bg-blue-600">{upcomingAppointments.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past">
                Past
                {pastAppointments.length > 0 && (
                  <Badge className="ml-2 bg-gray-600">{pastAppointments.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Upcoming Appointments Tab */}
            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {sortByDate(upcomingAppointments).map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-border/50 bg-blue-50">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto text-blue-300 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Upcoming Appointments
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You don't have any scheduled appointments yet.
                    </p>
                    <Button
                      onClick={() => navigate('/appointments/new')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Book Your First Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Past Appointments Tab */}
            <TabsContent value="past" className="space-y-4 mt-6">
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {sortByDate(pastAppointments).map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-border/50 bg-gray-50">
                  <CardContent className="pt-12 pb-12 text-center">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Past Appointments
                    </h3>
                    <p className="text-muted-foreground">
                      Your completed and cancelled appointments will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          /* Empty State */
          <Card className="border-border/50 bg-green-50">
            <CardContent className="pt-16 pb-16 text-center">
              <Calendar className="h-20 w-20 mx-auto text-green-300 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">
                No Appointments Yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Start your wellness journey by booking your first consultation with our
                experienced Ayurvedic practitioners.
              </p>
              <Button
                onClick={() => navigate('/appointments/new')}
                className="bg-green-600 hover:bg-green-700 text-white text-base h-11 px-8"
              >
                <Plus className="mr-2 h-5 w-5" />
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your appointment with{' '}
              <span className="font-semibold text-foreground">
                {selectedAppointment?.doctorName}
              </span>{' '}
              on{' '}
              <span className="font-semibold text-foreground">
                {selectedAppointment && formatDate(selectedAppointment.date)}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-4">
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Appointment
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AppointmentListPage;
