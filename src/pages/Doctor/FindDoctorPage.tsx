import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { doctorService } from '@/services/doctorService';
import { Search, MapPin, Clock, Star } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialization?: string;
  experience?: number;
  qualifications?: string[];
  languages?: string[];
  availability?: string;
  rating?: number;
  consultationsCompleted?: number;
}

const FindDoctorPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorService.getAllDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
        setFilteredDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [doctors, searchQuery]);

  if (isLoading) return <LoadingPage />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Find a Doctor</h1>
          <p className="text-muted-foreground">
            Connect with experienced Ayurvedic practitioners
          </p>
        </div>

        {/* Search Bar */}
        <Card className="border-border/50 shadow-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, specialization, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredDoctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="border-border/50 shadow-card hover:shadow-elevated transition-shadow overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-1">
                        {doctor.name}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>
                    {doctor.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{doctor.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}

                    {doctor.consultationsCompleted && (
                      <div className="text-sm text-muted-foreground">
                        {doctor.consultationsCompleted} consultations completed
                      </div>
                    )}

                    {doctor.qualifications && doctor.qualifications.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Qualifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {doctor.qualifications.map((qual, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {qual}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {doctor.languages && doctor.languages.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-foreground mb-2">Languages:</p>
                        <div className="flex flex-wrap gap-2">
                          {doctor.languages.map((lang, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {doctor.availability && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.availability}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link to={`/appointments/new?doctorId=${doctor._id}`} className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Book Consultation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 shadow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? 'No doctors found matching your search.' : 'No doctors available at the moment.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FindDoctorPage;
