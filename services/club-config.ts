import { apiAxios } from "@/lib/axios-config";

export interface ClubConfig {
  id: string;
  whatsappLink: string | null;
  nextMeetingDateTime: string | null;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateClubConfigRequest {
  whatsappLink?: string;
  nextMeetingDateTime?: string;
  meetingLink?: string;
}

// GET /club-config - Obtener configuración del club
export const getClubConfig = async (): Promise<ClubConfig> => {
  const response = await apiAxios.get<ClubConfig>("/club-config");
  return response.data;
};

// PATCH /club-config - Actualizar configuración del club
export const updateClubConfig = async (
  data: UpdateClubConfigRequest
): Promise<ClubConfig> => {
  const response = await apiAxios.patch<ClubConfig>("/club-config", data);
  return response.data;
};

