"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { X, Upload, File as FileIcon, Image, Video, FileText, Music, Loader2 } from "lucide-react";
import { addCourseContent, type AddCourseContentDto } from "@/services/courses";
import { uploadFile } from "@/services/files";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
}

// Función para detectar el tipo de contenido basado en el tipo de archivo
const detectContentType = (file: File): AddCourseContentDto["contentType"] => {
  const mimeType = file.type;
  
  if (mimeType.startsWith("video/")) {
    return "video";
  } else if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType === "application/pdf") {
    return "pdf";
  } else if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    mimeType.includes("text") ||
    file.name.endsWith(".doc") ||
    file.name.endsWith(".docx")
  ) {
    return "document";
  } else if (mimeType.startsWith("audio/")) {
    return "audio";
  } else {
    return "document"; // Por defecto
  }
};

// Función para obtener el icono según el tipo de contenido
const getContentIcon = (contentType: AddCourseContentDto["contentType"]) => {
  switch (contentType) {
    case "video":
      return Video;
    case "image":
      return Image;
    case "pdf":
      return FileText;
    case "document":
      return FileText;
    case "audio":
      return Music;
    default:
      return FileIcon;
  }
};


export function AddContentModal({
  isOpen,
  onClose,
  onSuccess,
  courseId,
}: AddContentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePreviewUrlRef = useRef<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const thumbnailPreviewUrlRef = useRef<string | null>(null);
  const [isAvailableImmediately, setIsAvailableImmediately] = useState(true);
  const [unlockValue, setUnlockValue] = useState(1);
  const [unlockType, setUnlockType] = useState<"immediate" | "day" | "week" | "month" | "year">("month");
  const [formData, setFormData] = useState<Omit<AddCourseContentDto, "file">>({
    title: "",
    slug: "",
    description: "",
    contentType: "video",
    unlockValue: 0,
    unlockType: "immediate",
    availabilityType: "none",
    thumbnailUrl: "",
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
      // Validar tamaño máximo (2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        setError("El archivo no puede ser mayor a 2GB");
        return;
      }
      
      // Limpiar preview anterior si existe
      if (filePreviewUrlRef.current) {
        URL.revokeObjectURL(filePreviewUrlRef.current);
        filePreviewUrlRef.current = null;
      }
      
      // Detectar tipo de contenido automáticamente
      const detectedType = detectContentType(file);
      
      setSelectedFile(file);
      setFormData({
        ...formData,
        contentType: detectedType,
      });
      setError(null);
      
      // Crear preview usando createObjectURL para archivos grandes (más eficiente)
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const objectUrl = URL.createObjectURL(file);
        filePreviewUrlRef.current = objectUrl;
        setFilePreview(objectUrl);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        setError("El archivo de miniatura debe ser una imagen");
        return;
      }
      
      // Limpiar preview anterior si existe
      if (thumbnailPreviewUrlRef.current) {
        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
        thumbnailPreviewUrlRef.current = null;
      }
      
      setThumbnailFile(file);
      
      // Crear preview usando createObjectURL
      const objectUrl = URL.createObjectURL(file);
      thumbnailPreviewUrlRef.current = objectUrl;
      setThumbnailPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title) {
      setError("El título es requerido");
      return;
    }

    if (!selectedFile) {
      setError("Debes seleccionar un archivo");
      return;
    }

    try {
      setLoading(true);
      
      // Subir miniatura primero si existe
      let thumbnailUrl: string | undefined = undefined;
      if (thumbnailFile) {
        try {
          const uploadResponse = await uploadFile(thumbnailFile, {
            folder: "imagenes",
            isPublic: true,
          });
          thumbnailUrl = uploadResponse.url;
        } catch (error) {
          throw new Error("Error al subir la miniatura: " + (error as Error).message);
        }
      } else if (formData.thumbnailUrl && formData.thumbnailUrl.trim() !== "") {
        // Si hay una URL existente y no está vacía, usarla
        thumbnailUrl = formData.thumbnailUrl;
      }

      // Asegurar que unlockValue sea 0 y unlockType sea "immediate" si está disponible de inmediato
      const finalUnlockValue = isAvailableImmediately ? 0 : unlockValue;
      const finalUnlockType = isAvailableImmediately ? "immediate" : unlockType;
      const finalAvailabilityType = isAvailableImmediately ? "none" : formData.availabilityType;

      await addCourseContent(courseId, {
        ...formData,
        unlockValue: finalUnlockValue,
        unlockType: finalUnlockType,
        availabilityType: finalAvailabilityType,
        thumbnailUrl,
        file: selectedFile,
      });
      onSuccess();
      resetForm();
      onClose();
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

  const resetForm = () => {
    // Limpiar URLs blob
    if (filePreviewUrlRef.current) {
      URL.revokeObjectURL(filePreviewUrlRef.current);
      filePreviewUrlRef.current = null;
    }
    if (thumbnailPreviewUrlRef.current) {
      URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      thumbnailPreviewUrlRef.current = null;
    }
    
    setFormData({
      title: "",
      slug: "",
      description: "",
      contentType: "video",
      unlockValue: 0,
      unlockType: "immediate",
      availabilityType: "none",
      thumbnailUrl: "",
    });
    setIsAvailableImmediately(true);
    setUnlockValue(1);
    setUnlockType("month");
    setSelectedFile(null);
    setFilePreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  // Limpiar URLs blob cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (filePreviewUrlRef.current) {
        URL.revokeObjectURL(filePreviewUrlRef.current);
      }
      if (thumbnailPreviewUrlRef.current) {
        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Agregar Contenido</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              Contenido <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                {filePreview ? (
                  <div className="relative w-full h-full">
                    {formData.contentType === "image" ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : formData.contentType === "video" ? (
                      <video
                        src={filePreview}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        {(() => {
                          const Icon = getContentIcon(formData.contentType);
                          return <Icon className="w-12 h-12 text-gray-400 mb-2" />;
                        })()}
                        <p className="text-sm text-gray-600 font-medium">{selectedFile?.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (loading) return;
                        // Limpiar URL blob
                        if (filePreviewUrlRef.current) {
                          URL.revokeObjectURL(filePreviewUrlRef.current);
                          filePreviewUrlRef.current = null;
                        }
                        setSelectedFile(null);
                        setFilePreview(null);
                        setFormData({ ...formData, contentType: "video" });
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
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
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-gray-500">
                      Video, Imagen, PDF, Documento, Audio (máx. 2GB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="video/*,image/*,application/pdf,.doc,.docx,audio/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Tipo detectado:</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium capitalize">
                    {formData.contentType === "video" && "Video"}
                    {formData.contentType === "image" && "Imagen"}
                    {formData.contentType === "pdf" && "PDF"}
                    {formData.contentType === "document" && "Documento"}
                    {formData.contentType === "audio" && "Audio"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Disponibilidad
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Disponible de inmediato
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    El contenido estará disponible desde el inicio de la suscripción
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailableImmediately}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsAvailableImmediately(checked);
                      setFormData({
                        ...formData,
                        unlockValue: checked ? 0 : unlockValue,
                        unlockType: checked ? "immediate" : unlockType,
                        availabilityType: checked ? "none" : formData.availabilityType || "none",
                      });
                    }}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {!isAvailableImmediately && (
                <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    Desbloqueo programado
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    El contenido se desbloqueará después del tiempo especificado desde la suscripción del usuario
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={unlockValue}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          setUnlockValue(value);
                          setFormData({
                            ...formData,
                            unlockValue: value,
                            unlockType: unlockType,
                          });
                        }}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        required={!isAvailableImmediately}
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={unlockType}
                        onChange={(e) => {
                          const type = e.target.value as "immediate" | "day" | "week" | "month" | "year";
                          setUnlockType(type);
                          setFormData({
                            ...formData,
                            unlockValue: unlockValue,
                            unlockType: type,
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        required={!isAvailableImmediately}
                        disabled={loading}
                      >
                        <option value="day">Día(s)</option>
                        <option value="week">Semana(s)</option>
                        <option value="month">Mes(es)</option>
                        <option value="year">Año(s)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Miniatura (Imagen)
            </label>
            <div className="space-y-2">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
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
                        // Limpiar URL blob
                        if (thumbnailPreviewUrlRef.current) {
                          URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
                          thumbnailPreviewUrlRef.current = null;
                        }
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
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
              {loading ? "Agregando..." : "Agregar Contenido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


