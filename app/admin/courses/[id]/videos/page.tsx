"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit, Trash2, Video, FileText, Image, Music, Link as LinkIcon, Lock, Unlock, Eye, Loader2, GripVertical, X } from "lucide-react";
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
import { AddContentModal } from "@/components/add-content-modal";
import { EditContentModal } from "@/components/edit-content-modal";
import { AddResourceModal } from "@/components/add-resource-modal";
import { getCourseById, getCourseContent, updateContentStatus, updateContentOrder, deleteContentResource, deleteCourseContent, type Course, type CourseContent } from "@/services/courses";

export default function CourseVideosPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);
  const [updatingContentId, setUpdatingContentId] = useState<string | null>(null);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [selectedContentForResource, setSelectedContentForResource] = useState<CourseContent | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [expandedContentId, setExpandedContentId] = useState<string | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [addContentProgress, setAddContentProgress] = useState<number | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<string | null>(null);
  const [contentToDelete, setContentToDelete] = useState<CourseContent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, contentData] = await Promise.all([
        getCourseById(courseId),
        getCourseContent(courseId),
      ]);
      setCourse(courseData);
      // Ordenar contenido por sortOrder
      const sortedContent = [...contentData].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });
      setContent(sortedContent);
    } catch (error) {
      console.error("Error al cargar datos del curso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (contentId: string, currentStatus: boolean) => {
    setUpdatingContentId(contentId);
    try {
      const updatedContent = await updateContentStatus(contentId, !currentStatus);
      setContent((prevContent) =>
        prevContent.map((item) =>
          item.id === contentId ? updatedContent : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del contenido:", error);
      // Recargar datos en caso de error
      loadCourseData();
    } finally {
      setUpdatingContentId(null);
    }
  };

  const handleDeleteResource = async (contentId: string, resourceId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este recurso?")) {
      return;
    }

    setDeletingResourceId(resourceId);
    try {
      await deleteContentResource(contentId, resourceId);
      loadCourseData();
    } catch (error) {
      console.error("Error al eliminar recurso:", error);
      alert("Error al eliminar el recurso. Por favor, intenta nuevamente.");
    } finally {
      setDeletingResourceId(null);
    }
  };

  const handleDeleteContent = (item: CourseContent) => {
    setContentToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteContent = async () => {
    if (!contentToDelete) return;

    const contentId = contentToDelete.id;
    setDeletingContentId(contentId);
    try {
      await deleteCourseContent(contentId);
      await loadCourseData();
      setIsDeleteModalOpen(false);
      setContentToDelete(null);
    } catch (error) {
      console.error("Error al eliminar contenido:", error);
      alert("Error al eliminar el contenido. Por favor, intenta nuevamente.");
    } finally {
      setDeletingContentId(null);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "pdf":
      case "document":
        return <FileText className="w-5 h-5" />;
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      case "link":
        return <LinkIcon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

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

  // Ordenar contenido por sortOrder
  const sortedContent = [...content].sort((a, b) => {
    const orderA = a.sortOrder ?? 999999;
    const orderB = b.sortOrder ?? 999999;
    return orderA - orderB;
  });

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

    const changes = Array.from(pendingOrderChanges.current.entries());
    const changesToSave = new Map(pendingOrderChanges.current);
    pendingOrderChanges.current.clear();

    try {
      // Enviar todos los cambios en paralelo
      await Promise.all(
        Array.from(changesToSave.entries()).map(([contentId, sortOrder]) =>
          updateContentOrder(contentId, sortOrder)
        )
      );
      // Recargar datos para asegurar sincronización
      const [courseData, contentData] = await Promise.all([
        getCourseById(courseId),
        getCourseContent(courseId),
      ]);
      setCourse(courseData);
      // Ordenar contenido por sortOrder
      const sortedContent = [...contentData].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });
      setContent(sortedContent);
    } catch (error) {
      console.error("Error al actualizar el orden:", error);
      // Recargar datos en caso de error
      loadCourseData();
    }
  }, [courseId]);

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener el contenido ordenado actual
      const currentSorted = [...content].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });

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
      setContent(updatedItems);

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

  // Componente de fila arrastrable
  function SortableRow({ item }: { item: CourseContent }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const isExpanded = expandedContentId === item.id;
    const hasResources = item.resources && item.resources.length > 0;

    return (
      <>
        <tr
          ref={setNodeRef}
          style={style}
          className={`hover:bg-gray-50 ${isDragging ? "bg-gray-100" : ""}`}
        >
          <td className="px-6 py-4 w-16">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center justify-center"
            >
              <GripVertical className="w-5 h-5" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {getContentTypeIcon(item.contentType)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
              {item.contentType}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-900">
              {formatUnlock(item.unlockValue, item.unlockType)}
            </span>
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
                {hasResources && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedContentId(isExpanded ? null : item.id);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full w-fit hover:bg-purple-200 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    Recursos ({item.resources.length})
                  </button>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedContentForResource(item);
                  setIsAddResourceModalOpen(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Agregar recurso"
              >
                <Plus className="w-4 h-4" />
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
                onClick={() => handleDeleteContent(item)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar contenido"
                disabled={deletingContentId === item.id}
              >
                {deletingContentId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && hasResources && (
          <tr>
            <td colSpan={6} className="px-6 py-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Recursos del contenido</h4>
                  <button
                    onClick={() => {
                      setSelectedContentForResource(item);
                      setIsAddResourceModalOpen(true);
                    }}
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    + Agregar recurso
                  </button>
                </div>
                <div className="space-y-2">
                  {item.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <a
                          href={resource.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {resource.title}
                        </a>
                        {resource.description && (
                          <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteResource(item.id, resource.id)}
                        disabled={deletingResourceId === resource.id}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Eliminar recurso"
                      >
                        {deletingResourceId === resource.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <button
            onClick={() => router.push("/admin/courses")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Cursos
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando contenido del curso...</div>
            </div>
          ) : course ? (
            <>
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {course.title}
                    </h1>
                    <p className="text-gray-600">
                      {course.description || "Sin descripción"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    disabled={isAddingContent}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAddingContent ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {addContentProgress !== null
                          ? `Subiendo ${addContentProgress}%`
                          : "Agregando contenido..."}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Agregar Contenido
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {course.level && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      {course.level === "beginner" && "Principiante"}
                      {course.level === "intermediate" && "Intermedio"}
                      {course.level === "advanced" && "Avanzado"}
                    </span>
                  )}
                  {course.durationMinutes && (
                    <span>{course.durationMinutes} minutos totales</span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full ${
                      course.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.isPublished ? "Publicado" : "Borrador"}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Contenido del Curso ({content.length})
                  </h2>
                </div>

                {sortedContent.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg mb-2">No hay contenido en este curso</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Agrega contenido para comenzar
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      disabled={isAddingContent}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isAddingContent
                        ? addContentProgress !== null
                          ? `Subiendo ${addContentProgress}%`
                          : "Agregando contenido..."
                        : "Agregar Primer Contenido"}
                    </button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                            <span className="sr-only">Ordenar</span>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contenido
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
                        <SortableContext
                          items={sortedContent.map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sortedContent.map((item) => (
                              <SortableRow key={item.id} item={item} />
                            ))}
                          </tbody>
                        </SortableContext>
                      </table>
                    </div>
                  </DndContext>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Curso no encontrado</p>
            </div>
          )}
        </div>
      </main>

      {courseId && (
        <>
          <AddContentModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
              loadCourseData();
            }}
            courseId={courseId}
            onLoadingChange={setIsAddingContent}
            onUploadProgressChange={setAddContentProgress}
          />
          <EditContentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedContent(null);
            }}
            onSuccess={() => {
              loadCourseData();
            }}
            content={selectedContent}
          />
          <AddResourceModal
            isOpen={isAddResourceModalOpen}
            onClose={() => {
              setIsAddResourceModalOpen(false);
              setSelectedContentForResource(null);
            }}
            onSuccess={() => {
              loadCourseData();
            }}
            contentId={selectedContentForResource?.id || ""}
          />
          {isDeleteModalOpen && contentToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Eliminar contenido
                  </h2>
                  <button
                    onClick={() => {
                      if (deletingContentId) return;
                      setIsDeleteModalOpen(false);
                      setContentToDelete(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!deletingContentId}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <p className="text-sm text-gray-700">
                    ¿Seguro que quieres eliminar este contenido del curso?
                  </p>
                  <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {contentToDelete.title}
                    </p>
                    {contentToDelete.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {contentToDelete.description}
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
                      if (deletingContentId) return;
                      setIsDeleteModalOpen(false);
                      setContentToDelete(null);
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!!deletingContentId}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteContent}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={!!deletingContentId}
                  >
                    {deletingContentId ? (
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
      )}
    </>
  );
}


