import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import userService from '@/services/userService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Weight,
  Activity,
  Moon,
  FileText,
} from 'lucide-react';

interface HealthRecord {
  _id?: string;
  date: string;
  weight?: number;
  activityLevel?: string;
  sleepQuality?: number;
  notes?: string;
  chronicConditions?: string[];
}

const ProfileHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [healthHistory, setHealthHistory] = useState<HealthRecord[]>([]);

  // Fetch health history on mount
  useEffect(() => {
    const fetchHealthHistory = async () => {
      try {
        setIsLoading(true);
        const history = await userService.getHealthHistory();
        setHealthHistory(history);
      } catch (error) {
        console.error('Error fetching health history:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load health history. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getActivityLevelLabel = (level: string): string => {
    const levels: Record<string, string> = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
    };
    return levels[level] || level;
  };

  const getActivityLevelColor = (level: string): string => {
    switch (level) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSleepQualityColor = (quality: number): string => {
    if (quality >= 8) return 'text-green-600';
    if (quality >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare chart data
  const sortedHistory = [...healthHistory].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedHistory.map(h => ({
    date: formatDate(h.date),
    weight: h.weight,
    sleep: h.sleepQuality,
  }));

  // Calculate progress
  const latestRecord = sortedHistory[sortedHistory.length - 1];
  const oldestRecord = sortedHistory[0];

  const weightChange = latestRecord && oldestRecord 
    ? oldestRecord.weight - latestRecord.weight
    : 0;

  const sleepChange = latestRecord && oldestRecord
    ? latestRecord.sleepQuality - oldestRecord.sleepQuality
    : 0;

  if (!user) {
    return (
      <DashboardLayout title="Health History">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view your health history.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) return <LoadingPage />;

  return (
    <DashboardLayout title="Health History">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health History</h1>
          <p className="text-muted-foreground mt-2">
            Track your health progress over time
          </p>
        </div>

        {/* Progress Summary Cards */}
        {latestRecord && oldestRecord && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Progress */}
            <Card className="border-border/50 shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Weight className="h-4 w-4" />
                      Weight Change
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.abs(weightChange).toFixed(1)} kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From {oldestRecord.weight} kg to {latestRecord.weight} kg
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${weightChange > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {weightChange > 0 ? (
                      <TrendingDown className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Quality Progress */}
            <Card className="border-border/50 shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                      <Moon className="h-4 w-4" />
                      Sleep Quality Improvement
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      +{sleepChange.toFixed(1)} points
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From {oldestRecord.sleepQuality}/10 to {latestRecord.sleepQuality}/10
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${sleepChange > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {sleepChange > 0 ? (
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {healthHistory.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Chart */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Weight className="h-5 w-5 text-green-600" />
                  Weight Over Time
                </CardTitle>
                <CardDescription>
                  Your weight progression over the months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="rgba(0,0,0,0.3)"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="rgba(0,0,0,0.3)"
                      label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                      formatter={(value) => `${value} kg`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="rgb(5, 150, 105)"
                      strokeWidth={2}
                      dot={{ fill: 'rgb(5, 150, 105)', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Weight (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sleep Quality Chart */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon className="h-5 w-5 text-blue-600" />
                  Sleep Quality Over Time
                </CardTitle>
                <CardDescription>
                  Your sleep quality progression (0-10 scale)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      stroke="rgba(0,0,0,0.3)"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="rgba(0,0,0,0.3)"
                      domain={[0, 10]}
                      label={{ value: 'Quality (0-10)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                      }}
                      formatter={(value) => `${value}/10`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth={2}
                      dot={{ fill: 'rgb(59, 130, 246)', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Sleep Quality (0-10)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timeline Section */}
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Health Timeline
            </CardTitle>
            <CardDescription>
              Complete history of your health records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sortedHistory.map((record, index) => {
                const isLatest = index === sortedHistory.length - 1;
                const isOldest = index === 0;

                return (
                  <div
                    key={record._id || index}
                    className={`pb-6 ${index !== sortedHistory.length - 1 ? 'border-b border-border/50' : ''}`}
                  >
                    {/* Timeline indicator */}
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            isLatest
                              ? 'border-green-600 bg-green-100'
                              : isOldest
                              ? 'border-gray-400 bg-gray-100'
                              : 'border-blue-400 bg-blue-100'
                          }`}
                        />
                        {index !== sortedHistory.length - 1 && (
                          <div className="w-0.5 h-12 bg-gradient-to-b from-blue-200 to-gray-200" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        {/* Header with date and badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">
                              {formatDate(record.date)}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {isLatest && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Latest
                                </Badge>
                              )}
                              {isOldest && (
                                <Badge variant="outline">
                                  Initial
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                          {/* Weight */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Weight className="h-3 w-3" />
                              Weight
                            </p>
                            <p className="text-lg font-semibold text-foreground">
                              {record.weight} kg
                            </p>
                          </div>

                          {/* Activity Level */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Activity className="h-3 w-3" />
                              Activity
                            </p>
                            <Badge className={getActivityLevelColor(record.activityLevel)}>
                              {getActivityLevelLabel(record.activityLevel)}
                            </Badge>
                          </div>

                          {/* Sleep Quality */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                              <Moon className="h-3 w-3" />
                              Sleep
                            </p>
                            <p className={`text-lg font-semibold ${getSleepQualityColor(record.sleepQuality)}`}>
                              {record.sleepQuality}/10
                            </p>
                          </div>
                        </div>

                        {/* Notes and Conditions */}
                        {(record.notes || record.chronicConditions?.length) && (
                          <div className="space-y-3">
                            {record.notes && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-1">
                                  <FileText className="h-4 w-4" />
                                  Notes
                                </p>
                                <p className="text-sm text-foreground bg-white p-2 rounded border border-border/50">
                                  {record.notes}
                                </p>
                              </div>
                            )}

                            {record.chronicConditions && record.chronicConditions.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Health Conditions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {record.chronicConditions.map((condition, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="bg-orange-100 text-orange-800 hover:bg-orange-100"
                                    >
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {healthHistory.length === 0 && (
          <Card className="border-border/50 bg-muted/30">
            <CardContent className="pt-12 pb-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Health Records Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Complete your health profile to start tracking your wellness journey.
              </p>
              <Button
                onClick={() => navigate('/profile')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Update Your Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfileHistoryPage;
