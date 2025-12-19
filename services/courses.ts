import { apiAxios } from "@/lib/axios-config";
import { uploadFile } from "./files";

// Tipos para crear curso
export interface CreateCourseDto {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  thumbnailFile?: File;
  trailerFile?: File;
  level?: "beginner" | "intermediate" | "advanced";
  durationMinutes?: number;
  isPublished?: boolean;
  sortOrder?: number;
  creatorId?: string;
}

export interface Creator {
  id: string;
  name: string;
  slug: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  durationMinutes: number | null;
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder: number | null;
  metadata: Record<string, any> | null;
  creator: Creator;
  createdAt: string;
  updatedAt: string;
}

// Tipos para agregar contenido al curso
export interface AddCourseContentDto {
  title: string;
  slug?: string; // Opcional
  description?: string;
  contentType: "video" | "image" | "pdf" | "document" | "audio" | "link" | "text";
  unlockValue: number; // Valor numérico (≥ 0)
  unlockType: "immediate" | "day" | "week" | "month" | "year"; // Tipo de desbloqueo
  availabilityType?: "none" | "month" | "day" | "week"; // Opcional (default: "none")
  thumbnailUrl?: string;
  durationSeconds?: number;
  sortOrder?: number;
  isPreview?: boolean;
  // Opción A: Subir archivo
  file?: File;
  // Opción B: URL del contenido
  contentUrl?: string;
}

export interface CourseContent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  contentType: "video" | "image" | "pdf" | "document" | "audio" | "link" | "text";
  unlockValue: number;
  unlockType: "immediate" | "day" | "week" | "month" | "year";
  contentUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number | null;
  availabilityType: "none" | "month" | "day" | "week";
  resources: ContentResource[];
  isPreview: boolean;
  isActive: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

// GET /courses - Obtener todos los cursos
export const getCourses = async (): Promise<Course[]> => {
  const response = await apiAxios.get<Course[]>("/courses");

  return response.data;
};

// GET /courses/:id - Obtener un curso por ID
export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await apiAxios.get<Course>(`/courses/${courseId}`);

  return response.data;
};

// GET /courses/:id/content - Obtener contenido de un curso
export const getCourseContent = async (
  courseId: string,
): Promise<CourseContent[]> => {
  const response = await apiAxios.get<CourseContent[]>(
    `/courses/${courseId}/content`,
  );

  return response.data;
};

// POST /courses - Crear curso
export const createCourse = async (
  data: CreateCourseDto,
): Promise<Course> => {
  let thumbnailUrl = data.thumbnailUrl;
  let trailerUrl = data.trailerUrl;

  // Subir archivos primero si existen
  if (data.thumbnailFile) {
    try {
      const uploadResponse = await uploadFile(data.thumbnailFile, {
        folder: "imagenes",
        isPublic: true,
      });
      thumbnailUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la miniatura: " + (error as Error).message);
    }
  }

  if (data.trailerFile) {
    try {
      const uploadResponse = await uploadFile(data.trailerFile, {
        folder: "videos",
        isPublic: true,
      });
      trailerUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el trailer: " + (error as Error).message);
    }
  }

  // Crear el curso con las URLs obtenidas
  // Convertir strings vacíos a null para que el backend no valide URLs vacías
  const courseData: Omit<CreateCourseDto, "thumbnailFile" | "trailerFile"> = {
    title: data.title,
    slug: data.slug,
    description: data.description || undefined,
    thumbnailUrl: thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl : undefined,
    trailerUrl: trailerUrl && trailerUrl.trim() !== "" ? trailerUrl : undefined,
    level: data.level,
    durationMinutes: data.durationMinutes,
    isPublished: data.isPublished,
    sortOrder: data.sortOrder,
  };

  const response = await apiAxios.post<Course>("/courses", courseData);

  return response.data;
};

// POST /courses/{courseId}/content - Agregar contenido a un curso
export const addCourseContent = async (
  courseId: string,
  data: AddCourseContentDto,
): Promise<CourseContent> => {
  let contentUrl = data.contentUrl;

  // Subir archivo primero si existe
  if (data.file) {
    try {
      // Determinar la carpeta según el tipo de contenido
      let folder = "videos";
      if (data.contentType === "image") {
        folder = "imagenes";
      } else if (data.contentType === "pdf" || data.contentType === "document") {
        folder = "documentos";
      } else if (data.contentType === "audio") {
        folder = "audio";
      }

      const uploadResponse = await uploadFile(data.file, {
        folder,
        isPublic: true,
      });
      contentUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el archivo: " + (error as Error).message);
    }
  }

  // Preparar los datos para enviar
  // Convertir strings vacíos a undefined para que el backend no valide URLs vacías
  const requestData: Omit<AddCourseContentDto, "file"> = {
    title: data.title,
    slug: data.slug,
    description: data.description || undefined,
    contentType: data.contentType,
    unlockValue: data.unlockValue,
    unlockType: data.unlockType,
    availabilityType: data.availabilityType,
    contentUrl,
    thumbnailUrl: data.thumbnailUrl && data.thumbnailUrl.trim() !== "" ? data.thumbnailUrl : undefined,
    durationSeconds: data.durationSeconds,
    sortOrder: data.sortOrder,
    isPreview: data.isPreview,
  };

  // Enviar como JSON
  const response = await apiAxios.post<CourseContent>(
    `/courses/${courseId}/content`,
    requestData,
  );

  return response.data;
};

