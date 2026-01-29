"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, Calendar, DollarSign, CheckCircle, XCircle, MoreVertical, Download, Eye, EyeOff } from "lucide-react";
import * as XLSX from "xlsx";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getMembers, updateMember, getPlans, type Member as ApiMember, type Plan } from "@/services/subscriptions";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip
} from "@heroui/react";
import { toast } from "react-hot-toast";

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
  currency: string;
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
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    cancelled: 0,
    monthlyRevenue: 0,
    monthlyRevenueCLP: 0,
    monthlyRevenueUSD: 0,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [updating, setUpdating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    subscriptionStatus: "" as any,
    currency: "",
    planId: "",
    billingCycleId: "",
    currentPeriodEnd: "",
    password: "",
  });

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadMembers();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await getPlans();
      setAvailablePlans(response.plans);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    }
  };

  useEffect(() => {
    // Recargar miembros cuando cambian los filtros
    const timeoutId = setTimeout(() => {
      loadMembers();
    }, 300); // Debounce de 300ms para la búsqueda

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const params: { search?: string; status?: "active" | "cancelled" | "expired" | "paused" } = {};

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter as "active" | "cancelled" | "expired" | "paused";
      }

      const response = await getMembers(params);

      // Mapear los datos de la API a la estructura que espera el componente
      const mappedMembers: Member[] = response.members.map((apiMember: ApiMember) => {
        // Si no tiene suscripción, usar valores por defecto
        if (!apiMember.subscription) {
          return {
            id: apiMember.id,
            name: apiMember.name,
            email: apiMember.email,
            subscriptionStatus: "expired" as const,
            subscriptionStartDate: "",
            subscriptionEndDate: undefined,
            planName: "Sin suscripción",
            billingCycle: "monthly",
            totalPaid: apiMember.totalPaid,
            currency: apiMember.currency || "CLP",
            videosWatched: Math.round((apiMember.progress / 100) * 10),
            coursesCompleted: apiMember.progress >= 100 ? 1 : 0,
          };
        }

        // Calcular el ciclo de facturación basado en las fechas
        const startDate = new Date(apiMember.subscription.currentPeriodStart);
        const endDate = new Date(apiMember.subscription.currentPeriodEnd);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let billingCycle = "monthly";
        if (diffDays >= 360) {
          billingCycle = "yearly";
        } else if (diffDays >= 28 && diffDays <= 31) {
          billingCycle = "monthly";
        } else if (diffDays >= 6 && diffDays <= 7) {
          billingCycle = "weekly";
        } else if (diffDays === 1) {
          billingCycle = "daily";
        }

        // Estimar videos vistos y cursos completados basado en el progreso
        // Esto es una estimación, ajusta según tu lógica de negocio
        const videosWatched = Math.round((apiMember.progress / 100) * 10);
        const coursesCompleted = apiMember.progress >= 100 ? 1 : 0;

        return {
          id: apiMember.id,
          name: apiMember.name,
          email: apiMember.email,
          subscriptionStatus: apiMember.subscription.status,
          subscriptionStartDate: apiMember.subscription.startedAt,
          subscriptionEndDate: apiMember.subscription.currentPeriodEnd,
          planName: apiMember.subscription.planName,
          billingCycle: billingCycle,
          totalPaid: apiMember.totalPaid,
          currency: apiMember.currency || "CLP",
          videosWatched: videosWatched,
          coursesCompleted: coursesCompleted,
        };
      });

      setMembers(mappedMembers);

      // Calcular ingresos mensuales separados por moneda
      // Filtrar miembros activos con suscripción y calcular ingresos por moneda
      const activeMembers = mappedMembers.filter(m =>
        m.subscriptionStatus === "active" && m.subscriptionStartDate
      );

      // Calcular ingresos mensuales estimados por moneda
      // Esto es una aproximación basada en el total pagado y el ciclo de facturación
      let monthlyRevenueCLP = 0;
      let monthlyRevenueUSD = 0;

      activeMembers.forEach(member => {
        if (member.subscriptionStartDate && member.subscriptionEndDate) {
          const startDate = new Date(member.subscriptionStartDate);
          const endDate = new Date(member.subscriptionEndDate);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Calcular el monto mensual estimado basado en el ciclo de facturación
          let monthlyAmount = 0;
          if (diffDays > 0) {
            if (member.billingCycle === "yearly") {
              // Si es anual, dividir el total pagado entre 12 meses
              monthlyAmount = member.totalPaid / 12;
            } else if (member.billingCycle === "monthly") {
              // Si es mensual, usar el total pagado directamente
              monthlyAmount = member.totalPaid;
            } else if (member.billingCycle === "weekly") {
              // Si es semanal, multiplicar por 4.33 (promedio de semanas por mes)
              monthlyAmount = member.totalPaid * 4.33;
            } else if (member.billingCycle === "daily") {
              // Si es diario, multiplicar por 30 (días promedio por mes)
              monthlyAmount = member.totalPaid * 30;
            } else {
              // Por defecto, asumir mensual
              monthlyAmount = member.totalPaid;
            }
          }

          if (member.currency === "CLP" || member.currency === "clp") {
            monthlyRevenueCLP += monthlyAmount;
          } else if (member.currency === "USD" || member.currency === "usd") {
            monthlyRevenueUSD += monthlyAmount;
          }
        }
      });

      setStats({
        total: response.stats.total,
        active: response.stats.active,
        cancelled: response.stats.cancelled,
        monthlyRevenue: response.stats.monthlyRevenue,
        monthlyRevenueCLP,
        monthlyRevenueUSD,
      });
    } catch (error) {
      console.error("Error al cargar miembros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Los datos ya vienen filtrados del servidor, no necesitamos filtrar localmente

  const exportToExcel = () => {
    // Preparar los datos para Excel
    const excelData = members.map((member) => ({
      "Nombre": member.name,
      "Email": member.email,
      "Plan": member.planName,
      "Estado": member.subscriptionStatus === "active" ? "Activo" :
        member.subscriptionStatus === "cancelled" ? "Cancelado" :
          member.subscriptionStatus === "expired" ? "Expirado" :
            member.subscriptionStatus === "paused" ? "Pausado" : member.subscriptionStatus,
      "Fecha Inicio": member.subscriptionStartDate
        ? new Date(member.subscriptionStartDate).toLocaleDateString("es-CL")
        : "N/A",
      "Fecha Fin": member.subscriptionEndDate
        ? new Date(member.subscriptionEndDate).toLocaleDateString("es-CL")
        : "N/A",
      "Ciclo Facturación": member.billingCycle === "yearly" ? "Anual" :
        member.billingCycle === "monthly" ? "Mensual" :
          member.billingCycle === "weekly" ? "Semanal" :
            member.billingCycle === "daily" ? "Diario" : member.billingCycle,
      "Total Pagado": `${member.currency === "USD" || member.currency === "usd" ? "US$" : "$"}${member.totalPaid.toLocaleString("es-CL")} ${member.currency || "CLP"}`,
      "Videos Vistos": member.videosWatched,
      "Cursos Completados": member.coursesCompleted,
    }));

    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear una hoja de trabajo con los datos
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 25 }, // Nombre
      { wch: 30 }, // Email
      { wch: 25 }, // Plan
      { wch: 15 }, // Estado
      { wch: 15 }, // Fecha Inicio
      { wch: 15 }, // Fecha Fin
      { wch: 18 }, // Ciclo Facturación
      { wch: 15 }, // Total Pagado
      { wch: 15 }, // Videos Vistos
      { wch: 20 }, // Cursos Completados
    ];
    ws["!cols"] = colWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Miembros");

    // Generar el nombre del archivo con la fecha actual
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0];
    const fileName = `miembros_${dateStr}.xlsx`;

    // Descargar el archivo
    XLSX.writeFile(wb, fileName);
  };

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);

    // Encontrar el plan correspondiente para obtener los IDs
    const plan = availablePlans.find(p => p.name === member.planName);
    const planId = plan?.id || "";

    // Intentar encontrar el billing cycle ID (basado en el nombre por ahora)
    // En una implementación real, esto debería venir de la API
    let billingCycleId = "";
    if (plan) {
      const price = plan.prices.find(p =>
        (member.billingCycle === "yearly" && p.billingCycle.intervalType === "year") ||
        (member.billingCycle === "monthly" && p.billingCycle.intervalType === "month")
      );
      billingCycleId = price?.billingCycle.id || "";
    }

    setEditFormData({
      name: member.name,
      email: member.email,
      subscriptionStatus: member.subscriptionStatus,
      currency: member.currency,
      planId: planId,
      billingCycleId: billingCycleId,
      currentPeriodEnd: member.subscriptionEndDate ? new Date(member.subscriptionEndDate).toISOString().split('T')[0] : "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    try {
      setUpdating(true);

      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
        subscriptionStatus: editFormData.subscriptionStatus,
        currency: editFormData.currency,
      };

      if (editFormData.planId) updateData.planId = editFormData.planId;
      if (editFormData.billingCycleId) updateData.billingCycleId = editFormData.billingCycleId;
      if (editFormData.currentPeriodEnd) updateData.currentPeriodEnd = editFormData.currentPeriodEnd;
      if (editFormData.password) updateData.password = editFormData.password;

      await updateMember(selectedMember.id, updateData);

      toast.success("Miembro actualizado correctamente");
      setIsEditModalOpen(false);
      loadMembers(); // Recargar la lista
    } catch (error) {
      console.error("Error al actualizar miembro:", error);
      toast.error("Error al actualizar miembro");
    } finally {
      setUpdating(false);
    }
  };

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
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.expired
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          </div>

          {/* Ingresos Mensuales por Moneda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Ingresos Mensuales (CLP)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.monthlyRevenueCLP.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Ingresos Mensuales (USD)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                US${stats.monthlyRevenueUSD.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-black"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="cancelled">Cancelados</option>
                <option value="expired">Expirados</option>
                <option value="paused">Pausados</option>
              </select>
              <button
                onClick={exportToExcel}
                disabled={members.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
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
                    {members.map((member) => (
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
                            {member.subscriptionStartDate && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                Desde {new Date(member.subscriptionStartDate).toLocaleDateString("es-CL")}
                              </div>
                            )}
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
                            {member.currency === "USD" || member.currency === "usd"
                              ? `US$${member.totalPaid.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `$${member.totalPaid.toLocaleString("es-CL", { maximumFractionDigits: 0 })} ${member.currency || "CLP"}`
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly variant="light" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Acciones de miembro">
                              <DropdownItem
                                key="edit"
                                className="text-black"
                                onPress={() => handleEditClick(member)}
                              >
                                Editar Miembro
                              </DropdownItem>
                              <DropdownItem
                                key="view"
                                className="text-black"
                                showDivider
                              >
                                Ver Detalle
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                              >
                                Eliminar (Desactivar)
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {members.length === 0 && (
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

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar Detalles de Miembro
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombre"
                    placeholder="Nombre completo"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    variant="bordered"
                    classNames={{
                      input: "text-black !text-black",
                      label: "text-black !text-black",
                    }}
                  />
                  <Input
                    label="Email"
                    placeholder="correo@ejemplo.com"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    variant="bordered"
                    isDisabled
                    classNames={{
                      input: "text-black !text-black",
                      label: "text-black !text-black",
                    }}
                  />
                  <Input
                    label="Nueva Contraseña"
                    placeholder="Dejar en blanco para no cambiar"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    variant="bordered"
                    type={isVisible ? "text" : "password"}
                    classNames={{
                      input: "text-black !text-black",
                      label: "text-black !text-black",
                    }}
                    endContent={
                      <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                        {isVisible ? (
                          <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <Eye className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                  />
                  <Select
                    label="Estado de Suscripción"
                    placeholder="Seleccionar estado"
                    selectedKeys={[editFormData.subscriptionStatus]}
                    onSelectionChange={(keys) => setEditFormData({ ...editFormData, subscriptionStatus: Array.from(keys)[0] as any })}
                    variant="bordered"
                    classNames={{
                      value: "text-black !text-black",
                      label: "text-black !text-black",
                      trigger: "text-black !text-black",
                    }}
                  >
                    <SelectItem key="active" className="text-black" textValue="Activo">Activo</SelectItem>
                    <SelectItem key="paused" className="text-black" textValue="Pausado">Pausado</SelectItem>
                    <SelectItem key="cancelled" className="text-black" textValue="Cancelado">Cancelado</SelectItem>
                    <SelectItem key="expired" className="text-black" textValue="Expirado">Expirado</SelectItem>
                  </Select>
                  <Select
                    label="Moneda Preferida"
                    placeholder="Seleccionar moneda"
                    selectedKeys={[editFormData.currency]}
                    onSelectionChange={(keys) => setEditFormData({ ...editFormData, currency: Array.from(keys)[0] as string })}
                    variant="bordered"
                    classNames={{
                      value: "text-black !text-black",
                      label: "text-black !text-black",
                      trigger: "text-black !text-black",
                    }}
                  >
                    <SelectItem key="CLP" className="text-black" textValue="CLP (Peso Chileno)">CLP (Peso Chileno)</SelectItem>
                    <SelectItem key="USD" className="text-black" textValue="USD (Dólar)">USD (Dólar)</SelectItem>
                  </Select>

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="text-sm font-semibold mb-3">Detalles de la Membresía</h3>
                  </div>

                  <Select
                    label="Plan"
                    placeholder="Seleccionar plan"
                    selectedKeys={[editFormData.planId]}
                    onSelectionChange={(keys) => setEditFormData({ ...editFormData, planId: Array.from(keys)[0] as string })}
                    variant="bordered"
                    classNames={{
                      value: "text-black !text-black",
                      label: "text-black !text-black",
                      trigger: "text-black !text-black",
                    }}
                  >
                    {availablePlans.map((plan) => (
                      <SelectItem key={plan.id} className="text-black" textValue={plan.name}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    type="date"
                    label="Fecha de Vencimiento"
                    placeholder="yyyy-mm-dd"
                    value={editFormData.currentPeriodEnd}
                    onChange={(e) => setEditFormData({ ...editFormData, currentPeriodEnd: e.target.value })}
                    variant="bordered"
                    classNames={{
                      input: "text-black !text-black",
                      label: "text-black !text-black",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateMember}
                  isLoading={updating}
                >
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}






