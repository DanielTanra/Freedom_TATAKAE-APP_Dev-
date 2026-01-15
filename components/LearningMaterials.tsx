import { useState, useEffect } from 'react';
import { serverFetch } from '../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { BookOpen, Search, Filter, Download, ExternalLink, FileText, Video, Link as LinkIcon, BookMarked, CheckCircle, Loader2, X, Presentation } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import { SlideViewer } from './SlideViewer';
import { RewardAnimation } from './RewardAnimation';

interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  difficulty: string;
  createdAt: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
}

interface LearningMaterialsProps {
  session: any;
}

export function LearningMaterials({ session }: LearningMaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  // Download states
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'success'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Slide viewer states
  const [showSlideViewer, setShowSlideViewer] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Translation functions
  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      'fundamentals': 'Asas',
      'design-principles': 'Prinsip Reka Bentuk',
      'usability': 'Kebolehgunaan',
      'prototyping': 'Prototaip',
      'evaluation': 'Penilaian',
      'accessibility': 'Kebolehcapaian',
    };
    return translations[category] || category;
  };

  const translateDifficulty = (difficulty: string): string => {
    const translations: Record<string, string> = {
      'beginner': 'Pemula',
      'intermediate': 'Pertengahan',
      'advanced': 'Lanjutan',
    };
    return translations[difficulty] || difficulty;
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, categoryFilter, difficultyFilter]);

  const fetchMaterials = async () => {
    try {
      const response = await serverFetch('/materials', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // IMPORTANT: Only show approved materials to students
    // Filter out pending and rejected materials
    filtered = filtered.filter(m => 
      m.approval_status === 'approved' || !m.approval_status // Show if approved or no status (legacy)
    );

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(m => m.difficulty === difficultyFilter);
    }

    setFilteredMaterials(filtered);
  };

  // Calculate file size from content
  const calculateFileSize = (content: string): string => {
    const sizeInBytes = new Blob([content]).size;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;
    
    if (sizeInMB >= 1) {
      return `${sizeInMB.toFixed(1)} MB`;
    } else {
      return `${sizeInKB.toFixed(1)} KB`;
    }
  };

  // Convert material content to slides
  const convertToSlides = (material: Material) => {
    // Split content into paragraphs (each paragraph becomes a slide)
    const paragraphs = material.content.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => ({
      id: `slide-${index}`,
      title: index === 0 ? material.title : `${material.title} (${index + 1})`,
      content: paragraph.trim(),
      type: 'text' as const
    }));
  };

  const handleStartSlideView = () => {
    setShowSlideViewer(true);
  };

  const handleSlideComplete = () => {
    setShowReward(true);
    setTimeout(() => {
      setShowReward(false);
      setShowSlideViewer(false);
    }, 3000);
  };

  // Download material as PDF
  const handleDownload = async (material: Material) => {
    setDownloadState('downloading');
    setDownloadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Generate PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Add title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const titleLines = pdf.splitTextToSize(material.title, maxWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 10;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Kategori: ${material.category} | Kesukaran: ${material.difficulty}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Dimuat turun: ${new Date().toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPosition);
      yPosition += 15;

      // Add description
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Deskripsi:', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const descLines = pdf.splitTextToSize(material.description, maxWidth);
      pdf.text(descLines, margin, yPosition);
      yPosition += descLines.length * 6 + 10;

      // Add content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Kandungan:', margin, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const contentLines = pdf.splitTextToSize(material.content, maxWidth);
      
      // Handle page breaks
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(contentLines[i], margin, yPosition);
        yPosition += 6;
      }

      clearInterval(progressInterval);
      setDownloadProgress(100);

      // Save PDF
      const fileName = `${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);

      // Show success state
      setTimeout(() => {
        setDownloadState('success');
        toast.success('Muat turun selesai!');
        
        // Reset after 2 seconds
        setTimeout(() => {
          setDownloadState('idle');
          setDownloadProgress(0);
        }, 2000);
      }, 300);

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Gagal memuat turun bahan');
      setDownloadState('idle');
      setDownloadProgress(0);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Memuatkan bahan pembelajaran...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl text-gray-900 dark:text-white">Belajar HCI</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Terokai bahan dan sumber pembelajaran interaktif</p>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Cari bahan..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="fundamentals">Asas</SelectItem>
            <SelectItem value="design-principles">Prinsip Reka Bentuk</SelectItem>
            <SelectItem value="usability">Kebolehgunaan</SelectItem>
            <SelectItem value="prototyping">Prototaip</SelectItem>
            <SelectItem value="evaluation">Penilaian</SelectItem>
            <SelectItem value="accessibility">Kebolehcapaian</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Semua Tahap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahap</SelectItem>
            <SelectItem value="beginner">Pemula</SelectItem>
            <SelectItem value="intermediate">Pertengahan</SelectItem>
            <SelectItem value="advanced">Lanjutan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tiada bahan dijumpai. Cuba laraskan penapis anda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card
              key={material.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMaterial(material)}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <BookMarked className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-base">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {material.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {translateCategory(material.category)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {translateDifficulty(material.difficulty)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {material.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Material Detail Dialog */}
      <Dialog open={!!selectedMaterial && !showSlideViewer} onOpenChange={() => {
        setSelectedMaterial(null);
        setDownloadState('idle');
        setDownloadProgress(0);
      }}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden p-0 gap-0">
          {selectedMaterial && (
            <div className="flex flex-col h-full max-h-[95vh]">
              {/* Header with Close Button */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                    {selectedMaterial.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedMaterial(null);
                    setDownloadState('idle');
                    setDownloadProgress(0);
                  }}
                  className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-8 w-8 p-0"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedMaterial.description}
                    </p>
                  </div>

                  {/* File Info Card */}
                  <Card className="border-2 border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dokumen PDF</span>
                            <Badge variant="outline" className="text-xs">
                              {translateDifficulty(selectedMaterial.difficulty)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saiz fail: {calculateFileSize(selectedMaterial.content)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Pratonton Kandungan</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {selectedMaterial.content}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="outline" className="bg-white dark:bg-gray-800">
                      {translateCategory(selectedMaterial.category)}
                    </Badge>
                    <span>•</span>
                    <span>Ditambah {new Date(selectedMaterial.createdAt).toLocaleDateString('ms-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Action Buttons Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 space-y-3">
                {/* Start Slide View Button */}
                <Button
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={handleStartSlideView}
                >
                  <Presentation className="h-5 w-5 mr-2" />
                  <span className="font-medium">Mula Pembelajaran Interaktif</span>
                </Button>

                {/* Download Button */}
                <Button
                  variant="outline"
                  className={`w-full h-12 transition-all duration-300 ${
                    downloadState === 'downloading'
                      ? 'bg-indigo-500'
                      : downloadState === 'success'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  onClick={() => handleDownload(selectedMaterial)}
                  disabled={downloadState === 'downloading'}
                >
                  {downloadState === 'downloading' ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">Memuat turun...</span>
                        <span className="text-xs opacity-90">{downloadProgress}% selesai</span>
                      </div>
                    </div>
                  ) : downloadState === 'success' ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Muat Turun Selesai!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      <span className="font-medium">Muat Turun Bahan sebagai PDF</span>
                    </div>
                  )}
                </Button>
                
                {/* Progress Bar */}
                {downloadState === 'downloading' && (
                  <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Slide Viewer */}
      {selectedMaterial && showSlideViewer && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto p-6">
          <SlideViewer
            materialId={selectedMaterial.id}
            title={selectedMaterial.title}
            slides={convertToSlides(selectedMaterial)}
            onComplete={handleSlideComplete}
          />
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSlideViewer(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Tutup Pembelajaran
            </Button>
          </div>
        </div>
      )}

      {/* Reward Animation */}
      <RewardAnimation
        show={showReward}
        type="completion"
        title="Tahniah!"
        message="Anda telah berjaya menyelesaikan pembelajaran ini!"
        onComplete={() => setShowReward(false)}
      />
    </div>
  );
}