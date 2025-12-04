"use client";

import { useEffect, useState } from "react";
import { DollarSign, Plus, Edit, Trash2, Save, X } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { getPlans, Plan, Price } from "@/services/subscriptions";

export default function PricingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ amount: number; currency: string } | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await getPlans();
      setPlans(response.plans);
    } catch (error) {
      console.error("Error al cargar planes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price.id);
    setEditForm({
      amount: price.amount,
      currency: price.currency,
    });
  };

  const handleSavePrice = async (priceId: string) => {
    if (!editForm) return;
    
    try {
      // Aquí harías la llamada a la API para actualizar el precio
      // await updatePrice(priceId, editForm);
      console.log("Actualizando precio:", priceId, editForm);
      
      // Actualizar localmente
      setPlans(plans.map(plan => ({
        ...plan,
        prices: plan.prices.map(p => 
          p.id === priceId 
            ? { ...p, amount: editForm.amount, currency: editForm.currency as "CLP" | "USD" }
            : p
        )
      })));
      
      setEditingPrice(null);
      setEditForm(null);
    } catch (error) {
      console.error("Error al actualizar precio:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    setEditForm(null);
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Precios
              </h1>
              <p className="text-gray-600">
                Configura los precios de las suscripciones mensuales y anuales
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Plus className="w-5 h-5" />
              Nuevo Precio
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando precios...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Precios Disponibles
                    </h3>
                    
                    {plan.prices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay precios configurados para este plan</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.prices.map((price) => (
                          <div
                            key={price.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            {editingPrice === price.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monto
                                  </label>
                                  <input
                                    type="number"
                                    value={editForm?.amount || 0}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm!,
                                        amount: parseFloat(e.target.value),
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Moneda
                                  </label>
                                  <select
                                    value={editForm?.currency || "CLP"}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm!,
                                        currency: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                  >
                                    <option value="CLP">CLP (Peso Chileno)</option>
                                    <option value="USD">USD (Dólar)</option>
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSavePrice(price.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    <Save className="w-4 h-4" />
                                    Guardar
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">
                                      {price.billingCycle.name}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {price.currency === "CLP" ? "$" : "$"}
                                      {price.amount.toLocaleString("es-CL")}
                                      <span className="text-sm font-normal text-gray-500 ml-1">
                                        {price.currency}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditPrice(price)}
                                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                      title="Editar precio"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Eliminar precio"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Cada {price.billingCycle.intervalCount}{" "}
                                  {price.billingCycle.intervalType === "month"
                                    ? "mes"
                                    : price.billingCycle.intervalType === "year"
                                    ? "año"
                                    : price.billingCycle.intervalType}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}



