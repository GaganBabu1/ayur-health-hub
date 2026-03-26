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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner, LoadingPage } from '@/components/ui/loading-spinner';
import { User, Mail, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import userService from '@/services/userService';

interface ProfileData {
  name: string;
  email: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  lifestyle: string;
  sleepQuality: string;
  chronicConditions: string;
  allergies: string;
  diseaseHistory: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    lifestyle: '',
    sleepQuality: '',
    chronicConditions: '',
    allergies: '',
    diseaseHistory: '',
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getProfile();

        // Map backend response to form data
        const mappedData: ProfileData = {
          name: profileData.name || '',
          email: profileData.email || '',
          age: profileData.age?.toString() || '',
          gender: profileData.gender || '',
          height: profileData.height?.toString() || '',
          weight: profileData.weight?.toString() || '',
          lifestyle: profileData.lifestyle || '',
          sleepQuality: profileData.sleepQuality?.toString() || '',
          chronicConditions: Array.isArray(profileData.chronicConditions) ? profileData.chronicConditions.join(', ') : '',
          allergies: Array.isArray(profileData.allergies) ? profileData.allergies.join(', ') : '',
          diseaseHistory: profileData.diseaseHistory || '',
        };

        setFormData(mappedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<ProfileData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age (1-120)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.height) {
      newErrors.height = 'Height is required';
    } else if (parseInt(formData.height) < 50 || parseInt(formData.height) > 300) {
      newErrors.height = 'Please enter a valid height (50-300 cm)';
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (parseInt(formData.weight) < 10 || parseInt(formData.weight) > 500) {
      newErrors.weight = 'Please enter a valid weight (10-500 kg)';
    }

    if (!formData.lifestyle) {
      newErrors.lifestyle = 'Lifestyle is required';
    }

    if (!formData.sleepQuality) {
      newErrors.sleepQuality = 'Sleep quality is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare data for API call - convert array strings back to arrays
      const updateData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        lifestyle: formData.lifestyle,
        sleepQuality: parseInt(formData.sleepQuality),
        chronicConditions: formData.chronicConditions
          ? formData.chronicConditions.split(',').map(item => item.trim()).filter(item => item)
          : [],
        allergies: formData.allergies
          ? formData.allergies.split(',').map(item => item.trim()).filter(item => item)
          : [],
        diseaseHistory: formData.diseaseHistory,
      };

      await userService.updateProfile(updateData);

      toast({
        title: 'Success!',
        description: 'Your profile has been updated successfully.',
        variant: 'default',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Profile">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to view your profile.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) return <LoadingPage />;

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* User Header Card */}
        <Card className="border-border/50 shadow-card bg-gradient-to-r from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{formData.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                </div>
              </div>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update your basic personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="text-base"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="text-base bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-medium">
                      Age (years) *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="Enter your age"
                      className="text-base"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.age}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-medium">
                      Gender *
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger id="gender" className="text-base">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.gender}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics Section */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Health Metrics
                </CardTitle>
                <CardDescription>
                  Maintain your physical health measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Height and Weight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-base font-medium">
                      Height (cm) *
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      min="50"
                      max="300"
                      value={formData.height}
                      onChange={(e) => handleChange('height', e.target.value)}
                      placeholder="e.g., 170"
                      className="text-base"
                    />
                    {errors.height && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.height}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-base font-medium">
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      min="10"
                      max="500"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      placeholder="e.g., 70"
                      className="text-base"
                    />
                    {errors.weight && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.weight}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lifestyle and Sleep Quality */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lifestyle" className="text-base font-medium">
                      Lifestyle *
                    </Label>
                    <Select
                      value={formData.lifestyle}
                      onValueChange={(value) => handleChange('lifestyle', value)}
                    >
                      <SelectTrigger id="lifestyle" className="text-base">
                        <SelectValue placeholder="Select your lifestyle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (mostly sitting)</SelectItem>
                        <SelectItem value="moderate">Moderate (light activity)</SelectItem>
                        <SelectItem value="active">Active (regular exercise)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.lifestyle && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.lifestyle}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleepQuality" className="text-base font-medium">
                      Sleep Quality (1-5) *
                    </Label>
                    <Select
                      value={formData.sleepQuality}
                      onValueChange={(value) => handleChange('sleepQuality', value)}
                    >
                      <SelectTrigger id="sleepQuality" className="text-base">
                        <SelectValue placeholder="Rate your sleep quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sleepQuality && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {errors.sleepQuality}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 h-11 text-base font-medium"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Required fields
            </p>
          </form>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Basic Information - View */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                    <p className="text-base text-foreground">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-base text-foreground">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Age</p>
                    <p className="text-base text-foreground">{formData.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Gender</p>
                    <p className="text-base text-foreground capitalize">{formData.gender}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics - View */}
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Height</p>
                    <p className="text-base text-foreground">{formData.height} cm</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Weight</p>
                    <p className="text-base text-foreground">{formData.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Lifestyle</p>
                    <p className="text-base text-foreground capitalize">{formData.lifestyle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Sleep Quality</p>
                    <p className="text-base text-foreground">{formData.sleepQuality}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
