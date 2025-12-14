"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Home, Play, Check, Lock, Unlock } from "lucide-react";
import { Loader2 } from "lucide-react";

import { getSubscriptionCourses, type CourseWithSubscriptionContent, type SubscriptionContent } from "@/services/courses";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getProfile } from "@/services/auth";
import { setUser } from "@/lib/store/slices/userSlice";
import { getAccessToken } from "@/lib/auth-utils";
import { store } from "@/lib/store/store";

function CoursePageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const courseSlug = params?.slug as string;
  
  const user = useAppSelector((state) => state.user.user);
  const [course, setCourse] = useState<CourseWithSubscriptionContent | null>(null);
  const [selectedContent, setSelectedContent] = useState<SubscriptionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [watchedContent, setWatchedContent] = useState<Set<string>>(new Set());

  // Cargar usuario desde token si no está en Redux
  useEffect(() => {
    const loadUserFromToken = async () => {
      const currentState = store.getState();
      
      if (currentState.user.user) {
        setUserLoading(false);
        return;
      }

      const token = getAccessToken();
      if (!token) {
        setUserLoading(false);
        return;
      }

      try {
        const userProfile = await getProfile(token);
        dispatch(setUser(userProfile));
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUserFromToken();
  }, [dispatch]);

  // Cargar curso
  useEffect(() => {
    const loadCourse = async () => {
      if (userLoading) return;

      try {
        setLoading(true);
        setError(null);
        const courses = await getSubscriptionCourses();
        const foundCourse = courses.find((c) => c.slug === courseSlug);
        
        if (!foundCourse) {
          setError("Curso no encontrado");
          return;
        }

        // Ordenar contenido por sortOrder antes de establecerlo
        const sortedContent = foundCourse.content
          ? [...foundCourse.content].sort((a, b) => {
              const orderA = a.sortOrder ?? 999999;
              const orderB = b.sortOrder ?? 999999;
              return orderA - orderB;
            })
          : [];
        
        setCourse({
          ...foundCourse,
          content: sortedContent,
        });
        // Seleccionar el primer contenido disponible por defecto
        if (sortedContent.length > 0) {
          setSelectedContent(sortedContent[0]);
        }
      } catch (err: any) {
        console.error("Error al cargar curso:", err);
        if (err.response?.status === 403) {
          setError("No tienes una suscripción activa");
        } else if (err.response?.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          setError("Error al cargar el curso. Por favor, intenta nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseSlug, userLoading]);

  const handleMarkAsWatched = (contentId: string) => {
    setWatchedContent((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}min`;
    }
    return `${minutes}min`;
  };

  const isContentUnlocked = (content: SubscriptionContent) => {
    if (!user) return false;
    const isAdmin = user?.role === "admin" || user?.role === "support";
    if (isAdmin) return true;
    
    if (content.unlockType === "immediate") return true;
    
    const hasActiveSubscription = user?.subscription?.status === "active";
    if (!hasActiveSubscription) return false;
    
    // Aquí puedes agregar lógica adicional para verificar el desbloqueo basado en unlockValue y unlockType
    // Por ahora, asumimos que si tiene suscripción activa, puede ver todo
    return true;
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/club")}
            className="px-6 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors"
          >
            Volver al club
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-4">Curso no encontrado</p>
          <button
            onClick={() => router.push("/club")}
            className="px-6 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors"
          >
            Volver al club
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <button
              aria-label="Volver"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              onClick={() => router.push("/club")}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold truncate">
                {course.title}
              </h1>
            </div>
          </div>
          <button
            aria-label="Ir al club"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            onClick={() => router.push("/club")}
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {selectedContent ? (
              <>
                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                  {isContentUnlocked(selectedContent) && selectedContent.contentType === "video" ? (
                    <video
                      key={selectedContent.id}
                      className="w-full h-full"
                      controls
                      controlsList="nodownload"
                      poster={selectedContent.thumbnailUrl || undefined}
                      preload="metadata"
                    >
                      <source src={selectedContent.contentUrl} type="video/mp4" />
                      <source src={selectedContent.contentUrl} type="video/webm" />
                      <source src={selectedContent.contentUrl} type="video/ogg" />
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  ) : isContentUnlocked(selectedContent) ? (
                    <div className="relative w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                      {selectedContent.thumbnailUrl ? (
                        <img
                          src={selectedContent.thumbnailUrl}
                          alt={selectedContent.title}
                          className="w-full h-full object-cover"
                        />
                      ) : selectedContent.contentType === "video" && selectedContent.contentUrl ? (
                        <video
                          src={selectedContent.contentUrl}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="text-center space-y-2 opacity-50">
                          <Play className="w-16 h-16 mx-auto text-white/50" />
                          <p className="text-white/50 text-sm">Sin miniatura</p>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <a
                          href={selectedContent.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-[#00b2de] rounded-lg flex items-center gap-2 hover:bg-[#00a0c8] transition-colors shadow-2xl font-medium"
                        >
                          <Play className="w-5 h-5" fill="white" />
                          Abrir {selectedContent.contentType === "pdf" ? "PDF" : "contenido"}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-900/50 flex items-center justify-center">
                      {selectedContent.thumbnailUrl ? (
                        <img
                          src={selectedContent.thumbnailUrl}
                          alt={selectedContent.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                      ) : selectedContent.contentType === "video" && selectedContent.contentUrl ? (
                        <video
                          src={selectedContent.contentUrl}
                          className="w-full h-full object-cover opacity-50"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center space-y-4">
                          <Lock className="w-16 h-16 mx-auto text-white/50" />
                          <p className="text-white/70">Este contenido está bloqueado</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">
                      {selectedContent.title}
                    </h2>
                    <p className="text-white/60 text-base md:text-lg">
                      {formatDuration(selectedContent.durationSeconds)}
                    </p>
                  </div>
                  {isContentUnlocked(selectedContent) && (
                    <button
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                        watchedContent.has(selectedContent.id)
                          ? "bg-[#00b2de] text-white"
                          : "bg-white/10 text-[#00b2de] hover:bg-white/20"
                      }`}
                      onClick={() => handleMarkAsWatched(selectedContent.id)}
                    >
                      <Check className="w-4 h-4 md:w-5 md:h-5" />
                      Marcar como visto
                    </button>
                  )}
                </div>

                {/* Description */}
                {selectedContent.description && (
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      Descripción
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm md:text-base">
                      {selectedContent.description}
                    </p>
                  </div>
                )}

                {/* Resources */}
                {selectedContent.resources && selectedContent.resources.length > 0 && (
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      Recursos
                    </h3>
                    <div className="space-y-2">
                      {selectedContent.resources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <p className="text-white font-medium">{resource.title}</p>
                          {resource.description && (
                            <p className="text-white/60 text-sm mt-1">{resource.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">No hay contenido disponible</p>
              </div>
            )}
          </div>

          {/* Sidebar - Content List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-xl p-4 md:p-6 border border-white/10 lg:sticky lg:top-20">
              <h3 className="text-base md:text-lg font-bold text-white mb-4">
                Contenido del curso
              </h3>
              <div className="space-y-2 md:space-y-3 max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
                {course.content && course.content.length > 0 ? (
                  [...course.content]
                    .sort((a, b) => {
                      const orderA = a.sortOrder ?? 999999;
                      const orderB = b.sortOrder ?? 999999;
                      return orderA - orderB;
                    })
                    .map((contentItem) => {
                    const isUnlocked = isContentUnlocked(contentItem);
                    const isSelected = selectedContent?.id === contentItem.id;
                    const isWatched = watchedContent.has(contentItem.id);

                    return (
                      <button
                        key={contentItem.id}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isSelected
                            ? "bg-[#00b2de]/20 border border-[#00b2de]/50"
                            : "bg-white/5 border border-transparent hover:bg-white/10"
                        } ${!isUnlocked ? "opacity-60" : ""}`}
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedContent(contentItem);
                          }
                        }}
                        disabled={!isUnlocked}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected
                                ? "bg-[#00b2de]"
                                : isUnlocked
                                  ? "bg-white/10 border border-white/20"
                                  : "bg-white/5 border border-white/10"
                            }`}
                          >
                            {isUnlocked ? (
                              <Play
                                className={`w-4 h-4 ${
                                  isSelected ? "text-white" : "text-white/60"
                                }`}
                                fill={isSelected ? "white" : "none"}
                              />
                            ) : (
                              <Lock className="w-4 h-4 text-white/40" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-medium mb-1 truncate ${
                                  isSelected ? "text-white" : "text-white/80"
                                }`}
                              >
                                {contentItem.title}
                              </p>
                              {isWatched && (
                                <Check className="w-4 h-4 text-[#00b2de] flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-white/60 text-sm">
                              {formatDuration(contentItem.durationSeconds)}
                            </p>
                            {!isUnlocked && (
                              <p className="text-white/40 text-xs mt-1">Bloqueado</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-white/60 text-sm">No hay contenido disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
        </div>
      }
    >
      <CoursePageContent />
    </Suspense>
  );
}

