"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/userSlice";
import { getAccessToken, clearTokens } from "@/lib/auth-utils";
import { getProfile } from "@/services/auth";
import { store } from "@/lib/store/store";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [isChecking, setIsChecking] = useState(true);

  // Verificación inicial al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si ya hay usuario en Redux
        const currentState = store.getState();
        let currentUser = currentState.user.user;

        // Si no hay usuario en Redux, intentar cargarlo desde el token
        if (!currentUser) {
          const token = getAccessToken();

          if (!token) {
            // No hay token, redirigir al home
            router.push("/");
            return;
          }

          try {
            // Intentar cargar el usuario desde el token
            const userProfile = await getProfile(token);
            dispatch(setUser(userProfile));
            currentUser = userProfile;
          } catch (error) {
            // Token inválido, limpiar y redirigir
            console.error("Error al cargar usuario:", error);
            clearTokens();
            router.push("/");
            return;
          }
        }

        // Usuario autenticado, permitir acceso
        setIsChecking(false);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        router.push("/");
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verificar si el usuario cambia después de la verificación inicial
  useEffect(() => {
    if (!isChecking && !user) {
      // Si el usuario se deslogueó, redirigir
      router.push("/");
    }
  }, [user, isChecking, router]);

  // Mostrar loading mientras se verifica el acceso
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b2de] mx-auto mb-4"></div>
          <p className="text-white/60">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

