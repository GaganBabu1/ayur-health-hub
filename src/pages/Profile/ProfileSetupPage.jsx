import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import userService from '@/services/userService';

const ProfileSetupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
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

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

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

    if (!formData.diseaseHistory.trim()) {
      newErrors.diseaseHistory = 'Disease history is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

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
        description: 'Your profile has been updated.',
        variant: 'default',
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in first to set up your profile.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-6 w-6" />
              <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            </div>
            <CardDescription className="text-green-100">
              Help us personalize your Ayurvedic health journey
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  disabled={!!user?.name}
                  className="text-base"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Age */}
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

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-medium">
                  Gender *
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
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

              {/* Height */}
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
                  placeholder="Enter your height in cm"
                  className="text-base"
                />
                {errors.height && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.height}
                  </p>
                )}
              </div>

              {/* Weight */}
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
                  placeholder="Enter your weight in kg"
                  className="text-base"
                />
                {errors.weight && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.weight}
                  </p>
                )}
              </div>

              {/* Lifestyle */}
              <div className="space-y-2">
                <Label htmlFor="lifestyle" className="text-base font-medium">
                  Lifestyle *
                </Label>
                <Select value={formData.lifestyle} onValueChange={(value) => handleChange('lifestyle', value)}>
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

              {/* Sleep Quality */}
              <div className="space-y-2">
                <Label htmlFor="sleepQuality" className="text-base font-medium">
                  Sleep Quality (1-5) *
                </Label>
                <Select value={formData.sleepQuality} onValueChange={(value) => handleChange('sleepQuality', value)}>
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

              {/* Chronic Conditions */}
              <div className="space-y-2">
                <Label htmlFor="chronicConditions" className="text-base font-medium">
                  Chronic Conditions (optional)
                </Label>
                <Textarea
                  id="chronicConditions"
                  value={formData.chronicConditions}
                  onChange={(e) => handleChange('chronicConditions', e.target.value)}
                  placeholder="E.g., Diabetes, Hypertension, Asthma..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-base font-medium">
                  Allergies (optional)
                </Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleChange('allergies', e.target.value)}
                  placeholder="List any allergies you have..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Disease History */}
              <div className="space-y-2">
                <Label htmlFor="diseaseHistory" className="text-base font-medium">
                  Medical/Disease History *
                </Label>
                <Textarea
                  id="diseaseHistory"
                  value={formData.diseaseHistory}
                  onChange={(e) => handleChange('diseaseHistory', e.target.value)}
                  placeholder="Describe any past or present medical conditions, surgeries, or health issues..."
                  className="resize-none"
                  rows={4}
                />
                {errors.diseaseHistory && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> {errors.diseaseHistory}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Updating Profile...
                    </>
                  ) : (
                    'Complete Profile Setup'
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                * Required fields
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
