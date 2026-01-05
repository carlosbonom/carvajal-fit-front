"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { getCourseCategoryBySlug } from "@/services/course-categories";
import { getSubscriptionCourses, type CourseWithSubscriptionContent, type SubscriptionContent } from "@/services/courses";
import type { CourseCategory } from "@/services/course-categories";

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const user = useAppSelector((state) => state.user.user);

    const [category, setCategory] = useState<CourseCategory | null>(null);
    const [courses, setCourses] = useState<CourseWithSubscriptionContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Calcular días desde el inicio de la suscripción
    const calculateDaysSinceStart = (): number => {
        if (!user?.subscription?.startedAt) return 0;
        const start = new Date(user.subscription.startedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    // Verificar si el contenido está desbloqueado
    const isContentUnlocked = (content: SubscriptionContent): boolean => {
        if (isAdmin) return true;
        if (content.unlockType === "immediate") return true;
        if (!hasActiveSubscription) return false;

        const monthsSinceStart = calculateMonthsSinceStart();
        const daysSinceStart = calculateDaysSinceStart();

        switch (content.unlockType) {
            case "day":
                return daysSinceStart >= content.unlockValue;
            case "week":
                return Math.floor(daysSinceStart / 7) >= content.unlockValue;
            case "month":
                return monthsSinceStart >= content.unlockValue;
            case "year":
                return Math.floor(monthsSinceStart / 12) >= content.unlockValue;
            default:
                return true;
        }
    };

    useEffect(() => {
        const loadCategoryAndCourses = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar categoría
                const categoryData = await getCourseCategoryBySlug(slug);
                setCategory(categoryData);

                // Cargar todos los cursos
                const allCourses = await getSubscriptionCourses();

                // Filtrar cursos de esta categoría y sus subcategorías
                const categoryIds = [categoryData.id];
                if (categoryData.subcategories) {
                    categoryIds.push(...categoryData.subcategories.map(sub => sub.id));
                }

                const filteredCourses = allCourses
                    .filter(course => course.category && categoryIds.includes(course.category.id))
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
                    .filter((course) => course.content && course.content.length > 0);

                setCourses(filteredCourses);
            } catch (err: any) {
                console.error("Error al cargar categoría:", err);
                setError("Error al cargar la categoría");
            } finally {
                setLoading(false);
            }
        };

        if (canAccessContent) {
            loadCategoryAndCourses();
        } else {
            setLoading(false);
        }
    }, [slug, canAccessContent]);

    if (!canAccessContent) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white p-3 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-[#1a1a1a] rounded-xl md:rounded-2xl p-4 md:p-8 space-y-4 md:space-y-6 text-center">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                            Acceso Restringido
                        </h1>
                        <p className="text-white/70 text-sm md:text-lg mb-3 md:mb-6">
                            Para acceder al contenido del club, necesitas una suscripción activa.
                        </p>
                        <button
                            onClick={() => router.push("/checkout")}
                            className="px-4 md:px-8 py-2 md:py-3 bg-[#00b2de] text-white font-semibold rounded-md md:rounded-lg hover:bg-[#00a0c8] transition-colors text-xs md:text-base"
                        >
                            Suscribirse ahora
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white p-3 md:p-8">
                <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="min-h-screen bg-[#0b0b0b] text-white p-3 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
                        <p className="text-red-400">{error || "Categoría no encontrada"}</p>
                        <button
                            onClick={() => router.push("/club")}
                            className="mt-4 px-4 py-2 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors"
                        >
                            Volver al Club
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Agrupar cursos por subcategoría
    const coursesWithSubcategory = courses.filter(c => c.category && c.category.parentId === category.id);
    const coursesWithoutSubcategory = courses.filter(c => c.category && c.category.id === category.id);

    // Agrupar por subcategoría
    const subcategoryMap = new Map<string, typeof coursesWithSubcategory>();
    coursesWithSubcategory.forEach((course) => {
        if (course.category) {
            const subcategoryId = course.category.id;
            if (!subcategoryMap.has(subcategoryId)) {
                subcategoryMap.set(subcategoryId, []);
            }
            subcategoryMap.get(subcategoryId)!.push(course);
        }
    });

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white p-3 md:p-8">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
                {/* Header con breadcrumb */}
                <div className="space-y-3 md:space-y-4">
                    <button
                        onClick={() => router.push("/club")}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm md:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        Volver al Club
                    </button>

                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">
                            {category.name}
                        </h1>
                        {category.description && (
                            <p className="text-white/70 text-sm md:text-lg mt-2">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Cursos directos de la categoría */}
                {coursesWithoutSubcategory.length > 0 && (
                    <div className="space-y-3 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {coursesWithoutSubcategory.map((course) => {
                                const coverThumbnail = course.thumbnailUrl || course.content?.[0]?.thumbnailUrl;
                                const coverVideoUrl = !course.thumbnailUrl && course.content?.[0]?.contentType === "video" ? course.content?.[0]?.contentUrl : null;

                                const isCourseLocked = course.content && course.content.length > 0
                                    ? course.content.every(contentItem => !isContentUnlocked(contentItem))
                                    : false;

                                return (
                                    <div
                                        key={course.id}
                                        className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 ${!isCourseLocked ? "hover:border-[#00b2de]/30 cursor-pointer" : "cursor-default"} transition-all duration-300 group relative overflow-hidden`}
                                        onClick={() => {
                                            if (!isCourseLocked) {
                                                router.push(`/club/${course.slug}`);
                                            }
                                        }}
                                    >
                                        {coverThumbnail ? (
                                            <img
                                                src={coverThumbnail}
                                                alt={course.title}
                                                className={`w-full h-full object-cover ${isCourseLocked ? "blur-sm opacity-40" : ""}`}
                                            />
                                        ) : coverVideoUrl ? (
                                            <video
                                                src={coverVideoUrl}
                                                className={`w-full h-full object-cover ${isCourseLocked ? "blur-sm opacity-40" : ""}`}
                                                preload="metadata"
                                                muted
                                                playsInline
                                            />
                                        ) : (
                                            <div className="text-center space-y-2 opacity-40">
                                                <p className="text-white/50 text-sm px-4">{course.title}</p>
                                            </div>
                                        )}

                                        {isCourseLocked && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <div className="text-center space-y-2">
                                                    <Lock className="w-10 h-10 mx-auto text-white/70" />
                                                    <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Bloqueado</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end p-4">
                                            <p className="text-white font-medium text-sm">{course.title}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Subcategorías con sus cursos */}
                {Array.from(subcategoryMap.entries()).map(([subcategoryId, subcategoryCourses]) => {
                    const subcategory = subcategoryCourses[0].category!;

                    return (
                        <div key={subcategoryId} className="space-y-3 md:space-y-6">
                            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white">
                                {subcategory.name}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {subcategoryCourses.map((course) => {
                                    const coverThumbnail = course.thumbnailUrl || course.content?.[0]?.thumbnailUrl;
                                    const coverVideoUrl = !course.thumbnailUrl && course.content?.[0]?.contentType === "video" ? course.content?.[0]?.contentUrl : null;

                                    const isCourseLocked = course.content && course.content.length > 0
                                        ? course.content.every(contentItem => !isContentUnlocked(contentItem))
                                        : false;

                                    return (
                                        <div
                                            key={course.id}
                                            className={`bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl aspect-[4/3] flex items-center justify-center border border-white/10 ${!isCourseLocked ? "hover:border-[#00b2de]/30 cursor-pointer" : "cursor-default"} transition-all duration-300 group relative overflow-hidden`}
                                            onClick={() => {
                                                if (!isCourseLocked) {
                                                    router.push(`/club/${course.slug}`);
                                                }
                                            }}
                                        >
                                            {coverThumbnail ? (
                                                <img
                                                    src={coverThumbnail}
                                                    alt={course.title}
                                                    className={`w-full h-full object-cover ${isCourseLocked ? "blur-sm opacity-40" : ""}`}
                                                />
                                            ) : coverVideoUrl ? (
                                                <video
                                                    src={coverVideoUrl}
                                                    className={`w-full h-full object-cover ${isCourseLocked ? "blur-sm opacity-40" : ""}`}
                                                    preload="metadata"
                                                    muted
                                                    playsInline
                                                />
                                            ) : (
                                                <div className="text-center space-y-2 opacity-40">
                                                    <p className="text-white/50 text-sm px-4">{course.title}</p>
                                                </div>
                                            )}

                                            {isCourseLocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <div className="text-center space-y-2">
                                                        <Lock className="w-10 h-10 mx-auto text-white/70" />
                                                        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Bloqueado</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 flex items-end p-4">
                                                <p className="text-white font-medium text-sm">{course.title}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Mensaje si no hay cursos */}
                {courses.length === 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-8 text-center">
                        <p className="text-white/60">No hay cursos disponibles en esta categoría</p>
                    </div>
                )}
            </div>
        </div>
    );
}
