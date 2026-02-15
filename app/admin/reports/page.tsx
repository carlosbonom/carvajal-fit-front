"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { useReportsData } from "@/hooks/useReportsData";

export default function ReportsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data, loading, error } = useReportsData();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando reportes...</div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-600">Error: {error}</div>;
  }

  const revenueData = data?.revenueData || [];
  const subscriptionData = data?.subscriptionData || [];

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1); // Prevent division by zero
  const maxSubscriptions = Math.max(
    ...subscriptionData.map((d) => d.new + d.cancelled), 1
  );

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.amount, 0);
  const totalNewMembers = subscriptionData.reduce((sum, d) => sum + d.new, 0);

  // Calculate retention rate (simplified)
  const totalCancelled = subscriptionData.reduce((sum, d) => sum + d.cancelled, 0);
  const retentionRate = totalNewMembers > 0
    ? ((totalNewMembers - totalCancelled) / totalNewMembers) * 100
    : 100;

  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

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
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales (6 meses)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    ${totalRevenue.toLocaleString("es-CL")}
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
                    {totalNewMembers}
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
                  <p className="text-2xl font-bold text-gray-900 mt-2">{retentionRate.toFixed(1)}%</p>
                  <p className="text-sm text-green-600 mt-1">Calculado sobre nuevos</p>
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
                    ${Math.round(averageRevenue).toLocaleString("es-CL")}
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
                      Tasa de Retención (Mes)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((revenue, index) => {
                    const subs = subscriptionData[index];
                    const retention = subs.new > 0 ? ((subs.new - subs.cancelled) / subs.new) * 100 : 100;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {revenue.month}
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


















