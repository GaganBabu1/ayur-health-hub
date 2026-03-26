import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { consultationService, Consultation } from '@/services/consultationService';
import { calculateHealthScore } from '@/utils/healthScoreCalculator';
import userService, { UserProfile } from '@/services/userService';
import AyurChatbot from '@/components/chat/AyurChatbot';
import {
  Stethoscope,
  History,
  Calendar,
  Activity,
  ArrowRight,
  User,
  Leaf,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthScore, setHealthScore] = useState<string>('--');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          const [consultData, profileData] = await Promise.all([
            consultationService.getMyConsultations(),
            userService.getProfile(),
          ]);

          setConsultations(consultData || []);
          setUserProfile(profileData);

          // Calculate real health score
          const score = calculateHealthScore({
            age: profileData.age,
            gender: profileData.gender,
            height: profileData.height,
            weight: profileData.weight,
            sleepQuality: profileData.sleepQuality,
            lifestyle: profileData.lifestyle,
            diseaseHistory: profileData.diseaseHistory,
            chronicConditions: profileData.chronicConditions,
          });
          setHealthScore(score.percentage);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setConsultations([]);
        setHealthScore('--'); // Fallback if data fetch fails
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) return <LoadingPage />;

  const lastConsultation = consultations[0];

  const stats = [
    {
      title: 'Total Consultations',
      value: consultations.length,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Last Visit',
      value: lastConsultation && lastConsultation.createdAt ? format(new Date(lastConsultation.createdAt), 'MMM d') : 'None',
      icon: Calendar,
      color: 'text-herb',
      bgColor: 'bg-herb/10',
    },
    {
      title: 'Health Score',
      value: healthScore,
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl hero-gradient p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 leaf-pattern opacity-20" />
          <div className="relative z-10">
            <h2 className="font-serif text-2xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-primary-foreground/90 mb-4">
              Ready for your personalized Ayurvedic health journey?
            </p>
            <Button variant="secondary" asChild>
              <Link to="/consultation/new">
                <Stethoscope className="mr-2 h-4 w-4" />
                Start New Consultation
              </Link>
            </Button>
          </div>
          <Leaf className="absolute right-6 bottom-6 h-32 w-32 text-primary-foreground/10" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Stethoscope className="h-5 w-5 text-primary" />
                New Consultation
              </CardTitle>
              <CardDescription>
                Start a new health consultation and get AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/consultation/new">
                  Begin Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <History className="h-5 w-5 text-herb" />
                Consultation History
              </CardTitle>
              <CardDescription>
                View your past consultations and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to="/consultation/history">
                  View History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Consultations */}
        {consultations.length > 0 && (
          <Card className="border-border/50 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-serif">Recent Consultations</CardTitle>
                <CardDescription>Your latest health consultations</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/consultation/history">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultations.slice(0, 3).map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {Array.isArray(consultation.symptoms) 
                            ? consultation.symptoms.slice(0, 2).map(s => typeof s === 'string' ? s : s.name).join(', ')
                            : 'Consultation'}
                          {Array.isArray(consultation.symptoms) && consultation.symptoms.length > 2 && ` +${consultation.symptoms.length - 2}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {consultation.createdAt ? format(new Date(consultation.createdAt), 'PPP') : 'Date unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          consultation.triageLevel === 'Normal'
                            ? 'secondary'
                            : consultation.triageLevel === 'Urgent'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {consultation.triageLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Overview */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              <User className="h-5 w-5 text-primary" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{userProfile?.name || user?.name}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground truncate">{userProfile?.email || user?.email}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium text-foreground">{userProfile?.age || user?.age || 'Not set'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium text-foreground capitalize">{userProfile?.gender || user?.gender || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Chatbot */}
        <AyurChatbot initialContext="dashboard" />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardPage;
