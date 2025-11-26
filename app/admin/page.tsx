"use client";

import { useEffect, useState } from "react";

import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-22" : "ml-64"}`}
      >
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Bienvenido al panel de administración de Carvajal Fit
          </p>
        </div>
      </main>
    </>
  );
}
