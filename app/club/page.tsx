"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { Calendar, MessageCircle, Flame, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClubPage() {
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();

  // Obtener nombre del usuario
  const userName = user?.name || user?.email?.split("@")[0] || "Usuario";

  // Datos de próxima clase (esto podría venir de una API)
  const nextClass = {
    date: "28 nov",
    time: "19:00",
  };

  // Link de WhatsApp (esto podría venir de configuración)
  const whatsappLink = "https://chat.whatsapp.com/your-link";

  // Datos de los videos (esto podría venir de una API)
  const videos = [
    { id: "1", title: "Semana 1 - Introducción" },
    { id: "2", title: "Semana 2 - Intensidad Media" },
    { id: "3", title: "Semana 3 - Alta Intensidad" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Sección Superior - Información del Usuario */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 space-y-6">
          {/* Saludo */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Hola, {userName}
            </h1>
          </div>

          {/* Próxima Clase */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Calendar className="w-6 h-6 text-[#00b2de]" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Próxima clase</p>
              <p className="text-white font-medium">
                {nextClass.date} - {nextClass.time}
              </p>
            </div>
          </div>

          {/* Comunidad WhatsApp */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-[#00b2de]" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-sm">Comunidad WhatsApp</p>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00b2de] font-medium hover:text-[#00a0c8] transition-colors flex items-center gap-1"
            >
              Unirse <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Sección Inferior - Categorías de Rutinas */}
        <div className="space-y-6">
          {/* Header de Categoría */}
          <div className="space-y-2 sm:space-y-0">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#00b2de]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                      Bajar Grasa
                    </h2>
                    <button 
                      onClick={() => router.push('/club/bajar-grasa')}
                      className="text-[#00b2de] font-semibold hover:text-[#00a0c8] transition-colors flex items-center gap-1 flex-shrink-0 text-sm sm:text-base"
                    >
                      Ver más <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white/70 text-sm sm:text-base leading-tight pl-8 sm:pl-11 md:pl-14">
              Rutinas de definición y quema de grasa
            </p>
          </div>

          {/* Carrusel en Mobile / Grid en Desktop */}
          <div className="relative">
            {/* Carrusel horizontal en mobile */}
            <div className="flex md:hidden gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => router.push(`/club/bajar-grasa?video=${video.id}`)}
                  className="flex-shrink-0 w-[85vw] max-w-[320px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 active:border-[#00b2de]/30 transition-all duration-300 cursor-pointer group snap-start"
                >
                  <div className="text-center space-y-2 opacity-40 group-hover:opacity-60 transition-opacity">
                    <svg
                      className="w-16 h-16 mx-auto text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/50 text-sm">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Grid en desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => router.push(`/club/bajar-grasa?video=${video.id}`)}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 hover:border-[#00b2de]/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="text-center space-y-2 opacity-40 group-hover:opacity-60 transition-opacity">
                    <svg
                      className="w-16 h-16 mx-auto text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-white/50 text-sm">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}