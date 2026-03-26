import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { adminService } from '@/services/adminService';
import { consultationService, Consultation } from '@/services/consultationService';
import {
  Users,
  Activity,
  FileText,
  TrendingUp,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentConsultations, setRecentConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, consultationsData] = await Promise.all([
          adminService.getAnalytics(),
          consultationService.getRecentConsultations(5),
        ]);
        setAnalytics(analyticsData);
        setRecentConsultations(consultationsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Set default analytics data
        setAnalytics({
          totalUsers: 0,
          totalConsultations: 0,
          todayConsultations: 0,
          triageLevels: {
            normal: 0,
            needsDoctor: 0,
            urgent: 0,
          },
        });
        setRecentConsultations([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingPage />;

  const stats = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
    },
    {
      title: 'Total Consultations',
      value: analytics.totalConsultations,
      icon: FileText,
      color: 'text-herb',
      bgColor: 'bg-herb/10',
      change: '+8%',
    },
    {
      title: "Today's Consultations",
      value: analytics.todayConsultations,
      icon: Activity,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      change: '+5',
    },
    {
      title: 'Needs Review',
      value: analytics.triageLevels.needsDoctor + analytics.triageLevels.urgent,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      change: 'Action needed',
    },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border/50 shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Manage Symptoms', path: '/admin/symptoms', icon: Activity },
            { label: 'Manage Diseases', path: '/admin/diseases', icon: FileText },
          ].map((link) => (
            <Card key={link.path} className="border-border/50 shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="p-4">
                <Link to={link.path} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{link.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Consultations */}
        <Card className="border-border/50 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">Recent Consultations</CardTitle>
              <CardDescription>Latest patient consultations</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/consultations">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConsultations.length > 0 ? (
                recentConsultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Consultation #{consultation._id.slice(-6)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(consultation.createdAt), 'PPP')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          consultation.triageLevel === 'Normal' || consultation.triageLevel === 'normal'
                            ? 'bg-herb/10 text-herb'
                            : consultation.triageLevel === 'Urgent' || consultation.triageLevel === 'urgent'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-accent/10 text-accent'
                        }
                      >
                        {consultation.triageLevel}
                      </Badge>
                      <Badge variant="secondary">
                        {consultation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent consultations
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Symptoms */}
        {analytics.topSymptoms && analytics.topSymptoms.length > 0 ? (
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="font-serif">Top Reported Symptoms</CardTitle>
              <CardDescription>Most common symptoms this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topSymptoms.map((symptom: any, index: number) => (
                  <div key={symptom.name} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                        <span className="text-sm text-muted-foreground">{symptom.count} cases</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(symptom.count / analytics.topSymptoms[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="font-serif">Top Reported Symptoms</CardTitle>
              <CardDescription>Most common symptoms this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No symptom data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
