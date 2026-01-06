"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/userSlice";
import { getAccessToken, clearTokens } from "@/lib/auth-utils";
import { getProfile } from "@/services/auth";
import { store } from "@/lib/store/store";

export default function AdminLayout({
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
    const checkAdminAccess = async () => {
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

        // Verificar si el usuario tiene rol de admin
        if (!currentUser || currentUser.role !== "admin") {
          // No es admin, redirigir al home
          router.push("/");
          return;
        }

        // Usuario es admin, permitir acceso
        setIsChecking(false);
      } catch (error) {
        console.error("Error al verificar acceso de admin:", error);
        router.push("/");
      }
    };

    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verificar si el usuario cambia después de la verificación inicial
  useEffect(() => {
    if (!isChecking && user) {
      // Si el usuario cambió y ya no es admin, redirigir
      if (user.role !== "admin") {
        router.push("/");
      }
    } else if (!isChecking && !user) {
      // Si el usuario se deslogueó, redirigir
      router.push("/");
    }
  }, [user, isChecking, router]);

  // Mostrar loading mientras se verifica el acceso
  if (isChecking) {
    return (
      <section className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen bg-gray-50 admin-scope">{children}</section>
  );
}
