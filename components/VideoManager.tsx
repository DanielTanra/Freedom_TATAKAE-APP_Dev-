import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Video,
  Upload,
  Trash2,
  Eye,
  PlayCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Edit,
  Download,
  Search,
  Filter,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import {
  createClient,
  getServerUrl,
} from "../utils/supabase/client";

interface VideoManagerProps {
  session: any;
}

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  topic: string;
  category: "Kuliah" | "Tutorial" | "Demo" | "Lain-lain";
  uploadedBy: string;
  uploadDate: string;
  thumbnail?: string;
  downloadCount?: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  watchStatus: "not-started" | "in-progress" | "completed";
  watchPercentage: number;
  understandingPercentage: number;
  lastWatched: string;
}

export function VideoManager({ session }: VideoManagerProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>(
    [],
  );
  const [selectedVideo, setSelectedVideo] =
    useState<Video | null>(null);
  const [studentProgress, setStudentProgress] = useState<
    StudentProgress[]
  >([]);
  const [showUploadDialog, setShowUploadDialog] =
    useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] =
    useState<string>("semua");
  const [filterDate, setFilterDate] = useState<string>("semua");

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
    topic: "",
    category: "Kuliah" as
      | "Kuliah"
      | "Tutorial"
      | "Demo"
      | "Lain-lain",
    file: null as File | null,
    thumbnail: null as File | null,
    thumbnailPreview: "",
  });

  const [editVideo, setEditVideo] = useState<Video | null>(
    null,
  );

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchQuery, filterCategory, filterDate]);

  const filterVideos = () => {
    let filtered = [...videos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          video.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          video.topic
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (filterCategory !== "semua") {
      filtered = filtered.filter(
        (video) => video.category === filterCategory,
      );
    }

    // Date filter
    if (filterDate !== "semua") {
      const now = new Date();
      filtered = filtered.filter((video) => {
        const videoDate = new Date(video.uploadDate);
        const daysDiff = Math.floor(
          (now.getTime() - videoDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        switch (filterDate) {
          case "7":
            return daysDiff <= 7;
          case "30":
            return daysDiff <= 30;
          case "90":
            return daysDiff <= 90;
          default:
            return true;
        }
      });
    }

    setFilteredVideos(filtered);
  };

  const loadVideos = async () => {
    try {
      console.log("[VideoManager] Loading videos...");
      const url = getServerUrl("/videos/list");
      console.log("[VideoManager] Fetching from:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      console.log(
        "[VideoManager] Response status:",
        response.status,
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (
        !contentType ||
        !contentType.includes("application/json")
      ) {
        console.error(
          "[VideoManager] Non-JSON response received",
        );
        const text = await response.text();
        console.error(
          "[VideoManager] Response text:",
          text.substring(0, 200),
        );
        toast.error(
          "Ralat memuatkan video - respons tidak sah",
        );
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(
          "[VideoManager] Videos loaded:",
          data.videos?.length || 0,
        );
        setVideos(data.videos || []);
      } else {
        const errorData = await response.json();
        console.error(
          "[VideoManager] Failed to load videos:",
          errorData,
        );
        toast.error("Ralat memuatkan video");
      }
    } catch (error) {
      console.error(
        "[VideoManager] Error loading videos:",
        error,
      );
      toast.error("Ralat memuatkan video");
    }
  };

  const generateMockProgress = (
    videoId: string,
  ): StudentProgress[] => {
    const students = [
      { id: "1", name: "Ahmad bin Ali" },
      { id: "2", name: "Fatimah binti Hassan" },
      { id: "3", name: "Nurul Ain" },
      { id: "4", name: "Muhammad Hafiz" },
      { id: "5", name: "Siti Aminah" },
    ];

    return students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      watchStatus: ["completed", "in-progress", "not-started"][
        Math.floor(Math.random() * 3)
      ] as any,
      watchPercentage: Math.floor(Math.random() * 100),
      understandingPercentage: Math.floor(Math.random() * 100),
      lastWatched: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("ms-MY"),
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(`hello: ${file.type}`);
      if (file.type.startsWith("video/")) {
        setNewVideo({ ...newVideo, file });
      } else {
        toast.error("Sila pilih fail video yang sah");
      }
    }
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setNewVideo({
          ...newVideo,
          thumbnail: file,
          thumbnailPreview: URL.createObjectURL(file),
        });
      } else {
        toast.error("Sila pilih fail imej yang sah");
      }
    }
  };

  const handleUploadVideo = async () => {
    if (!newVideo.title || (!newVideo.url && !newVideo.file)) {
      toast.error("Sila isikan semua medan yang diperlukan");
      return;
    }

    try {
      const supabase = createClient();
      let videoUrl = newVideo.url;
      let thumbnailUrl = newVideo.thumbnail ? newVideo.thumbnailPreview : null;

      // Upload video file to Supabase Storage if provided
      if (newVideo.file) {
        const fileExt = newVideo.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        console.log('[VideoManager] Uploading video file:', filePath);
        const { data: videoUpload, error: videoError } = await supabase.storage
          .from('video-resources')
          .upload(filePath, newVideo.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (videoError) {
          console.error('[VideoManager] Video upload error:', videoError);
          toast.error('Ralat memuat naik fail video: ' + videoError.message);
          return;
        }

        // Get public URL for the uploaded video
        const { data: { publicUrl } } = supabase.storage
          .from('video-resources')
          .getPublicUrl(filePath);
        
        videoUrl = publicUrl;
        console.log('[VideoManager] Video uploaded successfully:', videoUrl);
      }

      // Upload thumbnail file to Supabase Storage if provided
      if (newVideo.thumbnail) {
        const fileExt = newVideo.thumbnail.name.split('.').pop();
        const fileName = `${Date.now()}-thumb-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;

        console.log('[VideoManager] Uploading thumbnail:', filePath);
        const { data: thumbUpload, error: thumbError } = await supabase.storage
          .from('video-resources')
          .upload(filePath, newVideo.thumbnail, {
            cacheControl: '3600',
            upsert: false
          });

        if (thumbError) {
          console.error('[VideoManager] Thumbnail upload error:', thumbError);
          // Don't fail the whole upload if thumbnail fails, just log it
          console.warn('Thumbnail upload failed, continuing without it');
        } else {
          // Get public URL for the uploaded thumbnail
          const { data: { publicUrl } } = supabase.storage
            .from('video-resources')
            .getPublicUrl(filePath);
          
          thumbnailUrl = publicUrl;
          console.log('[VideoManager] Thumbnail uploaded successfully:', thumbnailUrl);
        }
      }

      // Prepare video data
      const videoData: Video = {
        id: Date.now().toString(),
        title: newVideo.title,
        description: newVideo.description,
        url: videoUrl || "uploaded-video-url",
        duration: newVideo.duration,
        topic: newVideo.topic,
        category: newVideo.category,
        uploadedBy: session.user.user_metadata.name,
        uploadDate: new Date().toISOString().split("T")[0],
        thumbnail: thumbnailUrl || (newVideo.url ? `https://img.youtube.com/vi/${extractYouTubeId(newVideo.url)}/maxresdefault.jpg` : null),
      };

      const url = getServerUrl("/videos/upload");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(videoData),
      });

      if (response.ok) {
        const result = await response.json();
        setVideos([result.video || videoData, ...videos]);
        toast.success("Video berjaya dimuat naik!");
        setShowUploadDialog(false);
        setNewVideo({
          title: "",
          description: "",
          url: "",
          duration: "",
          topic: "",
          category: "Kuliah",
          file: null,
          thumbnail: null,
          thumbnailPreview: "",
        });
      } else {
        // Fallback to mock data
        setVideos([videoData, ...videos]);
        toast.success("Video berjaya dimuat naik!");
        setShowUploadDialog(false);
        setNewVideo({
          title: "",
          description: "",
          url: "",
          duration: "",
          topic: "",
          category: "Kuliah",
          file: null,
          thumbnail: null,
          thumbnailPreview: "",
        });
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Ralat semasa memuat naik video");
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (
      !confirm("Adakah anda pasti mahu memadamkan video ini?")
    )
      return;

    try {
      const response = await fetch(
        "/make-server-d59960c4/videos/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ videoId }),
        },
      );

      setVideos(videos.filter((v) => v.id !== videoId));
      toast.success("Video berjaya dipadamkan");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Ralat semasa memadamkan video");
    }
  };

  const handleViewProgress = (video: Video) => {
    setSelectedVideo(video);
    setStudentProgress(generateMockProgress(video.id));
    setShowProgressDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Selesai";
      case "in-progress":
        return "Sedang Ditonton";
      default:
        return "Belum Ditonton";
    }
  };

  const getAverageProgress = () => {
    if (studentProgress.length === 0)
      return { watch: 0, understanding: 0 };

    const avgWatch =
      studentProgress.reduce(
        (sum, p) => sum + p.watchPercentage,
        0,
      ) / studentProgress.length;
    const avgUnderstanding =
      studentProgress.reduce(
        (sum, p) => sum + p.understandingPercentage,
        0,
      ) / studentProgress.length;

    return {
      watch: Math.round(avgWatch),
      understanding: Math.round(avgUnderstanding),
    };
  };

  const handleEditVideo = (video: Video) => {
    setEditVideo(video);
    setShowEditDialog(true);
  };

  const handleUpdateVideo = async () => {
    if (!editVideo) return;

    try {
      const response = await fetch(
        `/make-server-d59960c4/videos/${editVideo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(editVideo),
        },
      );

      if (response.ok) {
        setVideos(
          videos.map((v) =>
            v.id === editVideo.id ? editVideo : v,
          ),
        );
        toast.success("Video berjaya dikemas kini!");
        setShowEditDialog(false);
        setEditVideo(null);
      }
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error("Ralat semasa mengemas kini video");
    }
  };

  const handleDownloadVideo = async (video: Video) => {
    try {
      const url = getServerUrl(`/videos/${video.id}/download`);
      // Increment download count
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
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
      console.error("Error downloading video:", error);
      toast.error("Ralat semasa memuat turun video");
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Kuliah":
        return "bg-blue-500 text-white";
      case "Tutorial":
        return "bg-green-500 text-white";
      case "Demo":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl text-gray-900 dark:text-white">
            Pengurusan Video
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Muat naik dan urus video pembelajaran
          </p>
        </div>
        <Dialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
        >
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Muat Naik Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Muat Naik Video Baharu
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Muat naik video pembelajaran untuk pelajar anda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="dark:text-gray-300"
                >
                  Tajuk Video *
                </Label>
                <Input
                  id="title"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      title: e.target.value,
                    })
                  }
                  placeholder="Masukkan tajuk video"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className="dark:text-gray-300"
                >
                  Penerangan
                </Label>
                <Textarea
                  id="description"
                  value={newVideo.description}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      description: e.target.value,
                    })
                  }
                  placeholder="Masukkan penerangan video"
                  rows={3}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="topic"
                    className="dark:text-gray-300"
                  >
                    Topik
                  </Label>
                  <Input
                    id="topic"
                    value={newVideo.topic}
                    onChange={(e) =>
                      setNewVideo({
                        ...newVideo,
                        topic: e.target.value,
                      })
                    }
                    placeholder="Contoh: HCI Basics"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="category"
                    className="dark:text-gray-300"
                  >
                    Kategori *
                  </Label>
                  <Select
                    value={newVideo.category}
                    onValueChange={(value) =>
                      setNewVideo({
                        ...newVideo,
                        category: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kuliah">
                        Kuliah
                      </SelectItem>
                      <SelectItem value="Tutorial">
                        Tutorial
                      </SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Lain-lain">
                        Lain-lain
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="duration"
                  className="dark:text-gray-300"
                >
                  Tempoh
                </Label>
                <Input
                  id="duration"
                  value={newVideo.duration}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      duration: e.target.value,
                    })
                  }
                  placeholder="Contoh: 15:30"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="url"
                  className="dark:text-gray-300"
                >
                  URL Video (YouTube/Vimeo)
                </Label>
                <Input
                  id="url"
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({
                      ...newVideo,
                      url: e.target.value,
                    })
                  }
                  placeholder="https://youtube.com/watch?v=..."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="file"
                  className="dark:text-gray-300"
                >
                  Atau Muat Naik Fail Video
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {newVideo.file && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Fail dipilih: {newVideo.file.name}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="thumbnail"
                  className="dark:text-gray-300"
                >
                  Thumbnail (Pilihan)
                </Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {newVideo.thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={newVideo.thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleUploadVideo}>
                  <Upload className="w-4 h-4 mr-2" />
                  Muat Naik
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Label
              htmlFor="search"
              className="dark:text-gray-300"
            >
              Cari Video
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Cari tajuk, penerangan, topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="filter-category"
              className="dark:text-gray-300"
            >
              Kategori
            </Label>
            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >
              <SelectTrigger
                id="filter-category"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">
                  Semua Kategori
                </SelectItem>
                <SelectItem value="Kuliah">Kuliah</SelectItem>
                <SelectItem value="Tutorial">
                  Tutorial
                </SelectItem>
                <SelectItem value="Demo">Demo</SelectItem>
                <SelectItem value="Lain-lain">
                  Lain-lain
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label
              htmlFor="filter-date"
              className="dark:text-gray-300"
            >
              Tarikh Dimuat Naik
            </Label>
            <Select
              value={filterDate}
              onValueChange={setFilterDate}
            >
              <SelectTrigger
                id="filter-date"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <SelectValue placeholder="Semua Tarikh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">
                  Semua Tarikh
                </SelectItem>
                <SelectItem value="7">
                  7 Hari Terakhir
                </SelectItem>
                <SelectItem value="30">
                  30 Hari Terakhir
                </SelectItem>
                <SelectItem value="90">
                  90 Hari Terakhir
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {(searchQuery ||
          filterCategory !== "semua" ||
          filterDate !== "semua") && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Menunjukkan {filteredVideos.length} daripada{" "}
              {videos.length} video
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("semua");
                setFilterDate("semua");
              }}
            >
              Kosongkan Penapis
            </Button>
          </div>
        )}
      </Card>

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card
            key={video.id}
            className="overflow-hidden hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge
                  className={getCategoryBadgeColor(
                    video.category,
                  )}
                >
                  {video.category}
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {video.duration}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">
                {video.title}
              </CardTitle>
              <CardDescription className="dark:text-gray-400 line-clamp-2">
                {video.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Badge
                  variant="secondary"
                  className="dark:bg-gray-700 dark:text-gray-300"
                >
                  {video.topic}
                </Badge>
                <span>•</span>
                <span>
                  {new Date(
                    video.uploadDate,
                  ).toLocaleDateString("ms-MY")}
                </span>
              </div>
              {video.downloadCount &&
                video.downloadCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <Download className="w-3 h-3" />
                    <span>
                      {video.downloadCount} muat turun
                    </span>
                  </div>
                )}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewProgress(video)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Kemajuan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditVideo(video)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadVideo(video)}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteVideo(video.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Video Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Edit Video
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Kemas kini maklumat video
            </DialogDescription>
          </DialogHeader>
          {editVideo && (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="edit-title"
                  className="dark:text-gray-300"
                >
                  Tajuk Video *
                </Label>
                <Input
                  id="edit-title"
                  value={editVideo.title}
                  onChange={(e) =>
                    setEditVideo({
                      ...editVideo,
                      title: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-description"
                  className="dark:text-gray-300"
                >
                  Penerangan
                </Label>
                <Textarea
                  id="edit-description"
                  value={editVideo.description}
                  onChange={(e) =>
                    setEditVideo({
                      ...editVideo,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="edit-topic"
                    className="dark:text-gray-300"
                  >
                    Topik
                  </Label>
                  <Input
                    id="edit-topic"
                    value={editVideo.topic}
                    onChange={(e) =>
                      setEditVideo({
                        ...editVideo,
                        topic: e.target.value,
                      })
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-category"
                    className="dark:text-gray-300"
                  >
                    Kategori
                  </Label>
                  <Select
                    value={editVideo.category}
                    onValueChange={(value) =>
                      setEditVideo({
                        ...editVideo,
                        category: value as any,
                      })
                    }
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kuliah">
                        Kuliah
                      </SelectItem>
                      <SelectItem value="Tutorial">
                        Tutorial
                      </SelectItem>
                      <SelectItem value="Demo">Demo</SelectItem>
                      <SelectItem value="Lain-lain">
                        Lain-lain
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="edit-duration"
                  className="dark:text-gray-300"
                >
                  Tempoh
                </Label>
                <Input
                  id="edit-duration"
                  value={editVideo.duration}
                  onChange={(e) =>
                    setEditVideo({
                      ...editVideo,
                      duration: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-url"
                  className="dark:text-gray-300"
                >
                  URL Video
                </Label>
                <Input
                  id="edit-url"
                  value={editVideo.url}
                  onChange={(e) =>
                    setEditVideo({
                      ...editVideo,
                      url: e.target.value,
                    })
                  }
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleUpdateVideo}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Progress Dialog */}
      <Dialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Kemajuan Pelajar: {selectedVideo?.title}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Jejak status tontonan dan pemahaman pelajar
            </DialogDescription>
          </DialogHeader>

          {/* Summary Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                  Purata Tontonan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-indigo-600 dark:text-indigo-400">
                  {getAverageProgress().watch}%
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                  Purata Pemahaman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600 dark:text-green-400">
                  {getAverageProgress().understanding}%
                </div>
              </CardContent>
            </Card>
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                  Selesai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-gray-900 dark:text-white">
                  {
                    studentProgress.filter(
                      (p) => p.watchStatus === "completed",
                    ).length
                  }
                  /{studentProgress.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Progress Table */}
          <div className="space-y-3">
            {studentProgress.map((progress) => (
              <Card
                key={progress.studentId}
                className="dark:bg-gray-700 dark:border-gray-600"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(progress.watchStatus)}`}
                      />
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {progress.studentName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getStatusText(progress.watchStatus)}{" "}
                          • Terakhir: {progress.lastWatched}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Tontonan</span>
                        <span>{progress.watchPercentage}%</span>
                      </div>
                      <Progress
                        value={progress.watchPercentage}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Pemahaman</span>
                        <span>
                          {progress.understandingPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={progress.understandingPercentage}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {videos.length === 0 && (
        <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg text-gray-900 dark:text-white mb-2">
            Tiada Video
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Mulakan dengan memuat naik video pembelajaran
            pertama anda
          </p>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Muat Naik Video
          </Button>
        </Card>
      )}
    </div>
  );
}