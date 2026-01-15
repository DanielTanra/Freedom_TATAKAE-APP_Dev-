import { motion, AnimatePresence } from 'motion/react';
import { Award, Star, Trophy, Zap, CheckCircle, Sparkles, Medal, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RewardAnimationProps {
  show: boolean;
  type: 'completion' | 'achievement' | 'milestone' | 'perfect' | 'streak';
  title?: string;
  message?: string;
  onComplete?: () => void;
}

export function RewardAnimation({ 
  show, 
  type, 
  title, 
  message, 
  onComplete 
}: RewardAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti
      const confettiArray = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'][Math.floor(Math.random() * 5)]
      }));
      setConfetti(confettiArray);

      // Auto hide after animation
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  const getRewardIcon = () => {
    switch (type) {
      case 'completion':
        return CheckCircle;
      case 'achievement':
        return Award;
      case 'milestone':
        return Trophy;
      case 'perfect':
        return Crown;
      case 'streak':
        return Zap;
      default:
        return Award;
    }
  };

  const getRewardColor = () => {
    switch (type) {
      case 'completion':
        return 'from-green-400 to-green-600';
      case 'achievement':
        return 'from-yellow-400 to-yellow-600';
      case 'milestone':
        return 'from-purple-400 to-purple-600';
      case 'perfect':
        return 'from-yellow-300 to-yellow-500';
      case 'streak':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'completion':
        return 'Selesai!';
      case 'achievement':
        return 'Pencapaian Dibuka!';
      case 'milestone':
        return 'Milestone Dicapai!';
      case 'perfect':
        return 'Sempurna!';
      case 'streak':
        return 'Streak Diteruskan!';
      default:
        return 'Tahniah!';
    }
  };

  const RewardIcon = getRewardIcon();

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            {/* Confetti */}
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ y: -100, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
                animate={{
                  y: '100vh',
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeIn'
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: piece.color }}
              />
            ))}

            {/* Main Reward Card */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
              }}
              className="relative"
            >
              {/* Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className={`absolute inset-0 bg-gradient-to-br ${getRewardColor()} blur-3xl rounded-full`}
              />

              {/* Card Content */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl max-w-md">
                {/* Sparkles around the icon */}
                <div className="absolute -top-4 -right-4">
                  <motion.div
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                </div>
                <div className="absolute -bottom-4 -left-4">
                  <motion.div
                    animate={{
                      rotate: -360
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                </div>

                {/* Main Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                  transition={{
                    scale: { delay: 0.2, type: 'spring', stiffness: 200 },
                    rotate: { delay: 0.5, duration: 0.5 }
                  }}
                  className={`mx-auto w-32 h-32 bg-gradient-to-br ${getRewardColor()} rounded-full flex items-center justify-center mb-6 shadow-lg`}
                >
                  <RewardIcon className="w-16 h-16 text-white" strokeWidth={2.5} />
                </motion.div>

                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-3"
                >
                  <h2 className="text-4xl text-gray-900 dark:text-white mb-2">
                    {title || getDefaultTitle()}
                  </h2>
                  {message && (
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      {message}
                    </p>
                  )}
                </motion.div>

                {/* Stars */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center gap-2 mt-6"
                >
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.7 + i * 0.1,
                        type: 'spring',
                        stiffness: 200
                      }}
                    >
                      <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple badge reward for inline notifications
interface BadgeRewardProps {
  show: boolean;
  text: string;
  icon?: React.ReactNode;
}

export function BadgeReward({ show, text, icon }: BadgeRewardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: -50 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
          >
            {icon || <Award className="w-5 h-5" />}
            <span className="font-semibold">{text}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress celebration for milestones
interface ProgressCelebrationProps {
  show: boolean;
  current: number;
  total: number;
  onComplete?: () => void;
}

export function ProgressCelebration({ show, current, total, onComplete }: ProgressCelebrationProps) {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  const percentage = Math.round((current / total) * 100);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl max-w-md"
          >
            <div className="text-center space-y-6">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    className="text-green-500"
                    initial={{ strokeDasharray: '0 552' }}
                    animate={{ strokeDasharray: `${(percentage / 100) * 552} 552` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl text-gray-900 dark:text-white"
                  >
                    {percentage}%
                  </motion.span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selesai</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl text-gray-900 dark:text-white mb-2">Kemajuan Hebat!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {current} daripada {total} selesai
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
