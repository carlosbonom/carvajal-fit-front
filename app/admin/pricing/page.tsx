"use client";

import { useEffect, useState } from "react";
import { Edit, Save, X, DollarSign, Loader2 } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getPlans, updatePrice, Plan, Price } from "@/services/subscriptions";

interface TableRow {
  planId: string;
  planName: string;
  planDescription: string;
  priceId: string;
  price: Price;
}

export default function PricingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ amount: number; currency: string } | null>(null);
  const [savingPriceId, setSavingPriceId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    loadPlans();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlans();
      console.log("Planes cargados desde BD:", response.plans);
      setPlans(response.plans);
    } catch (error) {
      console.error("Error al cargar planes desde la BD:", error);
      setError("Error al cargar los precios. Por favor, verifica la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Convertir planes y precios en filas de tabla
  const tableRows: TableRow[] = plans.flatMap((plan) =>
    plan.prices.map((price) => ({
      planId: plan.id,
      planName: plan.name,
      planDescription: plan.description,
      priceId: price.id,
      price,
    }))
  );

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price.id);
    setEditForm({
      amount: price.amount,
      currency: price.currency, // Se mantiene la moneda original
    });
  };

  const handleSavePrice = async (priceId: string) => {
    if (!editForm) return;
    
    // Obtener el precio original para mantener la moneda
    const originalPrice = tableRows.find(row => row.priceId === priceId)?.price;
    if (!originalPrice) return;
    
    try {
      setError(null);
      setSavingPriceId(priceId);
      // Llamar a la API para actualizar el precio
      await updatePrice(priceId, editForm.amount);
      
      // Actualizar localmente - mantener la moneda original
      setPlans(plans.map(plan => ({
        ...plan,
        prices: plan.prices.map(p => 
          p.id === priceId 
            ? { ...p, amount: editForm.amount, currency: originalPrice.currency }
            : p
        )
      })));
      
      setEditingPrice(null);
      setEditForm(null);
    } catch (error: any) {
      console.error("Error al actualizar precio:", error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Error al actualizar el precio. Por favor, intenta nuevamente."
      );
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setEditForm(null);
  };

  const formatPrice = (amount: number, currency: string) => {
    if (!currency || !amount) return "N/A";
    const symbol = currency === "CLP" ? "$" : currency === "USD" ? "US$" : "$";
    return `${symbol}${amount.toLocaleString("es-CL", {
      minimumFractionDigits: currency === "CLP" ? 0 : 2,
      maximumFractionDigits: currency === "CLP" ? 0 : 2,
    })}`;
  };

  const getBillingCycleLabel = (price: Price) => {
    const { intervalCount, intervalType } = price.billingCycle;
    const typeMap: Record<string, string> = {
      day: intervalCount === 1 ? "día" : "días",
      week: intervalCount === 1 ? "semana" : "semanas",
      month: intervalCount === 1 ? "mes" : "meses",
      year: intervalCount === 1 ? "año" : "años",
    };
    return `Cada ${intervalCount} ${typeMap[intervalType] || intervalType}`;
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Gestión de Precios
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Administra los precios de las suscripciones
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando precios...</div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadPlans}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : tableRows.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No hay precios configurados</p>
              <p className="text-gray-400 text-sm mt-2">Comienza agregando un nuevo precio</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Ciclo de Facturación
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Moneda
                      </th>
                      <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-4 md:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableRows.map((row) => (
                      <tr
                        key={row.priceId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {row.planName}
                            </div>
                            {row.planDescription && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs">
                                {row.planDescription}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {row.price.billingCycle.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getBillingCycleLabel(row.price)}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row.price.currency || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {editingPrice === row.priceId ? (
                            <div className="space-y-2 min-w-[120px]">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {row.price.currency === "CLP" ? "$" : row.price.currency === "USD" ? "US$" : "$"}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editForm?.amount || 0}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm!,
                                      amount: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                Moneda: <span className="font-medium">{row.price.currency}</span> (no editable)
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPrice(row.price.amount, row.price.currency)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingPrice === row.priceId ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSavePrice(row.priceId)}
                                disabled={savingPriceId === row.priceId}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Guardar"
                              >
                                {savingPriceId === row.priceId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={savingPriceId === row.priceId}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => handleEditPrice(row.price)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar precio"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}















