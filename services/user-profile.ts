import { apiAxios } from "@/lib/axios-config";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  countryCode: string | null;
  preferredCurrency: string;
  preferredWeightUnit: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  countryCode?: string;
  preferredWeightUnit?: 'kg' | 'lb';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// GET /users/profile - Obtener perfil del usuario
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiAxios.get<UserProfile>("/users/profile");
  return response.data;
};

// PATCH /users/profile - Actualizar perfil
export const updateProfile = async (
  data: UpdateProfileDto,
): Promise<UserProfile> => {
  const response = await apiAxios.patch<UserProfile>("/users/profile", data);
  return response.data;
};

// PATCH /users/change-password - Cambiar contraseña
export const changePassword = async (
  data: ChangePasswordDto,
): Promise<void> => {
  await apiAxios.patch("/users/change-password", data);
};

