import { apiAxios } from "@/lib/axios-config";

export interface SuccessStory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessStoriesResponse {
  stories: SuccessStory[];
}

export interface CreateSuccessStoryDto {
  name: string;
  description?: string;
  imageUrl: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSuccessStoryDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

// GET /success-stories - Obtener casos de éxito activos (público)
export const getActiveSuccessStories = async (): Promise<SuccessStoriesResponse> => {
  const response = await apiAxios.get<SuccessStoriesResponse>("/success-stories");
  return response.data;
};

// GET /success-stories/all - Obtener todos los casos de éxito (requiere auth)
export const getAllSuccessStories = async (): Promise<SuccessStoriesResponse> => {
  const response = await apiAxios.get<SuccessStoriesResponse>("/success-stories/all");
  return response.data;
};

// GET /success-stories/:id - Obtener un caso de éxito por ID
export const getSuccessStoryById = async (id: string): Promise<SuccessStory> => {
  const response = await apiAxios.get<SuccessStory>(`/success-stories/${id}`);
  return response.data;
};

// POST /success-stories - Crear un caso de éxito
export const createSuccessStory = async (
  data: CreateSuccessStoryDto
): Promise<SuccessStory> => {
  const response = await apiAxios.post<SuccessStory>("/success-stories", data);
  return response.data;
};

// PUT /success-stories/:id - Actualizar un caso de éxito
export const updateSuccessStory = async (
  id: string,
  data: UpdateSuccessStoryDto
): Promise<SuccessStory> => {
  const response = await apiAxios.put<SuccessStory>(`/success-stories/${id}`, data);
  return response.data;
};

// DELETE /success-stories/:id - Eliminar un caso de éxito
export const deleteSuccessStory = async (id: string): Promise<void> => {
  await apiAxios.delete(`/success-stories/${id}`);
};


