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
  unlockMonth: number;
  availabilityType: "none" | "month" | "day" | "week"; // Requerido
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
  unlockMonth: number;
  contentUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number | null;
  resources: string[];
  isPreview: boolean;
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
  const courseData: Omit<CreateCourseDto, "thumbnailFile" | "trailerFile"> = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    thumbnailUrl,
    trailerUrl,
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
  const requestData: Omit<AddCourseContentDto, "file"> = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    contentType: data.contentType,
    unlockMonth: data.unlockMonth,
    availabilityType: data.availabilityType,
    contentUrl,
    thumbnailUrl: data.thumbnailUrl,
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

