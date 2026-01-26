import { apiAxios } from "@/lib/axios-config";
import { uploadFile } from "./files";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  parent?: CourseCategory;
  subcategories?: CourseCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseCategoryDto {
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  coverFile?: File;
  isActive?: boolean;
  parentId?: string;
}

export interface UpdateCourseCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  coverFile?: File;
  isActive?: boolean;
  parentId?: string | null;
}

// GET /course-categories - Obtener todas las categorías
export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  const response = await apiAxios.get<CourseCategory[]>("/course-categories");
  return response.data;
};

// GET /course-categories/:id - Obtener una categoría por ID
export const getCourseCategoryById = async (id: string): Promise<CourseCategory> => {
  const response = await apiAxios.get<CourseCategory>(`/course-categories/${id}`);
  return response.data;
};

// GET /course-categories/slug/:slug - Obtener una categoría por slug
export const getCourseCategoryBySlug = async (slug: string): Promise<CourseCategory> => {
  const response = await apiAxios.get<CourseCategory>(`/course-categories/slug/${slug}`);
  return response.data;
};

// POST /course-categories - Crear categoría
export const createCourseCategory = async (
  data: CreateCourseCategoryDto,
): Promise<CourseCategory> => {
  let coverUrl = data.coverUrl;

  // Subir archivo primero si existe
  if (data.coverFile) {
    try {
      const uploadResponse = await uploadFile(data.coverFile, {
        folder: "categorias",
        isPublic: true,
      });
      coverUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la portada: " + (error as Error).message);
    }
  }

  // Preparar los datos para enviar (sin el archivo)
  const { coverFile, ...requestData } = data;
  const finalData = {
    ...requestData,
    coverUrl: coverUrl && coverUrl.trim() !== "" ? coverUrl : undefined,
  };

  const response = await apiAxios.post<CourseCategory>("/course-categories", finalData);
  return response.data;
};

// PATCH /course-categories/:id - Actualizar categoría
export const updateCourseCategory = async (
  id: string,
  data: UpdateCourseCategoryDto,
): Promise<CourseCategory> => {
  let coverUrl = data.coverUrl;

  // Subir archivo primero si existe
  if (data.coverFile) {
    try {
      const uploadResponse = await uploadFile(data.coverFile, {
        folder: "categorias",
        isPublic: true,
      });
      coverUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la portada: " + (error as Error).message);
    }
  }

  // Preparar los datos para enviar (sin el archivo)
  const { coverFile, ...requestData } = data;
  const finalData = {
    ...requestData,
    coverUrl: coverUrl && coverUrl.trim() !== "" ? coverUrl : undefined,
  };

  const response = await apiAxios.patch<CourseCategory>(`/course-categories/${id}`, finalData);
  return response.data;
};

// PATCH /course-categories/:id/order - Actualizar orden de categoría
export const updateCourseCategoryOrder = async (
  id: string,
  sortOrder: number,
): Promise<CourseCategory> => {
  const response = await apiAxios.patch<CourseCategory>(`/course-categories/${id}/order`, {
    sortOrder,
  });
  return response.data;
};

// DELETE /course-categories/:id - Eliminar categoría
export const deleteCourseCategory = async (id: string): Promise<void> => {
  await apiAxios.delete(`/course-categories/${id}`);
};
