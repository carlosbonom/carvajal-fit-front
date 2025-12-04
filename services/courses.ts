import { apiAxios } from "@/lib/axios-config";

// Tipos para crear curso
export interface CreateCourseDto {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  level?: "beginner" | "intermediate" | "advanced";
  durationMinutes?: number;
  isPublished?: boolean;
  sortOrder?: number;
  creatorId: string;
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
  slug: string;
  description?: string;
  contentType: "video" | "image" | "pdf" | "document" | "audio" | "link" | "text";
  unlockMonth: number;
  thumbnailUrl?: string;
  durationSeconds?: number;
  sortOrder?: number;
  hasResources?: boolean;
  resourcesUrl?: string | null;
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
  hasResources: boolean;
  resourcesUrl: string | null;
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
  const response = await apiAxios.post<Course>("/courses", data);

  return response.data;
};

// POST /courses/{courseId}/content - Agregar contenido a un curso
export const addCourseContent = async (
  courseId: string,
  data: AddCourseContentDto,
): Promise<CourseContent> => {
  // Si hay un archivo, usar FormData para multipart/form-data
  if (data.file) {
    const formData = new FormData();
    
    // Agregar el archivo
    formData.append("file", data.file);
    
    // Agregar los demás campos como strings
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("contentType", data.contentType);
    formData.append("unlockMonth", data.unlockMonth.toString());
    
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.thumbnailUrl) {
      formData.append("thumbnailUrl", data.thumbnailUrl);
    }
    if (data.durationSeconds !== undefined) {
      formData.append("durationSeconds", data.durationSeconds.toString());
    }
    if (data.sortOrder !== undefined) {
      formData.append("sortOrder", data.sortOrder.toString());
    }
    if (data.hasResources !== undefined) {
      formData.append("hasResources", data.hasResources.toString());
    }
    if (data.resourcesUrl !== undefined && data.resourcesUrl !== null) {
      formData.append("resourcesUrl", data.resourcesUrl);
    }
    if (data.isPreview !== undefined) {
      formData.append("isPreview", data.isPreview.toString());
    }

    const response = await apiAxios.post<CourseContent>(
      `/courses/${courseId}/content`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } else {
    // Si no hay archivo, usar JSON normal
    const response = await apiAxios.post<CourseContent>(
      `/courses/${courseId}/content`,
      data,
    );

    return response.data;
  }
};

