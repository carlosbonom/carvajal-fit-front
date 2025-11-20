"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export const ConditionalNavbar = () => {
  const pathname = usePathname();
  
  // Lista de rutas donde NO queremos mostrar el navbar
  const hideNavbarRoutes = ["/signup", "/login", "/checkout", "/admin", "/club"];
  
  // Si la ruta actual está en la lista, no mostramos el navbar
  if (hideNavbarRoutes.includes(pathname)) {
    return null;
  }
  
  return <Navbar />;
};




