import { useState } from 'react';
import { createClient, getServerUrl } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BookOpen, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/e6d79e8861bd18ad0650862c9dc2b4cc7c09cf38.png';
import { SetupHelper } from './SetupHelper';
import { ResetPasswordPage } from './ResetPasswordPage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ThemeToggle } from './ThemeToggle';

interface LoginPageProps {
  onLogin: (user: any, session: any) => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showSetupHelper, setShowSetupHelper] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    try {
      const supabase = createClient();
      
      // Sign up directly with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: role || 'student',
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (data.user && data.session) {
        // Create user profile in the database
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            name: name,
            role: role || 'student',
          });
        } catch (profileError) {
          console.log('Profile creation error (may already exist):', profileError);
          // Don't fail if profile already exists
        }
        
        const roleText = role === 'teacher' ? 'Guru' : 'Pelajar';
        toast.success(
          `🎉 Akaun berjaya dibuat! Selamat datang ke FreeLearning, ${name}! Anda kini log masuk sebagai ${roleText}.`,
          { duration: 5000 }
        );
        onLogin(data.user, data.session);
      } else {
        // User created but no session (email confirmation might be required)
        toast.success(
          'Akaun telah dibuat! Anda boleh log masuk sekarang.',
          { duration: 4000 }
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Gagal mencipta akaun. Sila cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('login-email') as string;
    const password = formData.get('login-password') as string;

    console.log('Attempting login for:', email);

    try {
      const supabase = createClient();
      
      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Login response:', { data, error });

      if (error) {
        console.error('Login error details:', error);
        
        // Increment error count and show setup helper after 2 auth errors
        const newErrorCount = errorCount + 1;
        setErrorCount(newErrorCount);
        
        if (error.message.toLowerCase().includes('email not confirmed') || 
            error.message.toLowerCase().includes('invalid login credentials')) {
          if (newErrorCount >= 2) {
            setShowSetupHelper(true);
          }
        }
        
        // Handle specific error cases
        if (error.message.toLowerCase().includes('email not confirmed')) {
          toast.error(
            'E-mel belum disahkan. Klik "Perlukan Bantuan Persediaan?" di bawah untuk arahan.',
            { duration: 6000 }
          );
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          // Could be wrong password OR unconfirmed email showing as invalid credentials
          toast.error(
            'Kelayakan tidak sah. Ini mungkin disebabkan e-mel yang belum disahkan. Klik "Perlukan Bantuan Persediaan?" di bawah.',
            { duration: 6000 }
          );
        } else {
          toast.error(error.message);
        }
        throw error;
      }

      if (data.session && data.user) {
        console.log('Login successful, user:', data.user.email);
        toast.success('Selamat kembali!');
        onLogin(data.user, data.session);
      } else {
        toast.error('Log masuk gagal. Sila cuba lagi.');
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      // Error already handled above with specific messages
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendingReset(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('reset-email') as string;

    try {
      console.log('Sending password reset email to:', email);
      const supabase = createClient();
      
      // Get the current origin for redirect
      const redirectUrl = `${window.location.origin}`;
      console.log('Reset redirect URL:', redirectUrl);
      
      // Send password reset email using Supabase
      // The redirectTo should be just the origin - Supabase will add the hash with tokens
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      // Store email for reference
      setResetEmail(email);
      toast.success('Pautan set semula kata laluan telah dihantar! Sila semak e-mel anda dan klik pautan untuk menetapkan semula kata laluan anda.', { 
        duration: 6000 
      });
      
      console.log('✅ Password reset email sent successfully to:', email);
      
      // Close dialog after a moment
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 1000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Gagal menghantar e-mel set semula. Sila cuba lagi.');
    } finally {
      setSendingReset(false);
    }
  };

  // If setup helper should be shown, show it instead
  if (showSetupHelper) {
    return <SetupHelper />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Theme toggle - absolute positioned at top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle showLabels={false} variant="ghost" size="icon" />
      </div>
      
      {/* Back button */}
      {onBack && (
        <div className="absolute top-4 left-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Utama
          </Button>
        </div>
      )}
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="text-center md:text-left space-y-6">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <img src={logoImage} alt="FreeLearning Logo" className="h-16" />
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-md">
            Platform Pendidikan HCI Interaktif
          </p>
          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
              <p>Laluan pembelajaran berstruktur dengan latihan interaktif</p>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
              <p>Pengurusan bilik darjah dan penjejakan kemajuan oleh guru</p>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
              <p>Kuiz bergamifikasi dan sokongan pembelajaran berkuasa AI</p>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <Card className="shadow-2xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Selamat Datang ke FreeLearning</CardTitle>
            <CardDescription>
              Log masuk ke akaun anda atau cipta akaun baharu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log Masuk</TabsTrigger>
                <TabsTrigger value="signup">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mel</Label>
                    <Input
                      id="login-email"
                      name="login-email"
                      type="email"
                      placeholder="anda@contoh.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Kata Laluan</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                      >
                        Lupa kata laluan?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      name="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sedang log masuk...' : 'Log Masuk'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Penuh</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ahmad Bin Ali"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mel</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="anda@contoh.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Kata Laluan</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Saya adalah...</Label>
                    <RadioGroup defaultValue="student" name="role" required>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="cursor-pointer">
                          Pelajar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher" className="cursor-pointer">
                          Guru
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Mencipta Akaun...' : 'Cipta Akaun'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Semula Kata Laluan</DialogTitle>
            <DialogDescription>
              Masukkan alamat e-mel anda dan kami akan menghantar pautan set semula kata laluan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Alamat E-mel
              </Label>
              <Input
                id="reset-email"
                name="reset-email"
                type="email"
                placeholder="anda@contoh.com"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
                disabled={sendingReset}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={sendingReset}>
                {sendingReset ? 'Menghantar...' : 'Hantar Pautan Set Semula'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}