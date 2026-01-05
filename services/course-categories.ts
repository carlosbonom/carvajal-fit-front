import { apiAxios } from "@/lib/axios-config";

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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
  isActive?: boolean;
  parentId?: string;
}

export interface UpdateCourseCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
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
  const response = await apiAxios.post<CourseCategory>("/course-categories", data);
  return response.data;
};

// PATCH /course-categories/:id - Actualizar categoría
export const updateCourseCategory = async (
  id: string,
  data: UpdateCourseCategoryDto,
): Promise<CourseCategory> => {
  const response = await apiAxios.patch<CourseCategory>(`/course-categories/${id}`, data);
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
