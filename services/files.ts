import { apiAxios } from "@/lib/axios-config";

export interface UploadFileResponse {
  url?: string;
  data?: {
    url?: string;
  };
  // El backend puede retornar la URL directamente o en un objeto
  [key: string]: any;
}

export interface UploadFileOptions {
  folder?: string;
  isPublic?: boolean;
}

// POST /file/upload - Subir archivo
export const uploadFile = async (
  file: File,
  options?: UploadFileOptions
): Promise<{ url: string }> => {
  const formData = new FormData();
  
  formData.append("file", file);
  
  if (options?.folder) {
    formData.append("folder", options.folder);
  }
  
  if (options?.isPublic !== undefined) {
    formData.append("isPublic", options.isPublic.toString());
  }

  const response = await apiAxios.post<UploadFileResponse>(
    "/file/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // Manejar diferentes estructuras de respuesta
  const url = response.data?.url || response.data?.data?.url || response.data;
  
  if (!url || typeof url !== "string") {
    throw new Error("La respuesta del servidor no contiene una URL válida");
  }

  return { url };
};

