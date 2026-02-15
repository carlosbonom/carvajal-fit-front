"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Video, BookOpen, TrendingUp, Calendar, Store } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function AdminPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    globalStats,
    marketJoseStats,
    marketGabrielStats,
    recentActivity,
    loading,
    error
  } = useDashboardStats();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando dashboard...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-600">Error: {error}</div>;
  }

  // Fallback default values if data is null (though loading should handle initial state)
  const stats = {
    activeSubscriptions: globalStats?.activeSubscriptions || 0,
    newMembersThisMonth: globalStats?.newMembers || 0,
    monthlyRevenue: globalStats?.monthlyRevenue || 0,
    totalVideos: globalStats?.totalVideos || 0,
    totalCourses: globalStats?.totalCourses || 0,
    marketJose: marketJoseStats || { totalProducts: 0, totalSales: 0, totalRevenue: 0, pdfCount: 0, digitalCount: 0, merchCount: 0 },
    marketGabriel: marketGabrielStats || { totalProducts: 0, totalSales: 0, totalRevenue: 0, pdfCount: 0, digitalCount: 0, merchCount: 0 },
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Bienvenido al panel de administración de Carvajal Fit
            </p>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Miembros Activos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
                  <p className="text-sm text-green-600 mt-1">+{stats.newMembersThisMonth} este mes</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ${stats.monthlyRevenue.toLocaleString('es-CL')}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline" /> +12% vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Videos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVideos}</p>
                  <p className="text-sm text-gray-500 mt-1">{stats.totalCourses} cursos activos</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Video className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de Tiendas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Market José
                </h3>
                <a
                  href="/admin/market/jose"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Ver tienda →
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Productos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.marketJose.totalProducts}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.marketJose.pdfCount} PDF, {stats.marketJose.digitalCount} digital, {stats.marketJose.merchCount} merch
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ventas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.marketJose.totalSales}</p>
                  <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(stats.marketJose.totalRevenue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Market Gabriel
                </h3>
                <a
                  href="/admin/market/gabriel"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Ver tienda →
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Productos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.marketGabriel.totalProducts}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.marketGabriel.pdfCount} PDF, {stats.marketGabriel.digitalCount} digital, {stats.marketGabriel.merchCount} merch
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ventas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.marketGabriel.totalSales}</p>
                  <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(stats.marketGabriel.totalRevenue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actividad reciente y resumen rápido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(activity.date).toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/pricing"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DollarSign className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Gestionar Precios</p>
                </a>
                <a
                  href="/admin/courses"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Gestionar Cursos</p>
                </a>
                <a
                  href="/admin/videos"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Video className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Subir Videos</p>
                </a>
                <a
                  href="/admin/members"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Ver Miembros</p>
                </a>
                <a
                  href="/admin/market/jose"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Store className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Market José</p>
                </a>
                <a
                  href="/admin/market/gabriel"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Store className="w-6 h-6 text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-900">Market Gabriel</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
