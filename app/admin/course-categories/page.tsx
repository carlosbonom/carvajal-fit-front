"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FolderTree, Plus, Edit, Trash2, Search, Loader2, X, GripVertical } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";
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
import {
  getCourseCategories,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  updateCourseCategoryOrder,
  type CourseCategory,
  type CreateCourseCategoryDto,
  type UpdateCourseCategoryDto,
} from "@/services/course-categories";

export default function CourseCategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CourseCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCourseCategories();
      // Ordenar categorías por sortOrder
      const sortedCategories = [...categoriesData].sort((a, b) => {
        const orderA = a.sortOrder ?? 999999;
        const orderB = b.sortOrder ?? 999999;
        return orderA - orderB;
      });
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ordenar categorías por sortOrder
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.sortOrder ?? 999999;
    const orderB = b.sortOrder ?? 999999;
    return orderA - orderB;
  });

  const filteredCategories = sortedCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        Array.from(changesToSave.entries()).map(([categoryId, sortOrder]) =>
          updateCourseCategoryOrder(categoryId, sortOrder)
        )
      );
      // Recargar datos para asegurar sincronización
      await loadCategories();
    } catch (error) {
      console.error("Error al actualizar el orden:", error);
      // Recargar datos en caso de error
      await loadCategories();
    }
  }, []);

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Obtener las categorías ordenadas actuales (sin filtrar)
      const currentSorted = [...sortedCategories];

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
      setCategories(updatedItems);

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

  const handleCreate = async (data: any) => {
    try {
      setSaving(true);
      await createCourseCategory(data);
      await loadCategories();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedCategory) return;
    try {
      setSaving(true);
      await updateCourseCategory(selectedCategory.id, data);
      await loadCategories();
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeletingCategoryId(categoryToDelete.id);
      await deleteCourseCategory(categoryToDelete.id);
      await loadCategories();
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      alert("No se pudo eliminar la categoría. Verifica si tiene cursos asociados.");
    } finally {
      setDeletingCategoryId(null);
    }
  };

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
                Categorías de Cursos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {categories.length} {categories.length === 1 ? "categoría" : "categorías"} en total
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Nueva Categoría
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar categorías..."
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
                <div className="text-gray-500 text-sm">Cargando categorías...</div>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <div className="text-center">
                <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {searchQuery ? "No se encontraron categorías" : "No hay categorías creadas"}
                </p>
                <p className="text-gray-400 text-xs">
                  {searchQuery
                    ? "Intenta con otros términos de búsqueda"
                    : "Crea tu primera categoría para comenzar"}
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
                          Nombre
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
                      items={filteredCategories.map((category) => category.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map((category) => (
                          <SortableRow
                            key={category.id}
                            category={category}
                            setSelectedCategory={setSelectedCategory}
                            setIsEditModalOpen={setIsEditModalOpen}
                            setCategoryToDelete={setCategoryToDelete}
                            setIsDeleteModalOpen={setIsDeleteModalOpen}
                            deletingCategoryId={deletingCategoryId}
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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreate}
          saving={saving}
          categories={categories}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCategory && (
        <CategoryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleUpdate}
          category={selectedCategory}
          saving={saving}
          categories={categories}
        />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Eliminar categoría</h2>
              <button
                onClick={() => {
                  if (deletingCategoryId) return;
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!deletingCategoryId}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar esta categoría?
              </p>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-sm font-medium text-gray-900">{categoryToDelete.name}</p>
                {categoryToDelete.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {categoryToDelete.description}
                  </p>
                )}
              </div>
              <p className="text-xs text-red-600">
                Esta acción no se puede deshacer. Los cursos asociados perderán su categoría.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (deletingCategoryId) return;
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!deletingCategoryId}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={!!deletingCategoryId}
              >
                {deletingCategoryId ? (
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

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  saving,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCourseCategoryDto | UpdateCourseCategoryDto) => Promise<void>;
  category?: CourseCategory;
  saving: boolean;
  categories: CourseCategory[];
}) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [parentId, setParentId] = useState<string | null>(category?.parentId || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setIsActive(category.isActive);
      setParentId(category.parentId || null);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
      setParentId(null);
    }
    setErrors({});
  }, [category, isOpen]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!category) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    if (!slug.trim()) {
      newErrors.slug = "El slug es requerido";
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug = "El slug debe contener solo letras minúsculas, números y guiones";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data: CreateCourseCategoryDto | UpdateCourseCategoryDto = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        isActive,
        parentId: parentId || undefined,
      };
      await onSave(data);
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Error al guardar la categoría" });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Ej: Entrenamiento de Fuerza"
              disabled={saving}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Descripción opcional de la categoría"
              rows={3}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría Padre (Opcional)
            </label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={saving}
            >
              <option value="">Sin categoría padre (Categoría principal)</option>
              {categories
                .filter((cat) => cat.id !== category?.id) // No permitir que sea su propio padre
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={saving}
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortableRow({
  category,
  setSelectedCategory,
  setIsEditModalOpen,
  setCategoryToDelete,
  setIsDeleteModalOpen,
  deletingCategoryId,
}: {
  category: CourseCategory;
  setSelectedCategory: (category: CourseCategory) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setCategoryToDelete: (category: CourseCategory) => void;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  deletingCategoryId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "bg-gray-50 z-10 shadow-sm" : "bg-white"} hover:bg-gray-50 transition-colors`}
    >
      <td className="px-6 py-4 whitespace-nowrap w-16">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded transition-colors"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{category.name}</span>
          {category.description && (
            <span className="text-xs text-gray-500 truncate max-w-xs">
              {category.description}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {category.isActive ? "Activa" : "Inactiva"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setSelectedCategory(category);
              setIsEditModalOpen(true);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar categoría"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCategoryToDelete(category);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar categoría"
            disabled={deletingCategoryId === category.id}
          >
            {deletingCategoryId === category.id ? (
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

