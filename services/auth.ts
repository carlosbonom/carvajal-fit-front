import type { UserSubscription } from "./subscriptions";

import { authAxios, refreshAxios } from "@/lib/axios-config";

// Tipos para las respuestas de la API
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  countryCode: string | null;
  preferredCurrency: string;
  role: "customer" | "admin" | "support";
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  subscription: UserSubscription | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  countryCode?: string;
  preferredCurrency?: string;
  role?: "customer" | "admin" | "support";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// POST /auth/register - Registrar Usuario
export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await authAxios.post<AuthResponse>("/register", data);

  return response.data;
};

// POST /auth/login - Iniciar Sesión
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await authAxios.post<AuthResponse>("/login", data);

  return response.data;
};

// GET /auth/me - Obtener Perfil del Usuario
export const getProfile = async (
  accessToken?: string,
): Promise<UserProfile> => {
  const response = await authAxios.get<UserProfile>(
    "/me",
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  );

  return response.data;
};

// POST /auth/refresh - Renovar Access Token
// Usa refreshAxios que no tiene interceptores de autenticación
export const refreshToken = async (
  refreshToken: string,
): Promise<AuthResponse> => {
  const response = await refreshAxios.post<AuthResponse>("/refresh", {
    refreshToken,
  });

  return response.data;
};

// POST /auth/logout - Cerrar Sesión
export const logout = async (
  accessToken?: string,
): Promise<{ message: string }> => {
  const response = await authAxios.post<{ message: string }>(
    "/logout",
    {},
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  );

  return response.data;
};