// PATCH /courses/content/{contentId}/status - Actualizar estado activo del contenido
export const updateContentStatus = async (
  contentId: string,
  isActive: boolean,
): Promise<CourseContent> => {
  const response = await apiAxios.patch<CourseContent>(
    `/courses/content/${contentId}/status`,
    { isActive },
  );

  return response.data;
};

// DELETE /courses/content/{contentId} - Eliminar contenido
export const deleteCourseContent = async (contentId: string): Promise<void> => {
  await apiAxios.delete(`/courses/content/${contentId}`);
};

// PATCH /courses/content/{contentId} - Actualizar contenido
export interface UpdateCourseContentDto {
  title?: string;
  slug?: string;
  description?: string;
  contentType?: "video" | "image" | "pdf" | "document" | "audio" | "link" | "text";
  unlockValue?: number;
  unlockType?: "immediate" | "day" | "week" | "month" | "year";
  availabilityType?: "none" | "month" | "day" | "week";
  thumbnailUrl?: string;
  durationSeconds?: number;
  sortOrder?: number;
  isPreview?: boolean;
  isActive?: boolean;
  contentUrl?: string;
  file?: File;
}

export const updateCourseContent = async (
  contentId: string,
  data: UpdateCourseContentDto,
): Promise<CourseContent> => {
  // Normalizar campos string opcionales para evitar enviar URLs vacías
  const {
    file,
    thumbnailUrl,
    contentUrl,
    ...rest
  } = data;

  const normalizedData: UpdateCourseContentDto = {
    ...rest,
    thumbnailUrl:
      thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl : undefined,
    contentUrl:
      contentUrl && contentUrl.trim() !== "" ? contentUrl : undefined,
  };

  // Si hay archivo, usar FormData
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    
    // Agregar otros campos al FormData
    Object.entries(normalizedData).forEach(([key, value]) => {
      if (key === "file") return; // Ya agregado
      if (value !== undefined && value !== null) {
        if (typeof value === "boolean") {
          formData.append(key, String(value));
        } else if (typeof value === "number") {
          formData.append(key, String(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiAxios.patch<CourseContent>(
      `/courses/content/${contentId}`,
      formData,
    );
    return response.data;
  } else {
    // Enviar como JSON (sin archivo)
    const response = await apiAxios.patch<CourseContent>(
      `/courses/content/${contentId}`,
      normalizedData,
    );
    return response.data;
  }
};

// PATCH /courses/content/{contentId}/order - Actualizar orden del contenido
export const updateContentOrder = async (
  contentId: string,
  sortOrder: number,
): Promise<CourseContent> => {
  const response = await apiAxios.patch<CourseContent>(
    `/courses/content/${contentId}/order`,
    { sortOrder },
  );

  return response.data;
};

// Tipos para recursos de contenido
export interface ContentResource {
  id: string;
  title: string;
  description: string | null;
  resourceUrl: string;
  createdAt: string;
  updatedAt: string;
}

// DTO para crear recurso de contenido
export interface AddContentResourceDto {
  title: string;
  description?: string;
  resourceUrl?: string;
  file?: File;
}

export interface SubscriptionContent {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  contentType: "video" | "image" | "pdf" | "document" | "audio" | "link" | "text";
  unlockValue: number;
  unlockType: "immediate" | "day" | "week" | "month" | "year";
  contentUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number;
  availabilityType: "none" | "month" | "day" | "week";
  resources: ContentResource[];
  isPreview: boolean;
  isActive: boolean;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithSubscriptionContent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  durationMinutes: number | null;
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder: number;
  metadata: Record<string, any> | null;
  creator: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  content: SubscriptionContent[];
}

// GET /courses/subscription - Obtener cursos con contenido para suscripción
export const getSubscriptionCourses = async (): Promise<CourseWithSubscriptionContent[]> => {
  const response = await apiAxios.get<CourseWithSubscriptionContent[]>(
    "/courses/subscription",
  );

  return response.data;
};

// PATCH /courses/:id - Actualizar curso
export interface UpdateCourseDto {
  title?: string;
  slug?: string;
  description?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  level?: "beginner" | "intermediate" | "advanced" | null;
  durationMinutes?: number | null;
  isPublished?: boolean;
  sortOrder?: number | null;
  creatorId?: string | null;
  metadata?: Record<string, any>;
  thumbnailFile?: File;
  trailerFile?: File;
}

export const updateCourse = async (
  courseId: string,
  data: UpdateCourseDto,
): Promise<Course> => {
  let thumbnailUrl = data.thumbnailUrl;
  let trailerUrl = data.trailerUrl;

  // Subir archivos primero si existen
  if (data.thumbnailFile) {
    try {
      const uploadResponse = await uploadFile(data.thumbnailFile, {
        folder: "imagenes",
        isPublic: true,
      });
      thumbnailUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la miniatura: " + (error as Error).message);
    }
  }

  if (data.trailerFile) {
    try {
      const uploadResponse = await uploadFile(data.trailerFile, {
        folder: "videos",
        isPublic: true,
      });
      trailerUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el trailer: " + (error as Error).message);
    }
  }

  // Preparar los datos para enviar (sin los archivos)
  const { thumbnailFile, trailerFile, ...requestData } = data;
  // Convertir strings vacíos a undefined para que el backend no valide URLs vacías
  const courseData: Omit<UpdateCourseDto, "thumbnailFile" | "trailerFile"> = {
    ...requestData,
    thumbnailUrl: thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl : undefined,
    trailerUrl: trailerUrl && trailerUrl.trim() !== "" ? trailerUrl : undefined,
  };

  const response = await apiAxios.patch<Course>(`/courses/${courseId}`, courseData);

  return response.data;
};

// PATCH /courses/:id/order - Actualizar orden del curso
export const updateCourseOrder = async (
  courseId: string,
  sortOrder: number,
): Promise<Course> => {
  const response = await apiAxios.patch<Course>(
    `/courses/${courseId}/order`,
    { sortOrder },
  );

  return response.data;
};

// DELETE /courses/:id - Eliminar curso
export const deleteCourse = async (courseId: string): Promise<void> => {
  await apiAxios.delete(`/courses/${courseId}`);
};

// POST /courses/content/:contentId/resources - Agregar recurso a un contenido
export const addContentResource = async (
  contentId: string,
  data: AddContentResourceDto,
): Promise<ContentResource> => {
  let resourceUrl = data.resourceUrl;

  // Subir archivo primero si existe
  if (data.file) {
    try {
      const uploadResponse = await uploadFile(data.file, {
        folder: "documentos",
        isPublic: true,
      });
      resourceUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el archivo: " + (error as Error).message);
    }
  }

  // Si hay archivo, usar FormData
  if (data.file) {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("title", data.title);
    if (data.description) {
      formData.append("description", data.description);
    }

    const response = await apiAxios.post<ContentResource>(
      `/courses/content/${contentId}/resources`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } else {
    // Enviar como JSON (sin archivo)
    const requestData: Omit<AddContentResourceDto, "file"> = {
      title: data.title,
      description: data.description || undefined,
      resourceUrl,
    };
    const response = await apiAxios.post<ContentResource>(
      `/courses/content/${contentId}/resources`,
      requestData,
    );
    return response.data;
  }
};

// DELETE /courses/content/:contentId/resources/:resourceId - Eliminar recurso
export const deleteContentResource = async (
  contentId: string,
  resourceId: string,
): Promise<void> => {
  await apiAxios.delete(`/courses/content/${contentId}/resources/${resourceId}`, {
    // El backend retorna 204 No Content, así que no esperamos respuesta
  });
};

// Tipos para progreso de contenido
export interface ContentProgress {
  progressSeconds: number;
  isCompleted: boolean;
}

export interface SaveContentProgressDto {
  progressSeconds: number;
  totalSeconds: number;
}

export interface MarkContentCompletedDto {
  isCompleted: boolean;
}

// POST /courses/content/:contentId/progress - Guardar progreso de visualización
export const saveContentProgress = async (
  contentId: string,
  data: SaveContentProgressDto,
): Promise<ContentProgress> => {
  const response = await apiAxios.post<ContentProgress>(
    `/courses/content/${contentId}/progress`,
    data,
  );
  return response.data;
};

// GET /courses/content/:contentId/progress - Obtener progreso de visualización
export const getContentProgress = async (
  contentId: string,
): Promise<ContentProgress | null> => {
  const response = await apiAxios.get<ContentProgress | null>(
    `/courses/content/${contentId}/progress`,
  );
  return response.data;
};

// POST /courses/content/:contentId/completed - Marcar contenido como completado
export const markContentCompleted = async (
  contentId: string,
  data: MarkContentCompletedDto,
): Promise<ContentProgress> => {
  const response = await apiAxios.post<ContentProgress>(
    `/courses/content/${contentId}/completed`,
    data,
  );
  return response.data;
};

// GET /courses/course/:courseId/progress - Obtener progreso de todo el curso
export const getCourseProgress = async (
  courseId: string,
): Promise<Record<string, ContentProgress>> => {
  const response = await apiAxios.get<Record<string, ContentProgress>>(
    `/courses/course/${courseId}/progress`,
  );
  return response.data;
};

