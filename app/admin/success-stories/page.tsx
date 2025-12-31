"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Upload, GripVertical } from "lucide-react";
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
import {
  getAllSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  updateSuccessStoryOrder,
  SuccessStory,
} from "@/services/success-stories";
import { uploadFile } from "@/services/files";

export default function SuccessStoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: number;
  }>({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    loadStories();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSuccessStories();
      // Ordenar historias por sortOrder
      const sortedStories = [...response.stories].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });
      setStories(sortedStories);
    } catch (error) {
      console.error("Error al cargar casos de éxito:", error);
      setError("Error al cargar los casos de éxito. Por favor, verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    setFormData({
      name: story.name,
      description: story.description || "",
      imageUrl: story.imageUrl,
      isActive: story.isActive,
      sortOrder: story.sortOrder,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
      sortOrder: stories.length,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleImageUpload = async (file: File, isCreate: boolean = false) => {
    try {
      setUploadingImage(true);
      const result = await uploadFile(file, {
        folder: "success-stories",
        isPublic: true,
      });

      if (isCreate) {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      } else {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert("Error al subir la imagen. Por favor, intenta nuevamente.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateSuccessStory(editingId, formData);
      } else if (isCreating) {
        await createSuccessStory(formData);
      }
      await loadStories();
      handleCancel();
    } catch (error) {
      console.error("Error al guardar caso de éxito:", error);
      alert("Error al guardar el caso de éxito. Por favor, intenta nuevamente.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este caso de éxito?")) {
      return;
    }

    try {
      await deleteSuccessStory(id);
      await loadStories();
    } catch (error) {
      console.error("Error al eliminar caso de éxito:", error);
      alert("Error al eliminar el caso de éxito. Por favor, intenta nuevamente.");
    }
  };

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
        Array.from(changesToSave.entries()).map(([storyId, sortOrder]) =>
          updateSuccessStoryOrder(storyId, sortOrder)
        )
      );
      // Recargar datos para asegurar sincronización
      await loadStories();
    } catch (error) {
      console.error("Error al actualizar el orden:", error);
      // Recargar datos en caso de error
      await loadStories();
    }
  }, []);

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener las historias ordenadas actuales
      const currentSorted = [...stories].sort((a, b) => {
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
      setStories(updatedItems);

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
  function SortableRow({
    story,
    handleEdit,
    handleDelete,
  }: {
    story: SuccessStory;
    handleEdit: (story: SuccessStory) => void;
    handleDelete: (id: string) => void;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: story.id });

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
        <td className="px-4 md:px-6 py-4 w-16">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </div>
        </td>
        <td className="px-4 md:px-6 py-4">
          <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-gray-300">
            <img
              src={story.imageUrl}
              alt={story.name}
              className="w-full h-full object-cover"
            />
          </div>
        </td>
        <td className="px-4 md:px-6 py-4">
          <div className="text-sm font-medium text-gray-900">
            {story.name}
          </div>
        </td>
        <td className="px-4 md:px-6 py-4">
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {story.description || "Sin descripción"}
          </div>
        </td>
        <td className="px-4 md:px-6 py-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${story.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
              }`}
          >
            {story.isActive ? "Activo" : "Inactivo"}
          </span>
        </td>
        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleEdit(story)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(story.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
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
        <div className="p-4 md:p-8">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Casos de Éxito
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Administra los casos de éxito que se muestran en la página principal
              </p>
            </div>
            {!isCreating && !editingId && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nuevo Caso de Éxito
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando casos de éxito...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadStories}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(isCreating || editingId) && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {editingId ? "Editar Caso de Éxito" : "Nuevo Caso de Éxito"}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Transformación real de un miembro del club"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen *
                      </label>
                      <div className="flex items-center gap-4">
                        {formData.imageUrl && (
                          <div className="relative w-32 h-40 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            ref={editingId ? fileInputRef : createFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, isCreating);
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingId) {
                                fileInputRef.current?.click();
                              } else {
                                createFileInputRef.current?.click();
                              }
                            }}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {uploadingImage ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                {formData.imageUrl ? "Cambiar Imagen" : "Subir Imagen"}
                              </>
                            )}
                          </button>
                          {formData.imageUrl && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              {formData.imageUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orden
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.sortOrder}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sortOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mt-6">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) =>
                              setFormData({ ...formData, isActive: e.target.checked })
                            }
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Activo
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={!formData.name || !formData.imageUrl || uploadingImage}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                            <span className="sr-only">Ordenar</span>
                          </th>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Imagen
                          </th>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <SortableContext
                        items={stories.map((story) => story.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <tbody className="bg-white divide-y divide-gray-200">
                          {stories.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 md:px-6 py-8 text-center text-gray-500">
                                No hay casos de éxito configurados
                              </td>
                            </tr>
                          ) : (
                            stories.map((story) => (
                              <SortableRow
                                key={story.id}
                                story={story}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                              />
                            ))
                          )}
                        </tbody>
                      </SortableContext>
                    </table>
                  </div>
                </div>
              </DndContext>
            </div>
          )}
        </div>
      </main>
    </>
  );
}






