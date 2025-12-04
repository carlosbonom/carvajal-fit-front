"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, Calendar, DollarSign, CheckCircle, XCircle, MoreVertical } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";

interface Member {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: "active" | "cancelled" | "expired" | "paused";
  subscriptionStartDate: string;
  subscriptionEndDate?: string;
  planName: string;
  billingCycle: string;
  totalPaid: number;
  videosWatched: number;
  coursesCompleted: number;
}

export default function MembersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      // const response = await getMembers();
      // setMembers(response.members);
      
      // Datos de ejemplo
      setMembers([
        {
          id: "1",
          name: "Juan Pérez",
          email: "juan@example.com",
          subscriptionStatus: "active",
          subscriptionStartDate: "2024-01-15",
          subscriptionEndDate: "2024-02-15",
          planName: "Plan Mensual",
          billingCycle: "monthly",
          totalPaid: 15000,
          videosWatched: 8,
          coursesCompleted: 0,
        },
        {
          id: "2",
          name: "María García",
          email: "maria@example.com",
          subscriptionStatus: "active",
          subscriptionStartDate: "2024-01-01",
          subscriptionEndDate: "2025-01-01",
          planName: "Plan Anual",
          billingCycle: "yearly",
          totalPaid: 150000,
          videosWatched: 24,
          coursesCompleted: 1,
        },
        {
          id: "3",
          name: "Carlos López",
          email: "carlos@example.com",
          subscriptionStatus: "cancelled",
          subscriptionStartDate: "2023-12-01",
          subscriptionEndDate: "2024-01-01",
          planName: "Plan Mensual",
          billingCycle: "monthly",
          totalPaid: 15000,
          videosWatched: 4,
          coursesCompleted: 0,
        },
      ]);
    } catch (error) {
      console.error("Error al cargar miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
      paused: "bg-yellow-100 text-yellow-800",
    };
    
    const labels = {
      active: "Activo",
      cancelled: "Cancelado",
      expired: "Expirado",
      paused: "Pausado",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles] || styles.expired
        }`}
      >
        {status === "active" ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.subscriptionStatus === "active").length,
    cancelled: members.filter((m) => m.subscriptionStatus === "cancelled").length,
    monthlyRevenue: members
      .filter((m) => m.subscriptionStatus === "active")
      .reduce((sum, m) => sum + (m.billingCycle === "monthly" ? 15000 : 12500), 0),
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
              Gestión de Miembros
            </h1>
            <p className="text-gray-600">
              Administra los miembros y sus suscripciones
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Miembros</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Ingresos Mensuales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.monthlyRevenue.toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="cancelled">Cancelados</option>
                <option value="expired">Expirados</option>
                <option value="paused">Pausados</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando miembros...</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Miembro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suscripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pagado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{member.planName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              Desde {new Date(member.subscriptionStartDate).toLocaleDateString("es-CL")}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.subscriptionStatus)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {member.videosWatched} videos vistos
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.coursesCompleted} curso{member.coursesCompleted !== 1 ? "s" : ""} completado{member.coursesCompleted !== 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${member.totalPaid.toLocaleString("es-CL")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">No se encontraron miembros</p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm || statusFilter !== "all"
                      ? "Intenta con otros filtros"
                      : "Aún no hay miembros registrados"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}



