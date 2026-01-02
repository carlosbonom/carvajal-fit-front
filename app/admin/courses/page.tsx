"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Search, GripVertical, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { AdminSidebar } from "@/components/admin-sidebar";
import { CreateCourseModal } from "@/components/create-course-modal";
import { EditCourseModal } from "@/components/edit-course-modal";
import { getCourses, updateCourseOrder, deleteCourse, type Course } from "@/services/courses";

export default function CoursesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await getCourses();
      // Ordenar cursos por sortOrder
      const sortedCourses = [...coursesData].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });
      setCourses(sortedCourses);
    } catch (error) {
      console.error("Error al cargar cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ordenar cursos por sortOrder
  const sortedCourses = [...courses].sort((a, b) => {
    const orderA = a.sortOrder ?? 999999;
    const orderB = b.sortOrder ?? 999999;
    return orderA - orderB;
  });

  const filteredCourses = sortedCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Estado para cambios pendientes de orden
  const pendingOrderChanges = useRef<Map<string, number>>(new Map());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Función para enviar cambios de orden con debounce
  const saveOrderChanges = useCallback(async () => {
    if (pendingOrderChanges.current.size === 0) return;

    const changesToSave = new Map(pendingOrderChanges.current);
    pendingOrderChanges.current.clear();

    try {
      // Enviar todos los cambios en paralelo
      await Promise.all(
        Array.from(changesToSave.entries()).map(([courseId, sortOrder]) =>
          updateCourseOrder(courseId, sortOrder)
        )
      );
      // Recargar datos para asegurar sincronización
      await loadCourses();
    } catch (error) {
      console.error("Error al actualizar el orden:", error);
      // Recargar datos en caso de error
      await loadCourses();
    }
  }, []);

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener los cursos ordenados actuales (sin filtrar)
      const currentSorted = [...sortedCourses];

      const oldIndex = currentSorted.findIndex((item) => item.id === active.id);
      const newIndex = currentSorted.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(currentSorted, oldIndex, newIndex);

      // Actualizar sortOrder para todos los items afectados
      const updatedItems = newItems.map((item, index) => {
        const newSortOrder = index;
        // Guardar cambio pendiente
        pendingOrderChanges.current.set(item.id, newSortOrder);
        return { ...item, sortOrder: newSortOrder };
      });

      // Actualizar estado inmediatamente (optimistic update)
      setCourses(updatedItems);

      // Limpiar timer anterior y crear uno nuevo
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Enviar cambios después de 500ms de inactividad
      debounceTimer.current = setTimeout(() => {
        saveOrderChanges();
      }, 500);
    }
  };

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Componente de fila arrastrable
  function SortableRow({
    course,
    router,
    setSelectedCourseId,
    setIsEditModalOpen,
    formatDate,
    setCourseToDelete,
    setIsDeleteModalOpen,
    deletingCourseId,
  }: {
    course: Course;
    router: ReturnType<typeof useRouter>;
    setSelectedCourseId: (id: string) => void;
    setIsEditModalOpen: (open: boolean) => void;
    formatDate: (dateString: string | null) => string;
    setCourseToDelete: (course: Course | null) => void;
    setIsDeleteModalOpen: (open: boolean) => void;
    deletingCourseId: string | null;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: course.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`hover:bg-gray-50 transition-colors ${isDragging ? "bg-gray-100" : ""}`}
      >
        <td className="px-6 py-4 w-16">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </div>
        </td>
        <td
          className="px-6 py-4 cursor-pointer"
          onClick={() => router.push(`/admin/courses/${course.id}/videos`)}
        >
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {course.title}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {course.description || "Sin descripción"}
              </div>
            </div>
          </div>
        </td>
        <td
          className="px-6 py-4 whitespace-nowrap cursor-pointer"
          onClick={() => router.push(`/admin/courses/${course.id}/videos`)}
        >
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {course.category?.name || "Sin categoría"}
          </span>
        </td>
        <td
          className="px-6 py-4 whitespace-nowrap cursor-pointer"
          onClick={() => router.push(`/admin/courses/${course.id}/videos`)}
        >
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
              }`}
          >
            {course.isPublished ? "Publicado" : "Borrador"}
          </span>
        </td>
        <td
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
          onClick={() => router.push(`/admin/courses/${course.id}/videos`)}
        >
          {formatDate(course.createdAt)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/courses/${course.id}/videos`);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Ver contenido"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCourseId(course.id);
                setIsEditModalOpen(true);
              }}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar curso"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCourseToDelete(course);
                setIsDeleteModalOpen(true);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deletingCourseId === course.id}
              title="Eliminar curso"
            >
              {deletingCourseId === course.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Cursos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {courses.length} {courses.length === 1 ? "curso" : "cursos"} en total
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nuevo Curso
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="flex items-center justify-center">
                <div className="text-gray-500 text-sm">Cargando cursos...</div>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {searchQuery ? "No se encontraron cursos" : "No hay cursos creados"}
                </p>
                <p className="text-gray-400 text-xs">
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : "Crea tu primer curso para comenzar"}
                </p>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                          <span className="sr-only">Ordenar</span>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Curso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={filteredCourses.map((course) => course.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCourses.map((course) => (
                          <SortableRow
                            key={course.id}
                            course={course}
                            router={router}
                            setSelectedCourseId={setSelectedCourseId}
                            setIsEditModalOpen={setIsEditModalOpen}
                            formatDate={formatDate}
                            setCourseToDelete={setCourseToDelete}
                            setIsDeleteModalOpen={setIsDeleteModalOpen}
                            deletingCourseId={deletingCourseId}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </div>
            </DndContext>
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

      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCourseId(null);
        }}
        onSuccess={() => {
          loadCourses();
        }}
        courseId={selectedCourseId}
      />

      {isDeleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Eliminar curso
              </h2>
              <button
                onClick={() => {
                  if (deletingCourseId) return;
                  setIsDeleteModalOpen(false);
                  setCourseToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!deletingCourseId}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar este curso?
              </p>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {courseToDelete.title}
                </p>
                {courseToDelete.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {courseToDelete.description}
                  </p>
                )}
              </div>
              <p className="text-xs text-red-600">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingCourseId) return;
                  setIsDeleteModalOpen(false);
                  setCourseToDelete(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!deletingCourseId}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!courseToDelete) return;
                  try {
                    setDeletingCourseId(courseToDelete.id);
                    await deleteCourse(courseToDelete.id);
                    await loadCourses();
                    setIsDeleteModalOpen(false);
                    setCourseToDelete(null);
                  } catch (error) {
                    console.error("Error al eliminar curso:", error);
                    alert("No se pudo eliminar el curso. Verifica si tiene contenidos o relaciones asociadas.");
                  } finally {
                    setDeletingCourseId(null);
                  }
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!!deletingCourseId}
              >
                {deletingCourseId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


