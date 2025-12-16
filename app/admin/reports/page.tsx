"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";

export default function ReportsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Datos de ejemplo - estos vendrían de la API
  const revenueData = [
    { month: "Ene", amount: 1200000 },
    { month: "Feb", amount: 1350000 },
    { month: "Mar", amount: 1250000 },
    { month: "Abr", amount: 1400000 },
    { month: "May", amount: 1500000 },
    { month: "Jun", amount: 1450000 },
  ];

  const subscriptionData = [
    { month: "Ene", new: 15, cancelled: 3 },
    { month: "Feb", new: 18, cancelled: 2 },
    { month: "Mar", new: 20, cancelled: 5 },
    { month: "Abr", new: 22, cancelled: 4 },
    { month: "May", new: 25, cancelled: 3 },
    { month: "Jun", new: 23, cancelled: 2 },
  ];

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount));
  const maxSubscriptions = Math.max(
    ...subscriptionData.map((d) => d.new + d.cancelled)
  );

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reportes y Análisis
            </h1>
            <p className="text-gray-600">
              Visualiza estadísticas y métricas de tu negocio
            </p>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${(revenueData.reduce((sum, d) => sum + d.amount, 0)).toLocaleString("es-CL")}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    <TrendingUp className="w-4 h-4 inline" /> +12% vs período anterior
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
                  <p className="text-sm font-medium text-gray-600">Nuevos Miembros</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {subscriptionData.reduce((sum, d) => sum + d.new, 0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Últimos 6 meses</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Retención</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">87%</p>
                  <p className="text-sm text-green-600 mt-1">+3% vs mes anterior</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingreso Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${Math.round(revenueData.reduce((sum, d) => sum + d.amount, 0) / revenueData.length).toLocaleString("es-CL")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Por mes</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Ingresos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ingresos Mensuales
              </h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{
                        height: `${(data.amount / maxRevenue) * 100}%`,
                        minHeight: "4px",
                      }}
                      title={`${data.month}: $${data.amount.toLocaleString("es-CL")}`}
                    />
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    <span className="text-xs font-medium text-gray-900 mt-1">
                      ${(data.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico de Suscripciones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Nuevas Suscripciones vs Cancelaciones
              </h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {subscriptionData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col gap-1">
                      <div
                        className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                        style={{
                          height: `${(data.new / maxSubscriptions) * 100}%`,
                          minHeight: "4px",
                        }}
                        title={`${data.month}: ${data.new} nuevas`}
                      />
                      <div
                        className="w-full bg-red-500 rounded-b transition-all hover:bg-red-600"
                        style={{
                          height: `${(data.cancelled / maxSubscriptions) * 100}%`,
                          minHeight: "4px",
                        }}
                        title={`${data.month}: ${data.cancelled} canceladas`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-xs text-gray-600">Nuevas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-xs text-gray-600">Canceladas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de resumen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Resumen por Mes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nuevas Suscripciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancelaciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de Retención
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((revenue, index) => {
                    const subs = subscriptionData[index];
                    const retention = ((subs.new - subs.cancelled) / subs.new) * 100;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {revenue.month} 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${revenue.amount.toLocaleString("es-CL")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          +{subs.new}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          -{subs.cancelled}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {retention.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}











