import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Video, 
  PlayCircle, 
  PauseCircle,
  CheckCircle, 
  ThumbsUp,
  ThumbsDown,
  Clock,
  Award,
  Download,
  Search,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { createClient, getServerUrl } from '../utils/supabase/client';

interface VideoPlayerProps {
  session: any;
}

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  topic: string;
  category: 'Kuliah' | 'Tutorial' | 'Demo' | 'Lain-lain';
  uploadedBy: string;
  uploadDate: string;
  thumbnail?: string;
  downloadCount?: number;
}

interface WatchProgress {
  videoId: string;
  watchPercentage: number;
  understandingPercentage: number;
  completed: boolean;
  lastWatched: string;
}

export function VideoPlayer({ session }: VideoPlayerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgress>>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [understandingRating, setUnderstandingRating] = useState(50);
  const [showUnderstandingPrompt, setShowUnderstandingPrompt] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('semua');
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    loadVideos();
    loadWatchProgress();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, filterCategory]);

  const filterVideos = () => {
    let filtered = [...videos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'semua') {
      filtered = filtered.filter(video => video.category === filterCategory);
    }

    setFilteredVideos(filtered);
  };

  const loadVideos = async () => {
    try {
      console.log('Loading videos...');
      const url = getServerUrl('/videos/list');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({})
      });

      console.log('Video list response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Videos loaded:', data.videos?.length || 0);
        setVideos(data.videos || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load videos:', errorData);
        toast.error('Ralat memuatkan video');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Ralat memuatkan video');
    }
  };

  const loadWatchProgress = async () => {
    try {
      const url = getServerUrl('/videos/progress');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ studentId: session.user.id })
      });

      if (response.ok) {
        const data = await response.json();
        setWatchProgress(data.progress || {});
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveWatchProgress = async (videoId: string, percentage: number) => {
    const progress: WatchProgress = {
      videoId,
      watchPercentage: percentage,
      understandingPercentage: watchProgress[videoId]?.understandingPercentage || 0,
      completed: percentage >= 95,
      lastWatched: new Date().toISOString()
    };

    try {
      const url = getServerUrl('/videos/save-progress');
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          studentId: session.user.id,
          progress
        })
      });

      setWatchProgress(prev => ({
        ...prev,
        [videoId]: progress
      }));

      if (progress.completed && !watchProgress[videoId]?.completed) {
        setShowReward(true);
        setTimeout(() => setShowReward(false), 3000);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const saveUnderstandingRating = async () => {
    if (!selectedVideo) return;

    const progress: WatchProgress = {
      videoId: selectedVideo.id,
      watchPercentage: watchProgress[selectedVideo.id]?.watchPercentage || 100,
      understandingPercentage: understandingRating,
      completed: true,
      lastWatched: new Date().toISOString()
    };

    try {
      const url = getServerUrl('/videos/save-progress');
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          studentId: session.user.id,
          progress
        })
      });

      setWatchProgress(prev => ({
        ...prev,
        [selectedVideo.id]: progress
      }));

      setShowUnderstandingPrompt(false);
      toast.success('Terima kasih atas maklum balas anda!');
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    } catch (error) {
      console.error('Error saving understanding:', error);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const getProgressPercentage = (videoId: string) => {
    return watchProgress[videoId]?.watchPercentage || 0;
  };

  const isVideoCompleted = (videoId: string) => {
    return watchProgress[videoId]?.completed || false;
  };

  const getCompletedCount = () => {
    return Object.values(watchProgress).filter(p => p.completed).length;
  };

  const handleDownloadVideo = async (video: Video) => {
    try {
      const url = getServerUrl(`/videos/${video.id}/download`);
      // Increment download count
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      // For uploaded files, download from storage; for YouTube URLs, open in new tab
      if (video.url.includes('supabase.co/storage')) {
        // It's a Supabase storage URL - trigger download
        const link = document.createElement('a');
        link.href = video.url;
        link.download = `${video.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Memuat turun video...');
      } else {
        // It's an external URL (YouTube, etc.) - open in new tab
        window.open(video.url, '_blank');
        toast.info('Membuka video dalam tab baharu...');
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('Ralat semasa memuat turun video');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Kuliah':
        return 'bg-blue-500 text-white';
      case 'Tutorial':
        return 'bg-green-500 text-white';
      case 'Demo':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRelatedVideos = () => {
    if (!selectedVideo) return [];
    
    // Get videos with same topic or category, excluding current video
    return videos
      .filter(v => 
        v.id !== selectedVideo.id && 
        (v.topic === selectedVideo.topic || v.category === selectedVideo.category)
      )
      .slice(0, 3);
  };

  // Helper function to check if URL is a YouTube video
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to extract YouTube video ID and convert to embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Helper function to check if URL is from Supabase Storage
  const isStorageUrl = (url: string): boolean => {
    return url.includes('supabase.co/storage');
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white">Video Pembelajaran</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tonton video dan jejaki kemajuan anda
          </p>
        </div>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Video Diselesaikan</p>
              <p className="text-2xl text-gray-900 dark:text-white">{getCompletedCount()}/{videos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Player with Related Materials Sidebar */}
      {selectedVideo && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
              <div className="relative aspect-video bg-black">
                {isStorageUrl(selectedVideo.url) ? (
                  // HTML5 video player for uploaded files
                  <video
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    <source src={selectedVideo.url} type="video/webm" />
                    <source src={selectedVideo.url} type="video/ogg" />
                    Pelayar anda tidak menyokong pemain video.
                  </video>
                ) : (
                  // iframe for YouTube and other embed videos
                  <iframe
                    ref={videoRef}
                    src={isYouTubeUrl(selectedVideo.url) ? getYouTubeEmbedUrl(selectedVideo.url) : selectedVideo.url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {isVideoCompleted(selectedVideo.id) && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Selesai
                    </Badge>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryBadgeColor(selectedVideo.category)}>
                    {selectedVideo.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="dark:text-white">{selectedVideo.title}</CardTitle>
                    <CardDescription className="dark:text-gray-400">{selectedVideo.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadVideo(selectedVideo)}
                    className="ml-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Muat Turun
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                  <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                    {selectedVideo.topic}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedVideo.duration}
                  </span>
                  <span>Oleh {selectedVideo.uploadedBy}</span>
                  <span>•</span>
                  <span>{new Date(selectedVideo.uploadDate).toLocaleDateString('ms-MY')}</span>
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Kemajuan Tontonan</span>
                    <span>{Math.round(getProgressPercentage(selectedVideo.id))}%</span>
                  </div>
                  <Progress value={getProgressPercentage(selectedVideo.id)} className="h-2" />
                </div>

                {/* Mark as Watched Button */}
                {!isVideoCompleted(selectedVideo.id) && (
                  <Button
                    onClick={() => {
                      saveWatchProgress(selectedVideo.id, 100);
                      setShowUnderstandingPrompt(true);
                    }}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Tanda Sebagai Sudah Ditonton
                  </Button>
                )}

                {/* Understanding Rating (if completed) */}
                {watchProgress[selectedVideo.id]?.understandingPercentage > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tahap Pemahaman Anda</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUnderstandingRating(watchProgress[selectedVideo.id].understandingPercentage);
                          setShowUnderstandingPrompt(true);
                        }}
                      >
                        Kemas Kini
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress 
                        value={watchProgress[selectedVideo.id].understandingPercentage} 
                        className="h-2 flex-1"
                      />
                      <span className="text-lg text-gray-900 dark:text-white">
                        {watchProgress[selectedVideo.id].understandingPercentage}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Related Materials Sidebar */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Bahan Berkaitan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getRelatedVideos().length > 0 ? (
                  getRelatedVideos().map((video) => (
                    <Card
                      key={video.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:bg-gray-750 dark:border-gray-600"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="flex gap-3 p-3">
                        <div className="relative w-24 h-16 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          {isVideoCompleted(video.id) && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white line-clamp-2">{video.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs dark:border-gray-600">
                              {video.category}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-500">{video.duration}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">Tiada bahan berkaitan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Rating Prompt */}
      <AnimatePresence>
        {showUnderstandingPrompt && selectedVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-indigo-500 dark:bg-gray-800 dark:border-indigo-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <ThumbsUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Bagaimana pemahaman anda?
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Berikan penilaian tahap pemahaman anda terhadap video ini (0-100%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tahap Pemahaman</span>
                    <span className="text-lg text-indigo-600 dark:text-indigo-400">{understandingRating}%</span>
                  </div>
                  <Slider
                    value={[understandingRating]}
                    onValueChange={(value) => setUnderstandingRating(value[0])}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Tidak Faham</span>
                    <span>Faham Sepenuhnya</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowUnderstandingPrompt(false)}
                    className="flex-1"
                  >
                    Nanti
                  </Button>
                  <Button
                    onClick={saveUnderstandingRating}
                    className="flex-1"
                  >
                    Hantar Penilaian
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360, 720]
              }}
              transition={{ duration: 2 }}
              className="bg-yellow-400 rounded-full p-8 shadow-2xl"
            >
              <Award className="w-24 h-24 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video List */}
      <div>
        <h3 className="text-lg text-gray-900 dark:text-white mb-4">Semua Video</h3>
        <div className="flex items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Cari video..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua Kategori</SelectItem>
              <SelectItem value="Kuliah">Kuliah</SelectItem>
              <SelectItem value="Tutorial">Tutorial</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
              <SelectItem value="Lain-lain">Lain-lain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              className={`cursor-pointer hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 ${
                selectedVideo?.id === video.id ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''
              }`}
              onClick={() => handleVideoSelect(video)}
            >
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {isVideoCompleted(video.id) ? (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {video.duration}
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base dark:text-white">{video.title}</CardTitle>
                <CardDescription className="text-sm line-clamp-2 dark:text-gray-400">
                  {video.description}
                </CardDescription>
              </CardHeader>
              {getProgressPercentage(video.id) > 0 && (
                <CardContent className="p-4 pt-0">
                  <Progress value={getProgressPercentage(video.id)} className="h-1" />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {videos.length === 0 && (
        <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 dark:text-white mb-2">Tiada Video Tersedia</h3>
          <p className="text-gray-600 dark:text-gray-400">Guru anda belum memuat naik sebarang video pembelajaran</p>
        </Card>
      )}
    </div>
  );
}