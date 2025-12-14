"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { X, Image, Video, Loader2 } from "lucide-react";
import { updateCourse, getCourseById, type UpdateCourseDto, type Course } from "@/services/courses";
import { useAppSelector } from "@/lib/store/hooks";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string | null;
}

export function EditCourseModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
}: EditCourseModalProps) {
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const trailerInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<UpdateCourseDto>({
    title: "",
    slug: "",
    description: "",
    thumbnailUrl: "",
    trailerUrl: "",
    level: null,
    durationMinutes: null,
    isPublished: false,
    sortOrder: null,
    creatorId: user?.id || null,
  });

  // Cargar datos del curso cuando se abre el modal
  useEffect(() => {
    if (isOpen && courseId) {
      loadCourseData();
    }
  }, [isOpen, courseId]);

  const loadCourseData = async () => {
    if (!courseId) return;

    try {
      setLoadingCourse(true);
      setError(null);
      const course = await getCourseById(courseId);
      
      setFormData({
        title: course.title || "",
        slug: course.slug || "",
        description: course.description || "",
        thumbnailUrl: course.thumbnailUrl || "",
        trailerUrl: course.trailerUrl || "",
        level: course.level,
        durationMinutes: course.durationMinutes,
        isPublished: course.isPublished,
        sortOrder: course.sortOrder,
        creatorId: course.creator?.id || null,
      });

      // Establecer previews de las URLs existentes
      if (course.thumbnailUrl) {
        setThumbnailPreview(course.thumbnailUrl);
      }
      if (course.trailerUrl) {
        setTrailerPreview(course.trailerUrl);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cargar los datos del curso"
      );
    } finally {
      setLoadingCourse(false);
    }
  };

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

  const handleTrailerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea un video
      if (!file.type.startsWith("video/")) {
        setError("El archivo de trailer debe ser un video");
        return;
      }
      setTrailerFile(file);
      setFormData({ ...formData, trailerFile: file });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrailerPreview(reader.result as string);
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
      trailerUrl: "",
      level: null,
      durationMinutes: null,
      isPublished: false,
      sortOrder: null,
      creatorId: user?.id || null,
    });
    setThumbnailFile(null);
    setTrailerFile(null);
    setThumbnailPreview(null);
    setTrailerPreview(null);
    setError(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
    if (trailerInputRef.current) {
      trailerInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseId) {
      setError("No se pudo obtener el ID del curso");
      return;
    }

    if (!formData.title || !formData.slug) {
      setError("El título y el slug son requeridos");
      return;
    }

    try {
      setLoading(true);
      await updateCourse(courseId, formData);
      onSuccess();
      resetForm();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al actualizar el curso"
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
          <h2 className="text-2xl font-bold text-gray-900">Editar Curso</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading || loadingCourse}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loadingCourse ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <div className="text-gray-500 text-sm">Cargando datos del curso...</div>
          </div>
        ) : (
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
                disabled={loading || loadingCourse}
              />
            </div>

            {/* <div>
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
              <p className="mt-1 text-xs text-gray-500">
                URL amigable (solo minúsculas, números y guiones)
              </p>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingCourse}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Miniatura (Imagen)
                </label>
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
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
                            setThumbnailFile(null);
                            setThumbnailPreview(null);
                            setFormData({ ...formData, thumbnailFile: undefined, thumbnailUrl: "" });
                            if (thumbnailInputRef.current) {
                              thumbnailInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (cualquier imagen)</p>
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
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trailer (Video)
                </label>
                <div className="space-y-2">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 transition-colors ${loading || loadingCourse ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                  {trailerPreview ? (
                    <div className="relative w-full h-full">
                      <video
                        src={trailerPreview}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (loading || loadingCourse) return;
                          setTrailerFile(null);
                          setTrailerPreview(null);
                          setFormData({ ...formData, trailerFile: undefined, trailerUrl: "" });
                          if (trailerInputRef.current) {
                            trailerInputRef.current.value = "";
                          }
                        }}
                        disabled={loading || loadingCourse}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Video className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">MP4, AVI, MOV, WEBM (cualquier video)</p>
                    </div>
                  )}
                  <input
                    ref={trailerInputRef}
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleTrailerChange}
                    disabled={loading || loadingCourse}
                  />
                </label>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={loading}
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                Publicar curso
              </label>
            </div> */}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || loadingCourse}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || loadingCourse}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

