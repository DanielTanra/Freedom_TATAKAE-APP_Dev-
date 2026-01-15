import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  ClipboardList, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  BarChart,
  Bot,
  FileCheck,
  FolderKanban,
  BarChart3,
  HelpCircle,
  FileQuestion,
  Video
} from 'lucide-react';
import { MaterialsManager } from './MaterialsManager';
import { AssessmentManager } from './AssessmentManager';
import { ProgressTracker } from './ProgressTracker';
import { Forum } from './Forum';
import { ProfileEditor } from './ProfileEditor';
import { ContentEditor } from './ContentEditor';
import { AIChat } from './AIChat';
import { AssessmentResults } from './AssessmentResults';
import { AnnouncementBar } from './AnnouncementBar';
import { ClassAssignment } from './ClassAssignment';
import { ClassComparison } from './ClassComparison';
import { HelpPage } from './HelpPage';
import { FAQPage } from './FAQPage';
import { ThemeToggle } from './ThemeToggle';
import { VideoManager } from './VideoManager';

interface TeacherDashboardProps {
  user: any;
  session: any;
  onLogout: () => void;
}

export function TeacherDashboard({ user, session, onLogout }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('materials');
  const [showComparison, setShowComparison] = useState(false);

  const handleNavigateToComparison = () => {
    setShowComparison(true);
    setActiveTab('comparison');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Hide comparison tab when navigating away from it
    if (value !== 'comparison') {
      setShowComparison(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-indigo-900 dark:text-indigo-300">FreeLearning</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Portal Guru</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle showLabels={true} />
              <div className="text-right">
                <p className="text-sm text-gray-900 dark:text-gray-100">{user.user_metadata.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Announcement Bar */}
      <AnnouncementBar session={session} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className={showComparison ? "grid w-full grid-cols-13 mb-6" : "grid w-full grid-cols-12 mb-6"}>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bahan
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Pentaksiran
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Keputusan
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Kemajuan
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Kelas
            </TabsTrigger>
            {showComparison && (
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Perbandingan
              </TabsTrigger>
            )}
            <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Tutor AI
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Kandungan
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Bantuan
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4" />
              Soalan Lazim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-0">
            <MaterialsManager session={session} />
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            <VideoManager session={session} />
          </TabsContent>

          <TabsContent value="assessments" className="mt-0">
            <AssessmentManager session={session} />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <AssessmentResults session={session} />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ProgressTracker session={session} userRole="teacher" />
          </TabsContent>

          <TabsContent value="classes" className="mt-0">
            <ClassAssignment 
              session={session} 
              onNavigateToComparison={handleNavigateToComparison}
            />
          </TabsContent>

          <TabsContent value="comparison" className="mt-0">
            <ClassComparison session={session} onNavigateBack={() => setActiveTab('classes')} />
          </TabsContent>

          <TabsContent value="ai-tutor" className="mt-0">
            <AIChat session={session} />
          </TabsContent>

          <TabsContent value="forum" className="mt-0">
            <Forum session={session} user={user} />
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <ContentEditor session={session} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileEditor user={user} session={session} />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <HelpPage userRole="teacher" />
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <FAQPage userRole="teacher" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}