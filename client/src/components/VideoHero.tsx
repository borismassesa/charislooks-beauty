import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface VideoHeroProps {
  videoUrl: string;
  posterImage: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
}

export default function VideoHero({
  videoUrl,
  posterImage,
  title,
  subtitle,
  ctaText,
  ctaLink,
  onCtaClick
}: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={posterImage}
          loop
          muted={isMuted}
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          data-testid="hero-video"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Video Controls */}
      {isVideoLoaded && (
        <div className="absolute bottom-6 right-6 flex gap-2 z-20">
          <Button
            size="icon"
            variant="outline"
            className="bg-black/50 border-white/20 hover:bg-black/70 backdrop-blur-sm"
            onClick={togglePlay}
            data-testid="button-toggle-play"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="bg-black/50 border-white/20 hover:bg-black/70 backdrop-blur-sm"
            onClick={toggleMute}
            data-testid="button-toggle-mute"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-white" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            {title}
          </h1>
          
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            {subtitle}
          </p>

          {ctaText && (
            <div className="flex justify-center">
              {ctaLink ? (
                <a href={ctaLink}>
                  <Button 
                    size="lg" 
                    className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                    data-testid="button-hero-cta"
                  >
                    {ctaText}
                  </Button>
                </a>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                  onClick={onCtaClick}
                  data-testid="button-hero-cta"
                >
                  {ctaText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
