import { apiAxios } from "@/lib/axios-config";

export interface UserInfo {
  id: string;
  name: string | null;
  email: string;
}

export interface Comment {
  id: string;
  text: string;
  user: UserInfo;
  parentId: string | null;
  replies: Comment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  text: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  text: string;
}

// GET /content/:contentId/comments - Obtener comentarios de un contenido
export const getComments = async (contentId: string): Promise<Comment[]> => {
  const response = await apiAxios.get<Comment[]>(`/content/${contentId}/comments`);
  return response.data;
};

// POST /content/:contentId/comments - Crear un comentario
export const createComment = async (
  contentId: string,
  data: CreateCommentDto,
): Promise<Comment> => {
  const response = await apiAxios.post<Comment>(
    `/content/${contentId}/comments`,
    data,
  );
  return response.data;
};

// PATCH /content/comments/:commentId - Actualizar un comentario
export const updateComment = async (
  commentId: string,
  data: UpdateCommentDto,
): Promise<Comment> => {
  const response = await apiAxios.patch<Comment>(
    `/content/comments/${commentId}`,
    data,
  );
  return response.data;
};

// DELETE /content/comments/:commentId - Eliminar un comentario
export const deleteComment = async (commentId: string): Promise<void> => {
  await apiAxios.delete(`/content/comments/${commentId}`);
};

