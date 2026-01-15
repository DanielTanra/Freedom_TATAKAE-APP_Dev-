import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  BookOpen,
  Play,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  type: 'text' | 'image' | 'video' | 'interactive';
}

interface SlideViewerProps {
  materialId: string;
  title: string;
  slides: Slide[];
  onComplete?: () => void;
}

export function SlideViewer({ materialId, title, slides, onComplete }: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [completedSlides, setCompletedSlides] = useState<Set<number>>(new Set());
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Mark first slide as viewed
    markSlideAsCompleted(0);
  }, []);

  const markSlideAsCompleted = (slideIndex: number) => {
    setCompletedSlides(prev => new Set([...prev, slideIndex]));
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      markSlideAsCompleted(nextSlide);
      
      // Check if all slides completed
      if (nextSlide === slides.length - 1) {
        onComplete?.();
      }
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSlideClick = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    markSlideAsCompleted(index);
  };

  const progressPercentage = (completedSlides.size / slides.length) * 100;
  const slide = slides[currentSlide];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-gray-900 dark:text-white">{title}</h2>
          <Badge variant={completedSlides.size === slides.length ? "default" : "secondary"}>
            {completedSlides.size === slides.length ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Selesai
              </>
            ) : (
              `${completedSlides.size}/${slides.length} Slaid`
            )}
          </Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Kemajuan</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Slide Content */}
      <Card className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="relative min-h-[500px] bg-white dark:bg-gray-800">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 p-8"
            >
              <div className="h-full flex flex-col">
                {/* Slide Title */}
                <div className="mb-6">
                  <h3 className="text-3xl text-gray-900 dark:text-white mb-2">
                    {slide.title}
                  </h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Slaid {currentSlide + 1} daripada {slides.length}
                  </div>
                </div>

                {/* Slide Content */}
                <div className="flex-1 overflow-y-auto">
                  {slide.type === 'text' && (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                        {slide.content}
                      </p>
                    </div>
                  )}

                  {slide.type === 'image' && (
                    <div className="space-y-4">
                      {slide.imageUrl && (
                        <div className="rounded-lg overflow-hidden">
                          <img 
                            src={slide.imageUrl} 
                            alt={slide.title}
                            className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-700"
                          />
                        </div>
                      )}
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {slide.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {slide.type === 'video' && (
                    <div className="space-y-4">
                      {slide.videoUrl && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={slide.videoUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {slide.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {slide.type === 'interactive' && (
                    <div className="space-y-4">
                      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {slide.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              variant="outline"
              size="lg"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Sebelum
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              size="lg"
            >
              Seterusnya
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Slide Thumbnails */}
      <div className="grid grid-cols-8 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => handleSlideClick(index)}
            className={`relative aspect-video rounded-lg border-2 transition-all overflow-hidden group ${
              index === currentSlide
                ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500 dark:ring-indigo-400'
                : completedSlides.has(index)
                ? 'border-green-500 dark:border-green-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className={`absolute inset-0 flex items-center justify-center text-xs ${
              index === currentSlide
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-300'
                : completedSlides.has(index)
                ? 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {completedSlides.has(index) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
          </button>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Gunakan kekunci ← → untuk navigasi
      </div>
    </div>
  );
}

// Hook for keyboard navigation
export function useSlideKeyboardNavigation(
  onPrevious: () => void,
  onNext: () => void,
  canGoPrevious: boolean,
  canGoNext: boolean
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && canGoNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext, canGoPrevious, canGoNext]);
}
