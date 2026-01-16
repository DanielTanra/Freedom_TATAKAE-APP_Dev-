import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  ClipboardCheck, 
  MessageSquare, 
  User,
  LogOut,
  TrendingUp,
  Bot,
  Award,
  HelpCircle,
  FileQuestion,
  Video
} from 'lucide-react';
import { LearningMaterials } from './LearningMaterials';
import { TakeAssessment } from './TakeAssessment';
import { ProgressTracker } from './ProgressTracker';
import { Forum } from './Forum';
import { ProfileEditor } from './ProfileEditor';
import { AIChat } from './AIChat';
import { MyResults } from './MyResults';
import { AnnouncementBar } from './AnnouncementBar';
import { ReviewAssessments } from './ReviewAssessments';
import { HelpPage } from './HelpPage';
import { FAQPage } from './FAQPage';
import { ThemeToggle } from './ThemeToggle';
import { VideoPlayer } from './VideoPlayer';

interface StudentDashboardProps {
  user: any;
  session: any;
  onLogout: () => void;
}

export function StudentDashboard({ user, session, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('learn');

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Portal Pelajar</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10 mb-6">
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Belajar
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Amalan
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Keputusan Saya
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Kemajuan Saya
            </TabsTrigger>
            <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Tutor AI
            </TabsTrigger>
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Forum
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
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

          <TabsContent value="learn" className="mt-0">
            <LearningMaterials session={session} />
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            <VideoPlayer session={session} />
          </TabsContent>

          <TabsContent value="practice" className="mt-0">
            <TakeAssessment session={session} userId={user.id} />
          </TabsContent>

          <TabsContent value="results" className="mt-0">
            <ReviewAssessments session={session} userId={user.id} />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ProgressTracker session={session} userId={user.id} userRole="student" />
          </TabsContent>

          <TabsContent value="ai-tutor" className="mt-0">
            <AIChat session={session} />
          </TabsContent>

          <TabsContent value="forum" className="mt-0">
            <Forum session={session} user={user} />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileEditor user={user} session={session} />
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <HelpPage userRole="student" />
          </TabsContent>

          <TabsContent value="faq" className="mt-0">
            <FAQPage userRole="student" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}