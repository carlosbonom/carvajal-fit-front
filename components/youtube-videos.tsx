"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  thumbnail?: string;
  description?: string;
}

export const YouTubeVideos = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/youtube");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error al cargar videos" }));
          throw new Error(errorData.error || "Error al cargar videos");
        }

        const data = await response.json();
        
        // Verificar si la respuesta es un array de videos o un error
        if (Array.isArray(data)) {
          setVideos(data);
          setError(null);
        } else if (data.error) {
          setError(data.error);
          setVideos([]);
        } else {
          setVideos([]);
          setError("No se pudieron cargar los videos");
        }
      } catch (err) {
        console.error("Error fetching YouTube videos:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Manejar tecla ESC para cerrar el modal y pausar/reanudar video del hero
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedVideo) {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
      
      // Pausar el video del hero section si está reproduciéndose
      // Buscar el video en la sección del hero
      const heroSection = document.querySelector('section#inicio');
      const heroVideo = heroSection?.querySelector('video') as HTMLVideoElement;
      if (heroVideo && !heroVideo.paused) {
        heroVideo.pause();
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [selectedVideo]);


  if (loading) {
    return (
      <div className="text-white items-center justify-center pt-16 pb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
          Últimos Videos
        </h2>
        {/* <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
          Contenido exclusivo de YouTube
        </p> */}
        <div className="flex justify-center items-center mt-12">
          <div className="text-gray-400">Cargando videos...</div>
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div className="text-white items-center justify-center pt-16 pb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
          Últimos Videos
        </h2>
        {/* <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
          Contenido exclusivo de YouTube
        </p> */}
        <div className="flex justify-center items-center mt-12">
          <div className="text-gray-400">
            {error || "No hay videos disponibles"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white items-center justify-center pt-16 pb-16">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
        Últimos Videos
      </h2>
      {/* <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
        Contenido exclusivo de YouTube
      </p> */}

      {/* Carrusel en mobile, grid en desktop */}
      <div className="mt-12">
        {/* Carrusel horizontal para mobile */}
        <section
          className="flex gap-6 overflow-x-auto mt-12 scrollbar-hide md:hidden px-4"
          style={{
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-shrink-0 w-[280px]"
            >
              <button
                onClick={() => setSelectedVideo(video)}
                className="group relative aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:border-[#00b2de] transition-all duration-300 text-left w-full"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white/50" />
                  </div>
                )}
                
                {/* Overlay con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Nombre del video */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-sm font-bold line-clamp-2">
                    {video.title}
                  </h3>
                </div>

                {/* Botón de play centrado */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="w-16 h-16 bg-[#00b2de] rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </div>
              </button>
            </div>
          ))}
        </section>

        {/* Grid para desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="group relative aspect-video rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-lg hover:border-[#00b2de] transition-all duration-300 text-left w-full"
            >
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/50" />
                </div>
              )}
              
              {/* Overlay con gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Nombre del video */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white z-10">
                <h3 className="text-sm md:text-base lg:text-lg font-bold line-clamp-2">
                  {video.title}
                </h3>
              </div>

              {/* Botón de play centrado al hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="w-16 h-16 bg-[#00b2de] rounded-full flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal de video */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-50 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Reproductor de YouTube */}
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Título del video */}
            <div className="p-4 md:p-6 bg-black/80">
              <h3 className="text-lg md:text-xl font-bold text-white">
                {selectedVideo.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

