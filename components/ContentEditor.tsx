import { useState, useEffect } from 'react';
import { getServerUrl, serverFetch, createClient } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Settings, Save, Plus, Trash2, Edit2, Megaphone, AlertCircle, CheckCircle, XCircle, MessageSquare, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ContentEditorProps {
  session: any;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface PendingMaterial {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  difficulty: string;
  created_by: string;
  created_at: string;
  submitted_by_name?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface PendingTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  author_name: string;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export function ContentEditor({ session }: ContentEditorProps) {
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<Record<string, any>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  
  // New state for user content moderation
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);
  const [pendingTopics, setPendingTopics] = useState<PendingTopic[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  useEffect(() => {
    fetchContent();
    fetchAnnouncements();
    fetchPendingContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch(getServerUrl('/content'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      
      // Convert array to object keyed by page name
      const contentMap: Record<string, any> = {};
      data.content?.forEach((item: any) => {
        const pageName = item.id?.replace('content:', '') || '';
        contentMap[pageName] = item;
      });
      
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(getServerUrl('/content/announcements'), {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      
      // Handle the content structure
      if (data.content && data.content.announcements) {
        const announcementsList = Array.isArray(data.content.announcements) 
          ? data.content.announcements 
          : [];
        
        // Sort by createdAt (newest first)
        const sorted = announcementsList.sort((a: Announcement, b: Announcement) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAnnouncements(sorted);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error mengambil announcements:', error);
      setAnnouncements([]);
    }
  };

  const fetchPendingContent = async () => {
    setLoadingPending(true);
    try {
      // Fetch all materials and filter for pending ones
      const materialsResponse = await serverFetch('/materials', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const materialsData = await materialsResponse.json();
      const allMaterials = materialsData.materials || [];
      
      // Filter for pending materials only
      const pendingMaterialsList = allMaterials.filter(
        (m: PendingMaterial) => m.approval_status === 'pending'
      );
      setPendingMaterials(pendingMaterialsList);

    } catch (error) {
      console.error('Error mengambil content menunggu kelulusan:', error);
      setPendingMaterials([]);

    } finally {
      setLoadingPending(false);
    }
  };

  const handleSave = async (page: string, data: any) => {
    setSaving(true);
    try {
      console.log(`ContentEditor - Saving ${page} content:`, data);
      const response = await fetch(getServerUrl(`/content/${page}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('ContentEditor - Save failed:', errorData);
        throw new Error('Gagal untuk mengemaskini content');
      }

      console.log('ContentEditor - Save successful');
      toast.success('Kandungan berjaya dikemas kini! Perubahan kini telah diaktifkan.', {
        description: 'Semua pengguna akan melihat kandungan yang dikemas kini dalam masa 5 saat.',
      });
      fetchContent();
    } catch (error: any) {
      console.error('Error mengemaskini Kandungan:', error);
      toast.error(error.message || 'Gagal mengemaskini kandungan');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.message.trim()) {
      toast.error('Sila masukkan mesej pengumuman');
      return;
    }

    setSaving(true);
    try {
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        title: announcementForm.title,
        message: announcementForm.message,
        priority: announcementForm.priority,
        createdAt: new Date().toISOString(),
        createdBy: session.user.id,
      };

      const updatedAnnouncements = [newAnnouncement, ...announcements];

      const response = await fetch(getServerUrl('/content/announcements'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ announcements: updatedAnnouncements }),
      });

      if (!response.ok) {
        throw new Error('Gagal mencipta mesej pengumuman');
      }

      toast.success('Mesej Pengumuman telah berjaya dicipta!');
      setShowAnnouncementDialog(false);
      setAnnouncementForm({ title: '', message: '', priority: 'medium' });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error mencipta Pengumuman:', error);
      toast.error(error.message || 'Gagal mencipta pengumuman');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement || !announcementForm.message.trim()) {
      toast.error('Sila masukkan mesej Pengumuman');
      return;
    }

    setSaving(true);
    try {
      const updatedAnnouncements = announcements.map(ann => 
        ann.id === editingAnnouncement.id
          ? {
              ...ann,
              title: announcementForm.title,
              message: announcementForm.message,
              priority: announcementForm.priority,
              updatedAt: new Date().toISOString(),
              updatedBy: session.user.id,
            }
          : ann
      );

      const response = await fetch(getServerUrl('/content/announcements'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ announcements: updatedAnnouncements }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengemaskini Pengumuman');
      }

      toast.success('Pengumuman berjaya dikemaskini!');
      setShowAnnouncementDialog(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', message: '', priority: 'medium' });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error mengemaskini Pengumuman:', error);
      toast.error(error.message || 'Gagal mengemaskini Pengumuman');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Adakah anda pasti mahu delete pengumuman ini?')) {
      return;
    }

    setSaving(true);
    try {
      const updatedAnnouncements = announcements.filter(ann => ann.id !== id);

      const response = await fetch(getServerUrl('/content/announcements'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ announcements: updatedAnnouncements }),
      });

      if (!response.ok) {
        throw new Error('Gagal untuk delete Pengumuman');
      }

      toast.success('Pengumuman Berjaya Delete!');
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Error Delete Pengumuman:', error);
      toast.error(error.message || 'Gagal untuk delete Pengumuman');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
    });
    setShowAnnouncementDialog(true);
  };

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: '', message: '', priority: 'medium' });
    setShowAnnouncementDialog(true);
  };

  const handleHomeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleSave('landing', {
      heroTitle: formData.get('heroTitle'),
      heroSubtitle: formData.get('heroSubtitle'),
      featuresTitle: formData.get('featuresTitle'),
      featuresSubtitle: formData.get('featuresSubtitle'),
      howItWorksTitle: formData.get('howItWorksTitle'),
      ctaTitle: formData.get('ctaTitle'),
      ctaSubtitle: formData.get('ctaSubtitle'),
    });
  };

  const handleAboutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleSave('about', {
      pageTitle: formData.get('pageTitle'),
      pageSubtitle: formData.get('pageSubtitle'),
      missionTitle: formData.get('missionTitle'),
      missionDescription: formData.get('missionDescription'),
      missionContent: formData.get('missionContent'),
      differenceTitle: formData.get('differenceTitle'),
      technologyTitle: formData.get('technologyTitle'),
      technologyDescription: formData.get('technologyDescription'),
      capabilitiesTitle: formData.get('capabilitiesTitle'),
      teachersTitle: formData.get('teachersTitle'),
      teachersDescription: formData.get('teachersDescription'),
      studentsTitle: formData.get('studentsTitle'),
      studentsDescription: formData.get('studentsDescription'),
      aboutCtaTitle: formData.get('aboutCtaTitle'),
      aboutCtaSubtitle: formData.get('aboutCtaSubtitle'),
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-700 bg-gray-50 border-gray-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-gray-900">Pengurusan Kandungan</h2>
        <p className="text-gray-600 mt-1">Ubah halaman dan pengumuman</p>
      </div>

      <Tabs defaultValue="home">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="about">About Page</TabsTrigger>
          <TabsTrigger value="announcements">Pengumuman</TabsTrigger>
          <TabsTrigger value="user-content">
            <Clock className="w-4 h-4 mr-2" />
            Kandungan Pengguna
            {(pendingMaterials.length + pendingTopics.length > 0) && (
              <Badge className="ml-2 bg-orange-500">{pendingMaterials.length + pendingTopics.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Kandungan Home Page
              </CardTitle>
              <CardDescription>Ubah Kandungan Landing Page Utama</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHomeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Tajuk Hero</Label>
                  <Input
                    id="heroTitle"
                    name="heroTitle"
                    defaultValue={content.landing?.heroTitle || 'Selamat datang ke FreeLeaarning'}
                    placeholder="Selamat datang ke FreeLearning"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heroSubtitle">Deskripsi Hero</Label>
                  <Textarea
                    id="heroSubtitle"
                    name="heroSubtitle"
                    defaultValue={content.landing?.heroSubtitle || 'Platform pembelajaran HCI interaktif anda'}
                    placeholder="Ucapan alu-aluan ringkas"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuresTitle">Tajuk Section Ciri-Ciri</Label>
                  <Input
                    id="featuresTitle"
                    name="featuresTitle"
                    defaultValue={content.landing?.featuresTitle || 'Ciri-Ciri Platform'}
                    placeholder="Ciri-Ciri Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuresSubtitle">Deskripsi Section Ciri-Ciri</Label>
                  <Textarea
                    id="featuresSubtitle"
                    name="featuresSubtitle"
                    defaultValue={content.landing?.featuresSubtitle || 'Terokai ciri-ciri utama platform kami'}
                    placeholder="Deskripsi Section Ciri-Ciri"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="howItWorksTitle">Bagaiman Ia Berfungsi Title</Label>
                  <Input
                    id="howItWorksTitle"
                    name="howItWorksTitle"
                    defaultValue={content.landing?.howItWorksTitle || 'Bagaimana Ia Berfungsi'}
                    placeholder="Bagaiman Ia Berfungsi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaTitle">Tajuk Call to Action</Label>
                  <Input
                    id="ctaTitle"
                    name="ctaTitle"
                    defaultValue={content.landing?.ctaTitle || 'Mulakan'}
                    placeholder="Mulakan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaSubtitle">Dekripsi Call to Action</Label>
                  <Textarea
                    id="ctaSubtitle"
                    name="ctaSubtitle"
                    defaultValue={content.landing?.ctaSubtitle || 'Sertai komuniti kami dan mula belajar hari ini'}
                    placeholder="Deskripsi Call to action"
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Menyimpan Home Page'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                About Page Content
              </CardTitle>
              <CardDescription>Ubah Informasi About Page</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAboutSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle">Tajuk Halaman</Label>
                  <Input
                    id="pageTitle"
                    name="pageTitle"
                    defaultValue={content.about?.pageTitle || 'Tentang FreeLearning'}
                    placeholder="Tentang FreeLearning"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pageSubtitle">Deskripsi Halaman</Label>
                  <Textarea
                    id="pageSubtitle"
                    name="pageSubtitle"
                    defaultValue={content.about?.pageSubtitle || 'FreeLearning merupakan platform pendidikan HCI interaktif...'}
                    placeholder="Deskripsi Platform"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionTitle">Tajuk Misi</Label>
                  <Input
                    id="missionTitle"
                    name="missionTitle"
                    defaultValue={content.about?.missionTitle || 'Misi kita'}
                    placeholder="Misi kita"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionDescription">Deskripsi Misi</Label>
                  <Textarea
                    id="missionDescription"
                    name="missionDescription"
                    defaultValue={content.about?.missionDescription || 'Misi kami adalah untuk menjadikan pendidikan HCI mudah diakses...'}
                    placeholder="Pernyataan misi"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="missionContent">Kandungan Misi</Label>
                  <Textarea
                    id="missionContent"
                    name="missionContent"
                    defaultValue={content.about?.missionContent || 'Kami percaya dalam menyediakan pendidikan berkualiti tinggi...'}
                    placeholder="Kandungan Misi"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="differenceTitle">Tajuk Perbezaan</Label>
                  <Input
                    id="differenceTitle"
                    name="differenceTitle"
                    defaultValue={content.about?.differenceTitle || 'Apa yang Membezakan Kita'}
                    placeholder="Apa yang Membezakan Kita"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologyTitle">Tajuk Teknologi</Label>
                  <Input
                    id="technologyTitle"
                    name="technologyTitle"
                    defaultValue={content.about?.technologyTitle || 'Teknologi Canggih'}
                    placeholder="Teknologi Canggih"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologyDescription">Deskripsi Teknologi</Label>
                  <Textarea
                    id="technologyDescription"
                    name="technologyDescription"
                    defaultValue={content.about?.technologyDescription || 'Platform kami dibina berdasarkan teknologi canggih...'}
                    placeholder="Deskripsi Teknologi"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capabilitiesTitle">Tajuk Keupayaan</Label>
                  <Input
                    id="capabilitiesTitle"
                    name="capabilitiesTitle"
                    defaultValue={content.about?.capabilitiesTitle || 'Keupayaan Platform'}
                    placeholder="Keupayaan Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachersTitle">Tajuk Cikgu</Label>
                  <Input
                    id="teachersTitle"
                    name="teachersTitle"
                    defaultValue={content.about?.teachersTitle || 'Untuk Cikgu'}
                    placeholder="Untuk Cikgu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teachersDescription">Deskripsi Cikgu</Label>
                  <Textarea
                    id="teachersDescription"
                    name="teachersDescription"
                    defaultValue={content.about?.teachersDescription || 'Perkasakan pelajar anda dengan platform kami...'}
                    placeholder="Deskripsi Cikgu"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentsTitle">Tajuk Pelajar</Label>
                  <Input
                    id="studentsTitle"
                    name="studentsTitle"
                    defaultValue={content.about?.studentsTitle || 'Untuk Pelajar'}
                    placeholder="Untuk Pelajar"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentsDescription">Deskripsi Pelajar</Label>
                  <Textarea
                    id="studentsDescription"
                    name="studentsDescription"
                    defaultValue={content.about?.studentsDescription || 'Pelajari HCI dengan mudah dan cekap...'}
                    placeholder="Deskripsi Pelajar"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutCtaTitle">Tajuk Tentang CTA</Label>
                  <Input
                    id="aboutCtaTitle"
                    name="aboutCtaTitle"
                    defaultValue={content.about?.aboutCtaTitle || 'Sertai Kami'}
                    placeholder="Sertai Kami"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutCtaSubtitle">Deskripsi Tentang CTA</Label>
                  <Textarea
                    id="aboutCtaSubtitle"
                    name="aboutCtaSubtitle"
                    defaultValue={content.about?.aboutCtaSubtitle || 'Alami masa depan pendidikan HCI...'}
                    placeholder="Deskripsi Tentang CTA"
                    rows={4}
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Menyimpan...' : 'Simpan About Page'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Announcements
              </CardTitle>
              <CardDescription>Urus pengumuman platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={openCreateDialog}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Cipta Pengumuman
                </Button>

                {announcements.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tiada pengumuman lagi. Cipta satu untuk bermula!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <Card key={announcement.id} className={`border-2 ${getPriorityColor(announcement.priority)}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Megaphone className="w-5 h-5 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {announcement.title && (
                                  <p className="font-semibold">{announcement.title}</p>
                                )}
                                <span className={`px-2 py-1 text-xs rounded ${getPriorityBadgeColor(announcement.priority)}`}>
                                  {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{announcement.message}</p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(announcement.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(announcement)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user-content">
          <div className="space-y-6">
            {/* Pending Materials Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Bahan Menunggu Kelulusan
                  {pendingMaterials.length > 0 && (
                    <Badge className="bg-orange-500">{pendingMaterials.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Semak dan luluskan bahan pembelajaran yang dihantar oleh pengguna
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Memuatkan kandungan yang belum selesai...</p>
                  </div>
                ) : pendingMaterials.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Tiada bahan tertangguh untuk disemak. Semua selesai!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {pendingMaterials.map((material) => (
                      <Card key={material.id} className="border-2 border-orange-200 bg-orange-50">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{material.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                              </div>
                              <Badge className="bg-orange-500 ml-2">Menunggu</Badge>
                            </div>
                            
                            <div className="flex gap-2 text-sm">
                              <Badge variant="outline">{material.category}</Badge>
                              <Badge variant="outline">{material.difficulty}</Badge>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{material.content}</p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <div className="text-xs text-gray-500">
                                Submitted by: {material.submitted_by_name || 'Unknown'} • {new Date(material.created_at).toLocaleString()}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={async () => {
                                    setSaving(true);
                                    try {
                                      // Update via serverFetch (kv_store)
                                      const response = await serverFetch(`/materials/${material.id.replace('material:', '')}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${session.access_token}`,
                                        },
                                        body: JSON.stringify({
                                          ...material,
                                          approval_status: 'approved'
                                        }),
                                      });
                                      
                                      if (!response.ok) throw new Error('Gagal meluluskan bahan');
                                      
                                      toast.success('Bahan Berjaya diluluskan!');
                                      fetchPendingContent();
                                    } catch (error: any) {
                                      console.error('Error Kelulusan:', error);
                                      toast.error('Gagak meluluskan Bahan');
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  disabled={saving}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Lulus
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    if (!confirm('Adakah anda pasti mahu menolak bahan ini?')) return;
                                    
                                    setSaving(true);
                                    try {
                                      // Update via serverFetch (kv_store)
                                      const response = await serverFetch(`/materials/${material.id.replace('material:', '')}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'Authorization': `Bearer ${session.access_token}`,
                                        },
                                        body: JSON.stringify({
                                          ...material,
                                          approval_status: 'rejected'
                                        }),
                                      });
                                      
                                      if (!response.ok) throw new Error('Gagal menolak Bahan');
                                      
                                      toast.success('Bahan ditolak');
                                      fetchPendingContent();
                                    } catch (error: any) {
                                      console.error('Error menolak:', error);
                                      toast.error('Gagal menolak Bahan');
                                    } finally {
                                      setSaving(false);
                                    }
                                  }}
                                  disabled={saving}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Tolak
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Perubahan kandungan disimpan ke pangkalan data dan disiarkan dalam masa nyata.
            Semua pengguna yang melihat halaman pendaratan atau tentang halaman akan melihat kemas kini serta-merta tanpa perlu memuat semula.
          </p>
        </CardContent>
      </Card>

      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Ubah Pengumuman' : 'Cipta Pengumuman'}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement ? 'Kemas kini butiran pengumuman' : 'Masukkan butiran pengumuman'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tajuk</Label>
              <Input
                id="title"
                name="title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Tajuk Pengumuman"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mesej</Label>
              <Textarea
                id="message"
                name="message"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                placeholder="Taip Pengumuman Anda di sini..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioriti</Label>
              <Select
                value={announcementForm.priority}
                onValueChange={(value) => setAnnouncementForm({ ...announcementForm, priority: value as 'low' | 'medium' | 'high' })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {announcementForm.priority.charAt(0).toUpperCase() + announcementForm.priority.slice(1)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Rendah</SelectItem>
                  <SelectItem value="medium">Sederhana</SelectItem>
                  <SelectItem value="high">Tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAnnouncementDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : editingAnnouncement ? 'Kemaskini' : 'Cipta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}