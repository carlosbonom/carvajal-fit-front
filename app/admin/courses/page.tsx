"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Edit, Trash2, Video, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { CreateCourseModal } from "@/components/create-course-modal";
import { getCourses, type Course } from "@/services/courses";

export default function CoursesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courses = await getCourses();
      setCourses(courses);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
    }
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
                Gestión de Cursos
              </h1>
              <p className="text-gray-600">
                Administra los cursos disponibles para los miembros
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Curso
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando cursos...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-16 h-16 text-primary/40" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {course.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.isPublished ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || "Sin descripción"}
                    </p>
                    
                    {course.level && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {course.level === "beginner" && "Principiante"}
                          {course.level === "intermediate" && "Intermedio"}
                          {course.level === "advanced" && "Avanzado"}
                        </span>
                      </div>
                    )}
                    
                    {course.durationMinutes && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Video className="w-4 h-4" />
                        <span>{course.durationMinutes} minutos</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}/videos`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Videos
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar curso"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {courses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">No hay cursos creados</p>
                  <p className="text-gray-400 text-sm">
                    Crea tu primer curso para comenzar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadCourses();
        }}
      />
    </>
  );
}


