"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";

export const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Lista de rutas exactas donde NO queremos mostrar el navbar
  const hideNavbarRoutes = [
    "/signup",
    "/login",
    "/checkout",
    "/admin",
    "/club",
    "/club/bajar-grasa",
    "/admin/courses",
    "/admin/videos",
    "/admin/members",
    "/admin/pricing",
    "/admin/reports",
    "/admin/market/jose",
    "/admin/market/gabriel",
    "/admin/settings",
  ];

  // Patrones de rutas dinámicas donde NO queremos mostrar el navbar
  const hideNavbarPatterns = [
    /^\/admin\/courses\/[^/]+\/videos$/, // /admin/courses/[id]/videos
  ];

  // Verificar si la ruta exacta está en la lista
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  // Verificar si la ruta coincide con algún patrón dinámico
  if (hideNavbarPatterns.some((pattern) => pattern.test(pathname))) {
    return null;
  }

  return <Navbar />;
};
