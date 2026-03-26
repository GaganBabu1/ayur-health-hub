import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { settingsService } from '@/services/settingsService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Lock,
  Bell,
  Mail,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface PreferencesData {
  emailHealthTips: boolean;
  appointmentNotifications: boolean;
}

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Active section state
  const [activeSection, setActiveSection] = useState<'password' | 'preferences' | 'account'>(
    'preferences'
  );

  // Password change state
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordFormData>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState<PreferencesData>({
    emailHealthTips: true,
    appointmentNotifications: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  if (!user) {
    return (
      <DashboardLayout title="Settings">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access settings.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Password validation
  const validatePassword = (): boolean => {
    const errors: Partial<PasswordFormData> = {};

    if (!passwordForm.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast({
        title: 'Validation Error',
        description: 'Please check your password inputs',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast({
        title: 'Success!',
        description: 'Your password has been changed successfully.',
      });

      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle preference toggle
  const handlePreferenceChange = async (key: keyof PreferencesData) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(newPreferences);
    setIsSavingPreferences(true);

    try {
      const mappedPreferences = {
        emailNotifications: newPreferences.emailHealthTips,
        appointmentReminders: newPreferences.appointmentNotifications,
        healthTips: newPreferences.emailHealthTips,
        dataSharing: false,
      };

      await settingsService.updatePreferences(mappedPreferences);

      toast({
        title: 'Success!',
        description: 'Your preferences have been updated.',
      });
    } catch (error) {
      console.error('Preference update error:', error);
      // Revert change on error
      setPreferences(preferences);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    try {
      const userPassword = (document.getElementById('delete-account-password') as HTMLInputElement)?.value;
      if (!userPassword) {
        toast({
          title: 'Error',
          description: 'Please enter your password to confirm account deletion.',
          variant: 'destructive',
        });
        setIsDeletingAccount(false);
        return;
      }

      await settingsService.deleteAccount({ password: userPassword });

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });

      // Logout and redirect
      logout();
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-6xl mx-auto">
        {/* User Info Header */}
        <Card className="mb-6 border-border/50 shadow-card bg-gradient-to-r from-green-50 to-green-100/50">
          <CardContent className="pt-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-1 rounded-full">
                  {user.role?.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-card">
              <CardContent className="p-0">
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection('preferences')}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-t-lg transition-colors ${
                      activeSection === 'preferences'
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-600'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="font-medium">Preferences</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('password')}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      activeSection === 'password'
                        ? 'bg-green-100 text-green-700 border-l-4 border-green-600'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Lock className="h-5 w-5" />
                    <span className="font-medium">Password</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('account')}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-b-lg transition-colors ${
                      activeSection === 'account'
                        ? 'bg-red-100 text-red-700 border-l-4 border-red-600'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">Account</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Panel */}
          <div className="lg:col-span-3">
            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-green-600" />
                    Email & Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage how you receive notifications and communications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email Health Tips */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-base font-medium cursor-pointer">
                        📧 Health Tips & Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive personalized health tips and wellness updates via email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailHealthTips}
                      onCheckedChange={() => handlePreferenceChange('emailHealthTips')}
                      disabled={isSavingPreferences}
                    />
                  </div>

                  <Separator />

                  {/* Appointment Notifications */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      <Label className="text-base font-medium cursor-pointer">
                        🔔 Appointment Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about upcoming appointments and reminders
                      </p>
                    </div>
                    <Switch
                      checked={preferences.appointmentNotifications}
                      onCheckedChange={() => handlePreferenceChange('appointmentNotifications')}
                      disabled={isSavingPreferences}
                    />
                  </div>

                  {isSavingPreferences && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <LoadingSpinner className="h-4 w-4" />
                      Saving preferences...
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Password Change Section */}
            {activeSection === 'password' && (
              <Card className="border-border/50 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-base font-medium">
                        Current Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => {
                            setPasswordForm(prev => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }));
                            if (passwordErrors.currentPassword) {
                              setPasswordErrors(prev => ({
                                ...prev,
                                currentPassword: undefined,
                              }));
                            }
                          }}
                          placeholder="Enter your current password"
                          className="text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-base font-medium">
                        New Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => {
                            setPasswordForm(prev => ({
                              ...prev,
                              newPassword: e.target.value,
                            }));
                            if (passwordErrors.newPassword) {
                              setPasswordErrors(prev => ({
                                ...prev,
                                newPassword: undefined,
                              }));
                            }
                          }}
                          placeholder="Enter your new password"
                          className="text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters long
                      </p>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword" className="text-base font-medium">
                        Confirm New Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmNewPassword}
                          onChange={(e) => {
                            setPasswordForm(prev => ({
                              ...prev,
                              confirmNewPassword: e.target.value,
                            }));
                            if (passwordErrors.confirmNewPassword) {
                              setPasswordErrors(prev => ({
                                ...prev,
                                confirmNewPassword: undefined,
                              }));
                            }
                          }}
                          placeholder="Confirm your new password"
                          className="text-base pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmNewPassword && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" /> {passwordErrors.confirmNewPassword}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-11 text-base font-medium"
                    >
                      {isChangingPassword ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Account Management Section */}
            {activeSection === 'account' && (
              <Card className="border-border/50 shadow-card border-red-200">
                <CardHeader className="border-b border-red-200">
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Account Management
                  </CardTitle>
                  <CardDescription>
                    Manage your account and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Deletion Warning */}
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                      <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                      All your data, including consultations, health history, and profile information will be
                      permanently deleted.
                    </AlertDescription>
                  </Alert>

                  {/* Delete Account Button */}
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="w-full h-11 text-base font-medium"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account Permanently
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    This action cannot be reversed. Please make sure you want to delete your account.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Account Deletion */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your account and all associated data will be permanently deleted.
              <br />
              <br />
              <strong>Please type your email to confirm:</strong>
              <br />
              <span className="font-mono bg-muted p-2 rounded mt-2 block">{user.email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingAccount ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SettingsPage;
