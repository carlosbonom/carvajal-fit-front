"use client";

import axios from "axios";

import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./auth-utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:3000";

// Instancia de axios para las peticiones de autenticación
export const authAxios = axios.create({
  baseURL: `${API_URL}/auth`,
});

// Instancia de axios para otras peticiones (si las hay)
export const apiAxios = axios.create({
  baseURL: API_URL,
});

// Instancia de axios para refresh token (sin interceptor de auth porque no necesita token)
export const refreshAxios = axios.create({
  baseURL: `${API_URL}/auth`,
});

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Función para hacer refresh del token
const doRefreshToken = async (): Promise<string | null> => {
  const refresh = getRefreshToken();

  if (!refresh) {
    return null;
  }

  try {
    // Usar refreshAxios directamente para evitar dependencia circular
    const response = await refreshAxios.post<{
      accessToken: string;
      refreshToken: string;
    }>("/refresh", { refreshToken: refresh });

    saveTokens(response.data.accessToken, response.data.refreshToken);

    return response.data.accessToken;
  } catch (error) {
    // Si el refresh token también falla, limpiar todo y redirigir al login
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  }
};

// Interceptor de request: agregar token a todas las peticiones
const setupRequestInterceptor = (axiosInstance: typeof axios) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

// Interceptor de response: manejar errores 401 y hacer refresh automático
const setupResponseInterceptor = (axiosInstance: typeof axios) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Si es un error 401 y no es un retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Si ya hay un refresh en proceso, encolar esta petición
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;

              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await doRefreshToken();

          processQueue(null, newToken);

          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

// Configurar interceptores para las instancias que necesitan autenticación
setupRequestInterceptor(authAxios as any);
setupResponseInterceptor(authAxios as any);
setupRequestInterceptor(apiAxios as any);
setupResponseInterceptor(apiAxios as any);

// refreshAxios no necesita interceptores porque se usa solo para refresh (sin token)

export default authAxios;
