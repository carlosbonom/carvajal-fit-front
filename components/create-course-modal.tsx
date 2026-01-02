"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { X, Image, Loader2 } from "lucide-react";
import { createCourse, type CreateCourseDto } from "@/services/courses";
import { getCourseCategories, type CourseCategory } from "@/services/course-categories";
import { useAppSelector } from "@/lib/store/hooks";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCourseModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCourseModalProps) {
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [formData, setFormData] = useState<CreateCourseDto>({
    title: "",
    slug: "",
    description: "",
    thumbnailUrl: "",
    isPublished: true,
    creatorId: user?.id || "",
    categoryId: undefined,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCourseCategories();
        setCategories(categoriesData.filter((c) => c.isActive));
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Generar slug automáticamente desde el título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setError("El archivo de miniatura debe ser una imagen");
        return;
      }
      setThumbnailFile(file);
      setFormData({ ...formData, thumbnailFile: file });

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      thumbnailUrl: "",
      isPublished: true,
      creatorId: user?.id || "",
      categoryId: undefined,
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setError(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.id) {
      setError("No se pudo obtener el ID del usuario");
      return;
    }

    if (!formData.title || !formData.slug) {
      setError("El título y el slug son requeridos");
      return;
    }

    try {
      setLoading(true);
      await createCourse({
        ...formData,
        creatorId: user.id,
      });
      onSuccess();
      resetForm();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Error al crear el curso"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              required
              disabled={loading}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={formData.categoryId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryId: e.target.value || undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Portada (Imagen)
            </label>
            <div className="space-y-2">
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                {thumbnailPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={thumbnailPreview}
                      alt="Preview miniatura"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (loading) return;
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                        setFormData({ ...formData, thumbnailFile: undefined });
                        if (thumbnailInputRef.current) {
                          thumbnailInputRef.current.value = "";
                        }
                      }}
                      disabled={loading}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creando..." : "Crear Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
