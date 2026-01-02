"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Home, Play, Check, Lock, Unlock, Menu } from "lucide-react";
import { Loader2 } from "lucide-react";

import { getSubscriptionCourses, type CourseWithSubscriptionContent, type SubscriptionContent, saveContentProgress, getContentProgress, markContentCompleted, getCourseProgress, type ContentProgress } from "@/services/courses";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getProfile } from "@/services/auth";
import { setUser } from "@/lib/store/slices/userSlice";
import { getAccessToken } from "@/lib/auth-utils";
import { store } from "@/lib/store/store";
import UserSidebar from "@/components/club/UserSidebar";
import Comments from "@/components/Comments";

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
  const [contentProgress, setContentProgress] = useState<Map<string, ContentProgress>>(new Map());
  const [markingAsWatched, setMarkingAsWatched] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userName = user?.name || user?.email?.split("@")[0] || "Usuario";

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

  // Cargar progreso del curso al cargar el curso
  useEffect(() => {
    const loadCourseProgress = async () => {
      if (!course || !user) return;

      try {
        const progress = await getCourseProgress(course.id);
        const progressMap = new Map<string, ContentProgress>();
        Object.entries(progress).forEach(([contentId, prog]) => {
          progressMap.set(contentId, prog);
          if (prog.isCompleted) {
            setWatchedContent((prev) => new Set(prev).add(contentId));
          }
        });
        setContentProgress(progressMap);
      } catch (error) {
        console.error("Error al cargar progreso del curso:", error);
      }
    };

    if (course && user) {
      loadCourseProgress();
    }
  }, [course, user]);

  // Cargar progreso específico cuando se selecciona contenido
  useEffect(() => {
    const loadContentProgress = async () => {
      if (!selectedContent || !user) return;

      try {
        const progress = await getContentProgress(selectedContent.id);
        if (progress) {
          setContentProgress((prev) => {
            const newMap = new Map(prev);
            newMap.set(selectedContent.id, progress);
            return newMap;
          });

          // Restaurar posición del video
          if (videoRef.current && progress.progressSeconds > 0) {
            videoRef.current.currentTime = progress.progressSeconds;
          }

          // Actualizar estado de visto
          if (progress.isCompleted) {
            setWatchedContent((prev) => new Set(prev).add(selectedContent.id));
          }
        }
      } catch (error) {
        console.error("Error al cargar progreso del contenido:", error);
      }
    };

    if (selectedContent && user) {
      loadContentProgress();
    }
  }, [selectedContent, user]);

  // Guardar progreso automáticamente cada 5 segundos
  useEffect(() => {
    if (!selectedContent || !user || !videoRef.current) return;

    const video = videoRef.current;

    const handleTimeUpdate = () => {
      if (progressSaveTimer.current) {
        clearTimeout(progressSaveTimer.current);
      }

      progressSaveTimer.current = setTimeout(async () => {
        try {
          const currentTime = Math.floor(video.currentTime);
          const duration = Math.floor(video.duration || 0);

          if (duration > 0 && currentTime > 0) {
            const progress = await saveContentProgress(selectedContent.id, {
              progressSeconds: currentTime,
              totalSeconds: duration,
            });

            setContentProgress((prev) => {
              const newMap = new Map(prev);
              newMap.set(selectedContent.id, progress);
              return newMap;
            });

            // Si se completó automáticamente (90% visto), marcar como visto
            if (progress.isCompleted && !watchedContent.has(selectedContent.id)) {
              setWatchedContent((prev) => new Set(prev).add(selectedContent.id));
            }
          }
        } catch (error) {
          console.error("Error al guardar progreso:", error);
        }
      }, 5000); // Guardar después de 5 segundos de inactividad
    };

    const handleVideoEnded = async () => {
      setMarkingAsWatched((prev) => new Set(prev).add(selectedContent.id));

      try {
        // Marcar como completado cuando el video termine
        const progress = await markContentCompleted(selectedContent.id, { isCompleted: true });

        setContentProgress((prev) => {
          const newMap = new Map(prev);
          newMap.set(selectedContent.id, progress);
          return newMap;
        });

        // Marcar como visto en el estado local
        if (!watchedContent.has(selectedContent.id)) {
          setWatchedContent((prev) => new Set(prev).add(selectedContent.id));
        }
      } catch (error) {
        console.error("Error al marcar video como completado:", error);
      } finally {
        setMarkingAsWatched((prev) => {
          const newSet = new Set(prev);
          newSet.delete(selectedContent.id);
          return newSet;
        });
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleVideoEnded);
      if (progressSaveTimer.current) {
        clearTimeout(progressSaveTimer.current);
      }
    };
  }, [selectedContent, user, watchedContent]);

  const handleMarkAsWatched = async (contentId: string) => {
    const isCurrentlyWatched = watchedContent.has(contentId);
    const newIsCompleted = !isCurrentlyWatched;

    setMarkingAsWatched((prev) => new Set(prev).add(contentId));

    try {
      await markContentCompleted(contentId, { isCompleted: newIsCompleted });

      setWatchedContent((prev) => {
        const newSet = new Set(prev);
        if (newIsCompleted) {
          newSet.add(contentId);
        } else {
          newSet.delete(contentId);
        }
        return newSet;
      });

      // Actualizar progreso local
      setContentProgress((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(contentId);
        if (current) {
          newMap.set(contentId, {
            ...current,
            isCompleted: newIsCompleted,
          });
        }
        return newMap;
      });
    } catch (error) {
      console.error("Error al marcar como visto:", error);
      alert("Error al actualizar el estado. Por favor, intenta nuevamente.");
    } finally {
      setMarkingAsWatched((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
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

  // Calcular meses desde el inicio de la suscripción
  const calculateMonthsSinceStart = (): number => {
    if (!user?.subscription?.startedAt) return 0;
    const start = new Date(user.subscription.startedAt);
    const now = new Date();
    const yearsDiff = now.getFullYear() - start.getFullYear();
    const monthsDiff = now.getMonth() - start.getMonth();
    return yearsDiff * 12 + monthsDiff;
  };

  // Calcular días desde el inicio de la suscripción
  const calculateDaysSinceStart = (): number => {
    if (!user?.subscription?.startedAt) return 0;
    const start = new Date(user.subscription.startedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const isContentUnlocked = (content: SubscriptionContent) => {
    if (!user) return false;
    const isAdmin = user?.role === "admin" || user?.role === "support";
    if (isAdmin) return true;

    if (content.unlockType === "immediate") return true;

    const hasActiveSubscription = user?.subscription?.status === "active";
    if (!hasActiveSubscription) return false;

    const monthsSinceStart = calculateMonthsSinceStart();
    let unlockThreshold = 0;

    switch (content.unlockType) {
      case "day":
        unlockThreshold = Math.floor(content.unlockValue / 30);
        break;
      case "week":
        unlockThreshold = Math.floor(content.unlockValue / 4);
        break;
      case "month":
        unlockThreshold = content.unlockValue;
        break;
      case "year":
        unlockThreshold = content.unlockValue * 12;
        break;
      default:
        return true;
    }

    return monthsSinceStart >= unlockThreshold;
  };

  // Formatear mensaje de desbloqueo
  const getUnlockMessage = (content: SubscriptionContent): string => {
    if (content.unlockType === "immediate") return "";
    if (!user?.subscription || user.subscription.status !== "active") return "Requiere suscripción activa";

    const monthsSinceStart = calculateMonthsSinceStart();
    const daysSinceStart = calculateDaysSinceStart();

    if (content.unlockType === "day") {
      const daysRemaining = content.unlockValue - daysSinceStart;
      if (daysRemaining <= 0) return "";
      if (daysRemaining === 1) {
        return `Se desbloquea en 1 día`;
      }
      return `Se desbloquea en ${daysRemaining} días`;
    } else if (content.unlockType === "week") {
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      const weeksRemaining = content.unlockValue - weeksSinceStart;
      if (weeksRemaining <= 0) return "";
      if (weeksRemaining === 1) {
        return `Se desbloquea en 1 semana`;
      }
      return `Se desbloquea en ${weeksRemaining} semanas`;
    } else if (content.unlockType === "month") {
      const monthsRemaining = content.unlockValue - monthsSinceStart;
      if (monthsRemaining <= 0) return "";
      if (monthsRemaining === 1) {
        return `Se desbloquea en 1 mes`;
      }
      return `Se desbloquea en ${monthsRemaining} meses`;
    } else if (content.unlockType === "year") {
      const yearsSinceStart = Math.floor(monthsSinceStart / 12);
      const yearsRemaining = content.unlockValue - yearsSinceStart;
      if (yearsRemaining <= 0) return "";
      if (yearsRemaining === 1) {
        return `Se desbloquea en 1 año`;
      }
      return `Se desbloquea en ${yearsRemaining} años`;
    }

    return "";
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
      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userName={userName}
        userEmail={user?.email}
        userImage={(user as any)?.image}
      />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 md:px-8 py-2 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button
              aria-label="Volver"
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              onClick={() => router.push("/club")}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl lg:text-2xl font-bold truncate">
                {course.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Ir al club"
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              onClick={() => router.push("/club")}
            >
              <Home className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              aria-label="Abrir menú"
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-8 py-3 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {selectedContent ? (
              <>
                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                  {isContentUnlocked(selectedContent) && selectedContent.contentType === "video" ? (
                    <video
                      ref={videoRef}
                      key={selectedContent.id}
                      className="w-full h-full"
                      controls
                      controlsList="nodownload"
                      poster={selectedContent.thumbnailUrl || undefined}
                      preload="metadata"
                      playsInline
                      style={{ WebkitPlaysinline: 'true' } as React.CSSProperties}
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
                    <div className="w-full h-full bg-gradient-to-br from-gray-700/30 to-gray-900/50 flex items-center justify-center relative">
                      {selectedContent.thumbnailUrl ? (
                        <img
                          src={selectedContent.thumbnailUrl}
                          alt={selectedContent.title}
                          className="w-full h-full object-cover blur-sm opacity-50"
                        />
                      ) : selectedContent.contentType === "video" && selectedContent.contentUrl ? (
                        <video
                          src={selectedContent.contentUrl}
                          className="w-full h-full object-cover blur-sm opacity-50"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : null}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="text-center space-y-4 px-4">
                          <Lock className="w-16 h-16 mx-auto text-white/70" />
                          <p className="text-white/70 font-medium">Este contenido está bloqueado</p>
                          {getUnlockMessage(selectedContent) && (
                            <p className="text-white/80 text-sm">
                              {getUnlockMessage(selectedContent)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
                  <div>
                    <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-1">
                      {selectedContent.title}
                    </h2>
                    <p className="text-white/60 text-sm md:text-lg">
                      {formatDuration(selectedContent.durationSeconds)}
                    </p>
                  </div>
                  {isContentUnlocked(selectedContent) && (
                    <button
                      className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-colors text-xs md:text-base ${watchedContent.has(selectedContent.id)
                        ? "bg-[#00b2de] text-white"
                        : "bg-white/10 text-[#00b2de] hover:bg-white/20"
                        }`}
                      onClick={() => handleMarkAsWatched(selectedContent.id)}
                    >
                      <Check className="w-3 h-3 md:w-5 md:h-5" />
                      Marcar como visto
                    </button>
                  )}
                </div>

                {/* Description */}
                {selectedContent.description && (
                  <div className="space-y-1.5 md:space-y-3">
                    <h3 className="text-base md:text-xl font-bold text-white">
                      Descripción
                    </h3>
                    <p className="text-white/70 leading-relaxed text-xs md:text-base">
                      {selectedContent.description}
                    </p>
                  </div>
                )}

                {/* Resources */}
                {selectedContent.resources && selectedContent.resources.length > 0 && (
                  <div className="space-y-1.5 md:space-y-3">
                    <h3 className="text-base md:text-xl font-bold text-white">
                      Recursos
                    </h3>
                    <div className="space-y-2">
                      {selectedContent.resources.map((resource) => (
                        <a
                          key={resource.id}
                          href={resource.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2.5 md:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <p className="text-white font-medium text-sm md:text-base">{resource.title}</p>
                          {resource.description && (
                            <p className="text-white/60 text-xs md:text-sm mt-1">{resource.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="space-y-1.5 md:space-y-3 pt-4 border-t border-white/10">
                  <Comments contentId={selectedContent.id} />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70">No hay contenido disponible</p>
              </div>
            )}
          </div>

          {/* Sidebar - Content List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-lg md:rounded-xl p-3 md:p-6 border border-white/10 lg:sticky lg:top-20">
              <h3 className="text-sm md:text-lg font-bold text-white mb-3 md:mb-4">
                Contenido del curso
              </h3>
              <div className="space-y-2 max-h-[calc(100vh-250px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
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
                      const progress = contentProgress.get(contentItem.id);
                      const progressPercent = progress && contentItem.durationSeconds
                        ? Math.min((progress.progressSeconds / contentItem.durationSeconds) * 100, 100)
                        : 0;

                      return (
                        <button
                          key={contentItem.id}
                          className={`w-full text-left p-2.5 md:p-3 rounded-lg transition-all relative overflow-hidden ${isSelected
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
                          {/* Barra de progreso de fondo */}
                          {progress && progressPercent > 0 && (
                            <div
                              className="absolute bottom-0 left-0 h-1 bg-[#00b2de] transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          )}
                          <div className="flex items-start gap-2 md:gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${isSelected
                                ? "bg-[#00b2de]"
                                : isWatched && isUnlocked
                                  ? "bg-[#00b2de]"
                                  : isUnlocked
                                    ? "bg-white/10 border border-white/20"
                                    : "bg-white/5 border border-white/10"
                                }`}
                            >
                              {isUnlocked ? (
                                markingAsWatched.has(contentItem.id) ? (
                                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 text-white animate-spin" />
                                ) : isWatched ? (
                                  <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                ) : (
                                  <Play
                                    className={`w-3 h-3 md:w-4 md:h-4 ${isSelected ? "text-white" : "text-white/60"
                                      }`}
                                    fill={isSelected ? "white" : "none"}
                                  />
                                )
                              ) : (
                                <Lock className="w-3 h-3 md:w-4 md:h-4 text-white/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`font-medium mb-0.5 md:mb-1 truncate text-sm md:text-base ${isSelected ? "text-white" : "text-white/80"
                                    }`}
                                >
                                  {contentItem.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-white/60 text-xs md:text-sm">
                                  {formatDuration(contentItem.durationSeconds)}
                                </p>
                                {progress && progressPercent > 0 && progressPercent < 100 && (
                                  <span className="text-white/40 text-[10px] md:text-xs">
                                    {Math.round(progressPercent)}% visto
                                  </span>
                                )}
                              </div>
                              {!isUnlocked && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Lock className="w-3 h-3 text-white/40" />
                                  <p className="text-white/40 text-xs">
                                    {getUnlockMessage(contentItem) || "Bloqueado"}
                                  </p>
                                </div>
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

