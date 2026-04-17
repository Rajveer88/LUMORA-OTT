import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MOCK_CONTENT } from '../data/content';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipForward,
  Monitor,
  MessageSquare,
  Activity,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useMobile } from '../hooks/useMobile';
import { getTitleFontClass } from '../utils/typography';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface WatchProps {
  theaterModeOverride?: boolean;
  onToggleTheater?: () => void;
}

export default function Watch({ theaterModeOverride, onToggleTheater }: WatchProps) {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const isMobile = useMobile();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ambient Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const item = MOCK_CONTENT.find(c => c.id === id);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Save Progress Logic
  const saveProgress = async (time: number) => {
    if (!currentUser || !id) return;
    try {
      await setDoc(doc(db, 'users', currentUser.uid, 'history', id), {
        contentId: id,
        progress: Math.floor((time / (videoRef.current?.duration || 1)) * 100),
        lastWatchedAt: new Date().toISOString(),
        timestamp: time
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current) {
        saveProgress(videoRef.current.currentTime);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [id, currentUser]);

  // Periodic Save
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        saveProgress(videoRef.current.currentTime);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isPlaying, id, currentUser]);

  // Audio Visualizer Implementation
  const initAudio = () => {
    if (!videoRef.current || audioCtxRef.current) return;

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      const source = ctx.createMediaElementSource(videoRef.current);
      
      source.connect(analyser);
      analyser.connect(ctx.destination);
      
      analyser.fftSize = 256;
      
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn("Audio Context init failed (User gesture or CORS issue)", e);
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Dynamic gradient based on bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, `${item?.accentColor || '#00F0FF'}33`);
        gradient.addColorStop(1, `${item?.accentColor || '#00F0FF'}00`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    render();
  };

  useEffect(() => {
    if (isAmbientMode && theaterModeOverride) {
      initAudio();
      drawVisualizer();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAmbientMode, theaterModeOverride]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime += time;
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return `${h > 0 ? h + ':' : ''}${m < 10 && h > 0 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  if (!item) return null;

  return (
    <div className={cn(
      "relative bg-black group selection:bg-transparent",
      theaterModeOverride ? "aspect-video w-full" : "h-screen w-full"
    )}>
      {/* Video element with CORS enabled for visualizer */}
      <video
        ref={videoRef}
        src={item.videoUrl}
        className="w-full h-full object-contain pointer-events-none"
        onTimeUpdate={handleTimeUpdate}
        crossOrigin="anonymous"
      />

      {/* Ambient Visualizer Canvas */}
      {isAmbientMode && (
        <canvas 
          ref={canvasRef}
          className="absolute inset-x-0 bottom-0 w-full h-1/4 pointer-events-none opacity-40 mix-blend-screen"
          width={1920}
          height={400}
        />
      )}

      {/* Overlays / UI */}
      <div 
        className={cn(
          "absolute inset-0 z-50 flex flex-col justify-end p-6 md:p-12 transition-opacity duration-500",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={togglePlay}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 -z-10" />

        {/* Center Play/Pause Large indicator (Mobile style) */}
        {isMobile && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                {isPlaying ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current ml-1" />}
             </div>
          </div>
        )}

        {/* Header (Desktop) */}
        {!isMobile && (
          <div className="absolute top-0 inset-x-0 p-12 flex justify-between items-start pointer-events-none">
             <div className="pointer-events-auto">
                <h2 className={cn(
                  "text-3xl font-black text-white leading-none",
                  getTitleFontClass(item.genre)
                )} style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{item.title}</h2>
                <div className="flex gap-4 mt-2">
                   <span className="text-accent-cyan text-[10px] font-black uppercase tracking-[3px]">S1 : E4 "Neural Bloom"</span>
                </div>
             </div>
             <div className="flex gap-4 pointer-events-auto">
                <button className="p-3 bg-white/5 hover:bg-white/20 rounded-2xl transition-all border border-white/5">
                   <MessageSquare className="w-5 h-5 text-white" />
                </button>
                <button className="p-3 bg-white/5 hover:bg-white/20 rounded-2xl transition-all border border-white/5">
                   <Activity className="w-5 h-5 text-white" />
                </button>
             </div>
          </div>
        )}

        {/* Controls Container */}
        <div className="space-y-6 md:space-y-8" onClick={(e) => e.stopPropagation()}>
          {/* Progress Bar Container */}
          <div className="relative group/progress cursor-pointer py-4" onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const p = (e.clientX - rect.left) / rect.width;
             if (videoRef.current) {
               videoRef.current.currentTime = p * videoRef.current.duration;
             }
          }}>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-cyan relative shadow-[0_0_15px_rgba(0,240,255,0.5)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div 
               className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all scale-0 group-hover/progress:scale-100 shadow-xl"
               style={{ left: `${progress}%` }}
            />
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 md:gap-4">
                 <button onClick={() => seek(-10)} className="p-2 text-white/60 hover:text-white transition-colors">
                   <RotateCcw className="w-6 h-6 md:w-7 md:h-7" />
                 </button>
                 <button onClick={togglePlay} className="p-2 text-white hover:scale-110 transition-transform">
                   {isPlaying ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />}
                 </button>
                 <button onClick={() => seek(10)} className="p-2 text-white/60 hover:text-white transition-colors">
                   <RotateCw className="w-6 h-6 md:w-7 md:h-7" />
                 </button>
              </div>

              <div className="hidden md:flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white/60 hover:text-white">
                      {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                    </div>
                 </div>
                 <div className="text-[14px] font-black text-white/60 tabular-nums uppercase tracking-widest">
                   {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 0)}
                 </div>
              </div>
              {isMobile && (
                <div className="text-[12px] font-black text-white/60 tabular-nums">
                   {formatTime(currentTime)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <button 
                onClick={() => setIsAmbientMode(!isAmbientMode)}
                className={cn(
                  "p-3 rounded-2xl transition-all border",
                  isAmbientMode ? "bg-accent-cyan/20 border-accent-cyan text-accent-cyan" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                )}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              
              {!isMobile && (
                <button 
                  onClick={onToggleTheater}
                  className={cn(
                    "p-3 rounded-2xl transition-all border",
                    theaterModeOverride ? "bg-white/20 border-white/20 text-white" : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                  )}
                >
                  <Monitor className="w-5 h-5" />
                </button>
              )}

              <button className="p-3 bg-white/5 border border-white/5 hover:bg-white hover:text-black rounded-2xl transition-all text-white/40 group">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              </button>
              <button className="p-3 bg-white/5 border border-white/5 hover:bg-white hover:text-black rounded-2xl transition-all text-white/40">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
