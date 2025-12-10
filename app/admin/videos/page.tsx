"use client";

import { useEffect, useState } from "react";
import { Video, Plus, Edit, Trash2, Upload, Calendar, Lock, Unlock, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { EditContentModal } from "@/components/edit-content-modal";
import { getCourses, getCourseContent, updateContentStatus, type Course, type CourseContent } from "@/services/courses";

type CourseContentWithName = CourseContent & {
  courseName?: string;
};

export default function VideosPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allContent, setAllContent] = useState<CourseContentWithName[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [updatingContentId, setUpdatingContentId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const coursesData = await getCourses();
      setCourses(coursesData);

      // Cargar contenido de todos los cursos
      const allContentPromises = coursesData.map((course) =>
        getCourseContent(course.id).then((content) =>
          content.map((item) => ({
            ...item,
            courseName: course.title,
          }))
        )
      );

      const allContentArrays = await Promise.all(allContentPromises);
      const flattenedContent = allContentArrays.flat();
      setAllContent(flattenedContent);
    } catch (error) {
      console.error("Error al cargar videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (contentId: string, currentStatus: boolean) => {
    setUpdatingContentId(contentId);
    try {
      const updatedContent = await updateContentStatus(contentId, !currentStatus);
      setAllContent((prevContent) =>
        prevContent.map((item) =>
          item.id === contentId ? { ...updatedContent, courseName: item.courseName } : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del contenido:", error);
      // Recargar datos en caso de error
      loadVideos();
    } finally {
      setUpdatingContentId(null);
    }
  };

  const filteredContent =
    selectedCourse === "all"
      ? allContent
      : allContent.filter((item) => item.course.id === selectedCourse);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatUnlock = (unlockValue: number, unlockType: string) => {
    if (unlockType === "immediate" || unlockValue === 0) {
      return "Inmediato";
    }
    
    const typeLabels: Record<string, string> = {
      day: "día",
      days: "días",
      week: "semana",
      weeks: "semanas",
      month: "mes",
      months: "meses",
      year: "año",
      years: "años",
    };
    
    const label = unlockValue === 1 
      ? typeLabels[unlockType] || unlockType
      : typeLabels[`${unlockType}s`] || `${unlockType}s`;
    
    return `${unlockValue} ${label}`;
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Videos
              </h1>
              <p className="text-gray-600">
                Sube y administra los videos de los cursos
              </p>
            </div>
            <button
              onClick={() => router.push("/admin/courses")}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Contenido
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrar por curso:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los cursos</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando videos...</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Curso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Desbloqueo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContent.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              <Video className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {item.description || "Sin descripción"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.courseName || item.course.title}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {item.contentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {formatUnlock(item.unlockValue, item.unlockType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Activo:</span>
                              {updatingContentId === item.id ? (
                                <div className="relative inline-flex items-center justify-center w-11 h-6">
                                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                </div>
                              ) : (
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.isActive}
                                    onChange={() => handleToggleActive(item.id, item.isActive)}
                                    className="sr-only peer"
                                    disabled={updatingContentId === item.id}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {item.isPreview && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full w-fit">
                                  <Eye className="w-3 h-3" />
                                  Vista Previa
                                </span>
                              )}
                              {item.resources && item.resources.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full w-fit">
                                  Recursos ({item.resources.length})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/courses/${item.course.id}/videos`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Ver en curso"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedContent(item);
                                setIsEditModalOpen(true);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar contenido"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar contenido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredContent.length === 0 && (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">No hay contenido</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {selectedCourse === "all"
                      ? "No hay contenido en ningún curso"
                      : "No hay contenido en este curso"}
                  </p>
                  <button
                    onClick={() => router.push("/admin/courses")}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Ir a Cursos
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContent(null);
        }}
        onSuccess={() => {
          loadVideos();
        }}
        content={selectedContent}
      />
    </>
  );
}


