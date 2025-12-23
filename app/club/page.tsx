"use client";

import { useEffect, useState } from "react";
import { Calendar, MessageCircle, Flame, ArrowRight, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { getSubscriptionCourses, type CourseWithSubscriptionContent, type SubscriptionContent } from "@/services/courses";
import { getProfile } from "@/services/auth";
import { setUser } from "@/lib/store/slices/userSlice";
import { getAccessToken } from "@/lib/auth-utils";
import { store } from "@/lib/store/store";
import { InstallPWABanner } from "@/components/install-pwa-banner";
import { getClubConfig, type ClubConfig } from "@/services/club-config";

export default function ClubPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithSubscriptionContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [clubConfig, setClubConfig] = useState<ClubConfig | null>(null);

  // Obtener nombre del usuario
  const userName = user?.name || user?.email?.split("@")[0] || "Usuario";

  // Verificar si tiene suscripción activa o es admin
  const hasActiveSubscription = user?.subscription?.status === "active";
  const isAdmin = user?.role === "admin" || user?.role === "support";
  const canAccessContent = hasActiveSubscription || isAdmin;

  // Calcular meses desde el inicio de la suscripción
  const calculateMonthsSinceStart = (): number => {
    if (!user?.subscription?.startedAt) return 0;
    const start = new Date(user.subscription.startedAt);
    const now = new Date();
    const yearsDiff = now.getFullYear() - start.getFullYear();
    const monthsDiff = now.getMonth() - start.getMonth();
    return yearsDiff * 12 + monthsDiff;
  };

  // Verificar si el contenido está desbloqueado
  const isContentUnlocked = (content: SubscriptionContent): boolean => {
    if (isAdmin) return true;
    if (content.unlockType === "immediate") return true;
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

  // Calcular días desde el inicio de la suscripción
  const calculateDaysSinceStart = (): number => {
    if (!user?.subscription?.startedAt) return 0;
    const start = new Date(user.subscription.startedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Formatear mensaje de desbloqueo
  const getUnlockMessage = (content: SubscriptionContent): string => {
    if (content.unlockType === "immediate") return "";
    if (!hasActiveSubscription) return "Requiere suscripción activa";
    
    const monthsSinceStart = calculateMonthsSinceStart();
    const daysSinceStart = calculateDaysSinceStart();

    // Formatear según el tipo original
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

  // Link de WhatsApp desde configuración
  const whatsappLink = clubConfig?.whatsappLink || "https://chat.whatsapp.com/your-link";

  // Función para verificar si es el momento de la reunión
  const isMeetingTime = (): boolean => {
    if (!clubConfig?.nextMeetingDateTime) {
      return false;
    }

    try {
      // Crear fecha y hora de la reunión desde el datetime
      // El formato viene como YYYY-MM-DDTHH:mm
      const meetingDate = new Date(clubConfig.nextMeetingDateTime);
      
      // Obtener fecha actual
      const now = new Date();
      
      // Calcular diferencia en milisegundos
      const diffMs = now.getTime() - meetingDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // La reunión está activa si han pasado entre 0 y 3 horas desde el inicio
      return diffHours >= 0 && diffHours <= 3;
    } catch (error) {
      console.error("Error al verificar tiempo de reunión:", error);
      return false;
    }
  };

  // Función para formatear fecha y hora de próxima reunión
  const formatNextMeetingDateTime = (): string | null => {
    if (!clubConfig?.nextMeetingDateTime) {
      return null;
    }

    try {
      const date = new Date(clubConfig.nextMeetingDateTime);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('es-CL', options);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return null;
    }
  };

  // Link de la reunión
  const meetingLink = clubConfig?.meetingLink || null;

  // Cargar usuario desde token si no está en Redux
  useEffect(() => {
    const loadUserFromToken = async () => {
      // Verificar si ya hay usuario en Redux
      const currentState = store.getState();
      
      if (currentState.user.user) {
        console.log("Usuario ya existe en Redux:", currentState.user.user);
        setUserLoading(false);
        return;
      }

      const token = getAccessToken();

      if (!token) {
        console.log("No hay token en localStorage");
        setUserLoading(false);
        return;
      }

      try {
        console.log("Cargando usuario desde token...");
        const userProfile = await getProfile(token);
        console.log("Usuario cargado:", userProfile);
        dispatch(setUser(userProfile));
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUserFromToken();
  }, [dispatch]);

  // Cargar configuración del club
  useEffect(() => {
    const loadClubConfig = async () => {
      try {
        const config = await getClubConfig();
        setClubConfig(config);
      } catch (error) {
        console.error("Error al cargar configuración del club:", error);
      }
    };

    loadClubConfig();
  }, []);

  // Cargar cursos si tiene suscripción activa o es admin
  useEffect(() => {
    const loadCourses = async () => {
      // Esperar a que el usuario esté cargado
      if (userLoading) {
        console.log("Esperando a que el usuario se cargue...");
        return;
      }

      if (!user) {
        console.log("No hay usuario disponible");
        setLoading(false);
        return;
      }

      // Verificar si tiene suscripción activa o es admin
      const hasActiveSubscription = user?.subscription?.status === "active";
      const isAdmin = user?.role === "admin" || user?.role === "support";
      const canAccessContent = hasActiveSubscription || isAdmin;

      console.log("Usuario:", user);
      console.log("hasActiveSubscription:", hasActiveSubscription);
      console.log("isAdmin:", isAdmin);
      console.log("canAccessContent:", canAccessContent);

      if (!canAccessContent) {
        console.log("Usuario no tiene acceso al contenido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Cargando cursos de suscripción...");
        const coursesData = await getSubscriptionCourses();
        console.log("Cursos cargados:", coursesData);
        // Ordenar contenido de cada curso por sortOrder
        const coursesWithSortedContent = coursesData
          .map((course) => ({
            ...course,
            content: course.content
              ? [...course.content].sort((a, b) => {
                  const orderA = a.sortOrder ?? 999999;
                  const orderB = b.sortOrder ?? 999999;
                  return orderA - orderB;
                })
              : [],
          }))
          .filter((course) => course.content && course.content.length > 0); // Filtrar cursos sin contenido
        setCourses(coursesWithSortedContent);
      } catch (err: any) {
        console.error("Error al cargar cursos:", err);
        if (err.response?.status === 403) {
          setError("No tienes una suscripción activa");
        } else if (err.response?.status === 401) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        } else {
          setError("Error al cargar los cursos. Por favor, intenta nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user, userLoading]);

  // Si no tiene suscripción activa y no es admin, mostrar botón de suscripción
  if (!canAccessContent && !loading && !userLoading && user) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 space-y-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hola, {userName}
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Para acceder al contenido del club, necesitas una suscripción activa.
            </p>
            <button
              onClick={() => router.push("/checkout")}
              className="px-8 py-3 bg-[#00b2de] text-white font-semibold rounded-lg hover:bg-[#00a0c8] transition-colors inline-flex items-center gap-2"
            >
              Suscribirse ahora
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Comunidad WhatsApp */}
          {whatsappLink && (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-[#00b2de]" />
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-sm">Comunidad WhatsApp</p>
              </div>
              <a
                className="text-[#00b2de] font-medium hover:text-[#00a0c8] transition-colors flex items-center gap-1"
                href={whatsappLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                Unirse <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Próxima Reunión */}
          {clubConfig?.nextMeetingDateTime && (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Calendar className="w-6 h-6 text-[#00b2de]" />
              </div>
              <div className="flex-1">
                {isMeetingTime() ? (
                  <>
                    <p className="text-white/60 text-sm">Reunión en curso</p>
                    <p className="text-white/40 text-xs">
                      Disponible hasta 3 horas después del inicio
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-white/60 text-sm">Próxima Reunión</p>
                    <p className="text-white/40 text-xs">
                      {formatNextMeetingDateTime()}
                    </p>
                  </>
                )}
              </div>
              {isMeetingTime() && meetingLink && (
                <a
                  className="text-[#00b2de] font-medium hover:text-[#00a0c8] transition-colors flex items-center gap-1"
                  href={meetingLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Unirse <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {(loading || userLoading) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Cursos */}
        {!loading && !error && courses.length > 0 && (
          <div className="space-y-8">
            {courses.map((course) => (
              <div key={course.id} className="space-y-6">
                {/* Header del Curso */}
                <div className="space-y-2 sm:space-y-0">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Flame className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#00b2de]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
                          {course.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                  {course.description && (
                    <p className="text-white/70 text-sm sm:text-base leading-tight pl-8 sm:pl-11 md:pl-14">
                      {course.description}
                    </p>
                  )}
                </div>

                {/* Contenido del Curso */}
                {course.content && course.content.length > 0 && (
                  <div className="relative">
                    {/* Botón para ver el curso completo */}
                    <div className="mb-4 flex justify-end">
                      <button
                        onClick={() => router.push(`/club/${course.slug}`)}
                        className="px-6 py-2 bg-[#00b2de] text-white font-semibold rounded-lg hover:bg-[#00a0c8] transition-colors inline-flex items-center gap-2"
                      >
                        Ver curso completo
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Carrusel horizontal en mobile */}
                    <div className="flex md:hidden gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
                      {[...course.content]
                        .sort((a, b) => {
                          const orderA = a.sortOrder ?? 999999;
                          const orderB = b.sortOrder ?? 999999;
                          return orderA - orderB;
                        })
                        .slice(0, 3)
                        .map((contentItem) => {
                          const isUnlocked = isContentUnlocked(contentItem);
                          const unlockMessage = getUnlockMessage(contentItem);
                          
                          return (
                            <div
                              key={contentItem.id}
                              className="flex-shrink-0 w-[85vw] max-w-[320px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 active:border-[#00b2de]/30 transition-all duration-300 cursor-pointer group snap-start relative overflow-hidden"
                              onClick={() =>
                                router.push(`/club/${course.slug}`)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  router.push(`/club/${course.slug}`);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              {contentItem.thumbnailUrl ? (
                                <img
                                  src={contentItem.thumbnailUrl}
                                  alt={contentItem.title}
                                  className={`w-full h-full object-cover ${!isUnlocked ? "blur-sm opacity-50" : ""}`}
                                />
                              ) : contentItem.contentType === "video" && contentItem.contentUrl ? (
                                <video
                                  src={contentItem.contentUrl}
                                  className={`w-full h-full object-cover ${!isUnlocked ? "blur-sm opacity-50" : ""}`}
                                  preload="metadata"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <div className="text-center space-y-2 opacity-40 group-hover:opacity-60 transition-opacity">
                                  <svg
                                    className="w-16 h-16 mx-auto text-white/50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                    />
                                  </svg>
                                  <p className="text-white/50 text-sm px-4">{contentItem.title}</p>
                                </div>
                              )}
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                  <div className="text-center space-y-3 px-4">
                                    <Lock className="w-12 h-12 mx-auto text-white/70" />
                                    {unlockMessage && (
                                      <p className="text-white/80 text-sm font-medium">
                                        {unlockMessage}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end p-4">
                                <p className="text-white font-medium text-sm">{contentItem.title}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Grid en desktop */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {[...course.content]
                        .sort((a, b) => {
                          const orderA = a.sortOrder ?? 999999;
                          const orderB = b.sortOrder ?? 999999;
                          return orderA - orderB;
                        })
                        .slice(0, 3)
                        .map((contentItem) => {
                          const isUnlocked = isContentUnlocked(contentItem);
                          const unlockMessage = getUnlockMessage(contentItem);
                          
                          return (
                            <div
                              key={contentItem.id}
                              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 hover:border-[#00b2de]/30 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                              onClick={() =>
                                router.push(`/club/${course.slug}`)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  router.push(`/club/${course.slug}`);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              {contentItem.thumbnailUrl ? (
                                <img
                                  src={contentItem.thumbnailUrl}
                                  alt={contentItem.title}
                                  className={`w-full h-full object-cover ${!isUnlocked ? "blur-sm opacity-50" : ""}`}
                                />
                              ) : contentItem.contentType === "video" && contentItem.contentUrl ? (
                                <video
                                  src={contentItem.contentUrl}
                                  className={`w-full h-full object-cover ${!isUnlocked ? "blur-sm opacity-50" : ""}`}
                                  preload="metadata"
                                  muted
                                  playsInline
                                />
                              ) : (
                                <div className="text-center space-y-2 opacity-40 group-hover:opacity-60 transition-opacity">
                                  <svg
                                    className="w-16 h-16 mx-auto text-white/50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                    />
                                  </svg>
                                  <p className="text-white/50 text-sm px-4">{contentItem.title}</p>
                                </div>
                              )}
                              {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                  <div className="text-center space-y-3 px-4">
                                    <Lock className="w-12 h-12 mx-auto text-white/70" />
                                    {unlockMessage && (
                                      <p className="text-white/80 text-sm font-medium">
                                        {unlockMessage}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end p-4">
                                <p className="text-white font-medium text-sm">{contentItem.title}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sin cursos */}
        {!loading && !error && courses.length === 0 && (
          <div className="bg-[#1a1a1a] rounded-2xl p-6 md:p-8 text-center">
            <p className="text-white/70 text-lg">No hay cursos disponibles en este momento.</p>
          </div>
        )}
      </div>
      <InstallPWABanner />
    </div>
  );
}
