import { useState, useEffect } from 'react';
import { getServerUrl, serverFetch } from '../utils/supabase/client';
import { createClient } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { User, Mail, Shield, Trash2, Calendar, Clock, TrendingUp, Award, CheckCircle2, Camera, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface ProfileEditorProps {
  user: any;
  session: any;
}

export function ProfileEditor({ user, session }: ProfileEditorProps) {
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.user_metadata.avatar_url || null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Check for valid account creation timestamp
  const hasValidCreatedAt = user.created_at && !isNaN(new Date(user.created_at).getTime());
  
  // Check for valid session timestamp
  const hasValidSession = session?.user?.last_sign_in_at && !isNaN(new Date(session.user.last_sign_in_at).getTime());

  // Calculate membership duration
  const calculateMembershipDuration = () => {
    if (!hasValidCreatedAt) {
      return 'Maklumat keahlian tidak tersedia';
    }
    
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    if (years > 0) {
      return `${years} tahun${months > 0 ? ` dan ${months} bulan` : ''}`;
    } else if (months > 0) {
      return `${months} bulan${days > 0 ? ` dan ${days} hari` : ''}`;
    } else {
      return `${days} hari`;
    }
  };

  const formatMemberSinceDate = () => {
    if (!hasValidCreatedAt) {
      return 'Maklumat keahlian tidak tersedia';
    }
    
    const createdAt = new Date(user.created_at);
    return createdAt.toLocaleDateString('ms-MY', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Quick Stats calculations
  const calculateDaysActive = () => {
    if (!hasValidCreatedAt) {
      return 0;
    }
    
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAccountAgeBadge = () => {
    if (!hasValidCreatedAt) {
      return { label: 'Tidak Diketahui', color: 'bg-gray-100 text-gray-700' };
    }
    
    const days = calculateDaysActive();
    if (days < 30) return { label: 'Baru', color: 'bg-blue-100 text-blue-700' };
    if (days < 180) return { label: 'Biasa', color: 'bg-green-100 text-green-700' };
    return { label: 'Veteran', color: 'bg-purple-100 text-purple-700' };
  };

  const calculateProfileCompletion = () => {
    let score = 0;
    let total = 4;
    
    if (user.email) score++;
    if (user.user_metadata.name) score++;
    if (user.user_metadata.bio && user.user_metadata.bio.length > 0) score++;
    if (user.user_metadata.role) score++;
    
    return Math.round((score / total) * 100);
  };

  const formatLastLogin = () => {
    if (!hasValidSession) {
      return 'Maklumat sesi tidak tersedia';
    }
    
    if (session?.user?.last_sign_in_at) {
      const lastLogin = new Date(session.user.last_sign_in_at);
      const now = new Date();
      const diffTime = now.getTime() - lastLogin.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        const hours = diffHours % 24;
        if (hours > 0) {
          return `${diffDays}d ${hours}h`;
        }
        return `${diffDays} hari${diffDays > 1 ? 's' : ''}`;
      }
      if (diffHours > 0) {
        const minutes = diffMinutes % 60;
        if (minutes > 0) {
          return `${diffHours}h ${minutes}m`;
        }
        return `${diffHours} jam${diffHours > 1 ? 's' : ''}`;
      }
      if (diffMinutes > 0) {
        return `${diffMinutes} minit${diffMinutes > 1 ? 's' : ''}`;
      }
      return 'Baru sahaja';
    }
    return 'Maklumat sesi tidak tersedia';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
    };

    try {
      const response = await fetch(getServerUrl('/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      toast.success('Profil diperbarui berjaya! Sila segar semula untuk melihat perubahan.');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await serverFetch('/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete account';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.error || errorMessage;
          } else {
            const text = await response.text();
            console.error('Non-JSON response:', text);
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      toast.success('Akaun dihapuskan berjaya. Mengalihkan...');
      
      // Sign out from Supabase and redirect to login
      const supabase = createClient();
      await supabase.auth.signOut();
      
      setTimeout(() => {
        // Force a full page reload to reset app state
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Saiz imej mesti kurang daripada 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Sila muat naik fail imej');
      return;
    }

    setUploadingAvatar(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);

        // Update user metadata with new avatar
        const updateResponse = await fetch(getServerUrl('/profile'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: user.user_metadata.name,
            bio: user.user_metadata.bio,
            avatar_url: base64String,
          }),
        });

        if (!updateResponse.ok) throw new Error('Failed to update avatar');
        toast.success('Avatar diperbarui berjaya! Sila segar semula untuk melihat perubahan.');
        setUploadingAvatar(false);
      };

      reader.onerror = () => {
        toast.error('Gagal membaca fail imej');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload avatar');
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setChangingPassword(true);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('old-password') as string;
    const newPassword = formData.get('new-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Kata laluan baru tidak sepadan');
      setChangingPassword(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error('Kata laluan mesti sekurang-kurangnya 6 aksara');
      setChangingPassword(false);
      return;
    }

    // Validate old password is provided
    if (!oldPassword || oldPassword.trim() === '') {
      toast.error('Sila masukkan kata laluan semasa anda');
      setChangingPassword(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // First verify the old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        console.error('Old password verification failed:', signInError);
        toast.error('Kata laluan semasa tidak betul. Sila cuba lagi atau gunakan "Lupa Kata Laluan".');
        setChangingPassword(false);
        return;
      }
      
      // Update password using Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        throw error;
      }

      if (data) {
        toast.success('Kata laluan diperbarui berjaya!');
        // Reset form
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      console.error('Password change exception:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      console.log('=== PROFILE PASSWORD RESET REQUEST ===');
      const supabase = createClient();
      
      // Send password reset email
      // Use just the origin - Supabase will add the hash with tokens
      const redirectUrl = window.location.origin;
      console.log('Profile reset redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      console.log('✅ Password reset email sent successfully to:', user.email);
      toast.success('Pautan reset kata laluan telah dihantar ke e-mel anda! Semak kotak masuk anda dan klik pautan untuk menetapkan semula kata laluan anda.', {
        duration: 6000
      });
    } catch (error: any) {
      console.error('Password reset exception:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header with Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={avatarPreview || user.user_metadata.avatar_url} alt={user.user_metadata.name || user.email} />
            <AvatarFallback className="text-2xl">
              {user.user_metadata.name 
                ? user.user_metadata.name.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
          >
            <Camera className="w-4 h-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
        <div>
          <h2 className="text-3xl text-gray-900">{user.user_metadata.name || 'Profil Pengguna'}</h2>
          <p className="text-gray-600 mt-1">Urus maklumat peribadi dan preferensi anda</p>
          {uploadingAvatar && (
            <p className="text-sm text-indigo-600 mt-1">Memuat naik avatar...</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Account Information & Quick Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maklumat Akaun</CardTitle>
              <CardDescription>Lihat butiran akaun anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">E-mel</p>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Peranan</p>
                  <p className="capitalize">{user.user_metadata.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Dicipta Sejak</p>
                  <p>{formatMemberSinceDate()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Tempoh Penciptaan Akaun</p>
                  <p>{calculateMembershipDuration()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Bio</p>
                  <p className="text-sm whitespace-pre-wrap">{user.user_metadata.bio || 'Tiada bio ditambahkan lagi'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <TrendingUp className="w-5 h-5" />
                Statistik Pantas
              </CardTitle>
              <CardDescription>Gambaran keseluruhan penglibatan platform anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Age Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm">Status Akaun</span>
                </div>
                <Badge className={getAccountAgeBadge().color}>
                  {getAccountAgeBadge().label}
                </Badge>
              </div>

              {/* Last Login */}
              <div className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border ${!hasValidSession ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-indigo-100 dark:border-indigo-900'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${!hasValidSession ? 'text-gray-400' : 'text-indigo-600'}`} />
                  <span className="text-sm">Tempoh Sesi</span>
                </div>
                <span className={!hasValidSession ? 'text-gray-500 text-sm' : 'text-indigo-900'}>{formatLastLogin()}</span>
              </div>

              {/* Profile Completion */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm">Kelengkapan Profil</span>
                  </div>
                  <span className="text-indigo-900">{calculateProfileCompletion()}%</span>
                </div>
                <Progress value={calculateProfileCompletion()} className="h-2" />
                {calculateProfileCompletion() < 100 && (
                  <p className="text-xs text-indigo-600 mt-1">
                    {calculateProfileCompletion() < 75 ? 'Tambahkan bio untuk melengkapkan profil anda!' : 'Hampir selesai!'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile with Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Perbarui butiran peribadi dan kata laluan anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Information Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Penuh</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.user_metadata.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (pilihan)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Beritahu kami sedikit tentang diri anda..."
                  defaultValue={user.user_metadata.bio || ''}
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">Tukar Kata Laluan</span>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="old-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Kata Laluan Semasa
                </Label>
                <Input
                  id="old-password"
                  name="old-password"
                  type="password"
                  placeholder="Masukkan kata laluan semasa"
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Kata Laluan Baru
                </Label>
                <Input
                  id="new-password"
                  name="new-password"
                  type="password"
                  placeholder="Masukkan kata laluan baru (min 6 aksara)"
                  minLength={6}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordStrengthIndicator password={newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Sahkan Kata Laluan Baru
                </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  placeholder="Sahkan kata laluan baru"
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                variant="outline"
                className="w-full" 
                disabled={changingPassword}
              >
                {changingPassword ? 'Menukar Kata Laluan...' : 'Perbarui Kata Laluan'}
              </Button>
            </form>

            {/* Forgot Password Section */}
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Terlupa kata laluan semasa anda? Kami boleh menghantar pautan tetap semula.
              </p>
              <Button 
                type="button"
                variant="ghost"
                className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" 
                onClick={handleForgotPassword}
              >
                <Mail className="w-4 h-4 mr-2" />
                Hantar E-mel Tetap Semula
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Padam Akaun
          </CardTitle>
          <CardDescription>Tindakan akaun yang tidak boleh diterbalikkan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Sebaik sahaja anda memadam akaun, tiada jalan untuk kembali. Ini akan memadam secara kekal:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>Maklumat profil anda</li>
            <li>Semua rekod kemajuan anda</li>
            <li>Siaran dan balasan forum anda</li>
            <li>Sebarang penilaian yang anda cipta (untuk guru)</li>
          </ul>
          <Button
            variant="destructive"
            className="w-full mt-4"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Padam Akaun Secara Kekal
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adakah anda benar-benar pasti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak boleh dibatalkan. Ini akan memadam akaun anda secara kekal dan menghapuskan semua data anda dari pelayan kami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <button
              className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Batal
                </button>
                </AlertDialogCancel>
                
                <AlertDialogAction asChild>
                  <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                  >
                    {deleting ? 'Memadam...' : 'Ya, Padam Akaun Saya'}
                    </button>
                    </AlertDialogAction>
                    </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}