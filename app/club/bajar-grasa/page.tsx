"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Home, Play, Check } from "lucide-react";

interface Video {
  id: string;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Semana 1 - Introducción",
    duration: "45 min",
    description: "Introducción al programa de quema de grasa. Aprenderás los fundamentos del entrenamiento y cómo estructurar tus sesiones para maximizar la quema de grasa.",
    thumbnail: "/api/placeholder/800/450",
  },
  {
    id: "2",
    title: "Semana 2 - Intensidad Media",
    duration: "50 min",
    description: "Aumenta la intensidad de tus entrenamientos con rutinas de intensidad media diseñadas para acelerar tu metabolismo.",
    thumbnail: "/api/placeholder/800/450",
  },
  {
    id: "3",
    title: "Semana 3 - Alta Intensidad",
    duration: "55 min",
    description: "Entrenamientos de alta intensidad que desafiarán tus límites y maximizarán la quema de grasa.",
    thumbnail: "/api/placeholder/800/450",
  },
  {
    id: "4",
    title: "Semana 4 - Máximo Rendimiento",
    duration: "60 min",
    description: "Lleva tu entrenamiento al siguiente nivel con rutinas de máximo rendimiento para alcanzar tus objetivos.",
    thumbnail: "/api/placeholder/800/450",
  },
];

export default function BajarGrasaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedVideo, setSelectedVideo] = useState<Video>(videos[0]);
  const [isWatched, setIsWatched] = useState(false);

  // Leer el parámetro de la URL y seleccionar el video correspondiente
  useEffect(() => {
    const videoId = searchParams.get('video');
    if (videoId) {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        setSelectedVideo(video);
        setIsWatched(false);
      }
    }
  }, [searchParams]);

  const handleMarkAsWatched = () => {
    setIsWatched(!isWatched);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold truncate">{selectedVideo.title}</h1>
          </div>
          <button
            onClick={() => router.push('/club')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="Ir al club"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 bg-[#00b2de] rounded-full flex items-center justify-center hover:bg-[#00a0c8] transition-colors shadow-2xl">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </button>
              </div>
              {/* Placeholder para la imagen del video */}
              <div className="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-900/50 flex items-center justify-center">
                <div className="text-center space-y-2 opacity-50">
                  <Play className="w-16 h-16 mx-auto text-white/50" />
                  <p className="text-white/50 text-sm">Video thumbnail</p>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              <div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
                  {selectedVideo.title}
                </h2>
                <p className="text-white/60 text-base md:text-lg">{selectedVideo.duration}</p>
              </div>
              <button
                onClick={handleMarkAsWatched}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                  isWatched
                    ? "bg-[#00b2de] text-white"
                    : "bg-white/10 text-[#00b2de] hover:bg-white/20"
                }`}
              >
                <Check className="w-4 h-4 md:w-5 md:h-5" />
                Marcar como visto
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-bold text-white">Descripción</h3>
              <p className="text-white/70 leading-relaxed text-sm md:text-base">{selectedVideo.description}</p>
            </div>
          </div>

          {/* Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-xl p-4 md:p-6 border border-white/10 lg:sticky lg:top-20">
              <h3 className="text-base md:text-lg font-bold text-white mb-4">Videos de esta serie</h3>
              <div className="space-y-2 md:space-y-3 max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      setIsWatched(false);
                      // Actualizar la URL sin recargar la página
                      router.push(`/club/bajar-grasa?video=${video.id}`, { scroll: false });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedVideo.id === video.id
                        ? "bg-[#00b2de]/20 border border-[#00b2de]/50"
                        : "bg-white/5 border border-transparent hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          selectedVideo.id === video.id
                            ? "bg-[#00b2de]"
                            : "bg-white/10 border border-white/20"
                        }`}
                      >
                        <Play
                          className={`w-4 h-4 ${
                            selectedVideo.id === video.id ? "text-white" : "text-white/60"
                          }`}
                          fill={selectedVideo.id === video.id ? "white" : "none"}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium mb-1 ${
                            selectedVideo.id === video.id ? "text-white" : "text-white/80"
                          }`}
                        >
                          {video.title}
                        </p>
                        <p className="text-white/60 text-sm">{video.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

