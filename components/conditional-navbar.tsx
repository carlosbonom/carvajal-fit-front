"use client";

import { usePathname } from "next/navigation";

import { Navbar } from "@/components/navbar";

export const ConditionalNavbar = () => {
  const pathname = usePathname();

  // Lista de rutas donde NO queremos mostrar el navbar
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

  // Si la ruta actual está en la lista, no mostramos el navbar
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }

  return <Navbar />;
};
