"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { addCourseContent, type AddCourseContentDto } from "@/services/courses";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
}

export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
}: AddContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Omit<AddCourseContentDto, "file">>({
    title: "",
    slug: "",
    description: "",
    contentType: "video",
    unlockMonth: 1,
    thumbnailUrl: "",
    durationSeconds: 0,
    sortOrder: 1,
    hasResources: false,
    resourcesUrl: null,
    isPreview: false,
  });

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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validar tamaño máximo (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError("El archivo no puede ser mayor a 100MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.slug) {
      setError("El título y el slug son requeridos");
      return;
    }

    if (!selectedFile && !formData.contentUrl) {
      setError("Debes proporcionar un archivo o una URL de contenido");
      return;
    }

    try {
      setLoading(true);
      await addCourseContent(courseId, {
        ...formData,
        file: selectedFile || undefined,
      });
      onSuccess();
      onClose();
      // Resetear formulario
      setFormData({
        title: "",
        slug: "",
        description: "",
        contentType: "video",
        unlockMonth: 1,
        thumbnailUrl: "",
        durationSeconds: 0,
        sortOrder: 1,
        hasResources: false,
        resourcesUrl: null,
        isPreview: false,
      });
      setSelectedFile(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al agregar contenido"
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
          <h2 className="text-2xl font-bold text-gray-900">Agregar Contenido</h2>
          <button
            onClick={onClose}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
              pattern="[a-z0-9-]+"
              title="Solo minúsculas, números y guiones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Contenido <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.contentType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contentType: e.target.value as AddCourseContentDto["contentType"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="video">Video</option>
              <option value="image">Imagen</option>
              <option value="pdf">PDF</option>
              <option value="document">Documento</option>
              <option value="audio">Audio</option>
              <option value="link">Enlace</option>
              <option value="text">Texto</option>
            </select>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo (máximo 100MB) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
              accept="video/*,image/*,application/pdf,.doc,.docx,audio/*"
            />
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-600">
                Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              O proporciona una URL de contenido en el campo siguiente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Contenido (alternativa al archivo)
            </label>
            <input
              type="url"
              value={formData.contentUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, contentUrl: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
              placeholder="https://ejemplo.com/contenido.mp4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes de Desbloqueo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.unlockMonth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unlockMonth: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (segundos)
              </label>
              <input
                type="number"
                value={formData.durationSeconds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationSeconds: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Miniatura
              </label>
              <input
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) =>
                  setFormData({ ...formData, thumbnailUrl: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de Recursos
            </label>
            <input
              type="url"
              value={formData.resourcesUrl || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resourcesUrl: e.target.value || null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasResources"
                checked={formData.hasResources}
                onChange={(e) =>
                  setFormData({ ...formData, hasResources: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="hasResources" className="ml-2 text-sm text-gray-700">
                Tiene recursos
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPreview"
                checked={formData.isPreview}
                onChange={(e) =>
                  setFormData({ ...formData, isPreview: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="isPreview" className="ml-2 text-sm text-gray-700">
                Vista previa (disponible sin suscripción)
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Agregando..." : "Agregar Contenido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


