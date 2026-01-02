"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Dumbbell, Play, Pause } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  const router = useRouter();

  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const showControls = !isPlaying || isHovered;



  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isDraggingRef = useRef(false);

  const hasInteracted = useRef(false);

  const playVideo = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();

        setIsPlaying(true);

        hasInteracted.current = true;
      } catch (error) {
        console.log("Error al reproducir video:", error);

        setIsPlaying(false);
      }
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();

        setIsPlaying(false);
      } else {
        await playVideo();
      }
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDraggingRef.current) {
      const current = videoRef.current.currentTime;
      if (isFinite(current) && !isNaN(current)) {
        setCurrentTime(current);
      }
    }
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat((e.target as HTMLInputElement).value);
      if (isFinite(newTime) && !isNaN(newTime)) {
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const handleSeekStart = () => {
    setIsDragging(true);
    isDraggingRef.current = true;
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    // Asegurar que el tiempo se actualice después de soltar
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      if (isFinite(current) && !isNaN(current)) {
        setCurrentTime(current);
      }
    }
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time) || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      // Configuración agresiva para iOS
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.setAttribute("muted", "true");
      video.autoplay = true;

      // Agregar listener directo para timeupdate
      const timeUpdateHandler = () => {
        if (!isDraggingRef.current && video) {
          const current = video.currentTime;
          if (isFinite(current) && !isNaN(current)) {
            setCurrentTime(current);
          }
        }
      };

      video.addEventListener("timeupdate", timeUpdateHandler);

      // Intentar reproducir automáticamente cuando el video esté listo
      const tryAutoPlay = async () => {
        try {
          await video.play();
          setIsPlaying(true);
          hasInteracted.current = true;
        } catch (error) {
          // Si falla el autoplay, intentar cuando el usuario interactúe
          const handleUserInteraction = async () => {
            if (!hasInteracted.current && videoRef.current) {
              try {
                await videoRef.current.play();
                setIsPlaying(true);
                hasInteracted.current = true;
              } catch (err) {
                console.log("Error al reproducir video:", err);
              }
            }
          };

          document.addEventListener("click", handleUserInteraction, {
            once: true,
          });

          document.addEventListener("touchstart", handleUserInteraction, {
            once: true,
          });

          document.addEventListener("keydown", handleUserInteraction, {
            once: true,
          });
        }
      };

      if (video.readyState >= 2) {
        // El video ya tiene metadata cargada
        tryAutoPlay();
      } else {
        // Esperar a que el video esté listo
        video.addEventListener("loadeddata", tryAutoPlay, { once: true });
      }

      return () => {
        video.removeEventListener("timeupdate", timeUpdateHandler);
      };
    }
  }, []);

  return (
    <section className="bg-black text-white pt-16 pb-16 md:pb-24" id="inicio">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}

          <div className="space-y-8">
            {/* Chip */}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00b2de]/10 border border-[#00b2de]/20">
              <Dumbbell className="w-4 h-4 text-[#00b2de]" />

              <span className="text-sm font-medium text-[#00b2de]">
                Club Carvajal Fit
              </span>
            </div>

            {/* Heading */}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
              Tu cambio comienza aquí
            </h1>

            {/* Subheading */}

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed text-pretty">
              &quot;Todos los que pertenecen al Club tienen un gran físico y una
              gran mentalidad, sino... acá la obtienen.&quot;
            </p>

            {/* CTA Button */}

            <Button
              className="bg-[#00b2de] hover:bg-[#00b2de]/90 text-white font-semibold text-lg px-8 py-6 rounded-lg"
              size="lg"
              onClick={() => router.push("/signup")}
            >
              Únete al Club
            </Button>
          </div>

          {/* Right Content - Video */}

          <div
            className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-gray-700/50 shadow-2xl group transition-all duration-300 hover:border-[#00b2de]/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              // @ts-ignore
              defaultMuted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              onLoadedMetadata={handleLoadedMetadata}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={handleTimeUpdate}
              style={{ WebkitPlaysinline: 'true' } as React.CSSProperties}
            >
              <source
                src="https://melli.fydeli.com/carvajal-fit/Bienvenida-carvajalfit.mp4"
                type="video/mp4"
              />
              <track kind="captions" label="Español" srcLang="es" />
              Tu navegador no soporta la reproducción de video.
            </video>

            {/* Gradient Overlay - No debe bloquear eventos */}
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? "opacity-100" : "opacity-60"
                }`}
            />


            {/* Video Controls - Only visible on hover */}
            <div
              className={`absolute inset-0 flex flex-col justify-between transition-all duration-300 pointer-events-none z-10 ${showControls ? "opacity-100" : "opacity-0"
                }`}
            >

              {/* Play/Pause Button - Centered */}
              <div className="flex items-center justify-center flex-1">
                <button
                  aria-label={isPlaying ? "Pausar" : "Reproducir"}
                  className="p-4 rounded-full bg-[#00b2de]/80 backdrop-blur-lg hover:bg-[#00b2de] transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95 pointer-events-auto border-2 border-white/20 hover:border-white/40"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="w-full px-5 pb-5 space-y-3 pointer-events-auto">
                {/* Progress Slider */}
                <div className="relative">
                  <input
                    className="w-full h-1.5 bg-gray-700/60 rounded-full appearance-none cursor-pointer slider-thumb hover:h-2 transition-all duration-200"
                    max={duration || 0}
                    min="0"
                    step="0.1"
                    style={{
                      background: `linear-gradient(to right, #00b2de 0%, #00b2de ${duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(75, 85, 99, 0.6) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(75, 85, 99, 0.6) 100%)`,
                    }}
                    type="range"
                    value={currentTime}
                    onChange={handleSeek}
                    onInput={handleSeek}
                    onMouseDown={handleSeekStart}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                    onTouchStart={handleSeekStart}
                  />
                </div>

                {/* Time Display */}
                {/* <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10">
                    <span className="text-white font-medium tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-400 tabular-nums">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

