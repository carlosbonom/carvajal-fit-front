"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/userSlice";
import { getUserProfile, updateProfile, type UpdateProfileDto } from "@/services/user-profile";
import { ConfirmModal } from "@/components/confirm-modal";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    countryCode: "",
    preferredWeightUnit: "kg" as "kg" | "lb",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profile, sub] = await Promise.all([
        getUserProfile(),
        import("@/services/subscriptions").then(m => m.getUserSubscription())
      ]);

      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        countryCode: profile.countryCode || "",
        preferredWeightUnit: (profile.preferredWeightUnit || "kg") as "kg" | "lb",
      });
      setSubscription(sub);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      setError(null);
      setIsModalOpen(false);
      const { cancelSubscription } = await import("@/services/subscriptions");
      await cancelSubscription("Cancelado por el usuario desde su perfil");
      setSuccess(true);

      // Recargar datos para actualizar el estado de la suscripción en la UI
      const sub = await import("@/services/subscriptions").then(m => m.getUserSubscription());
      setSubscription(sub);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error al cancelar suscripción:", error);
      setError(error.response?.data?.message || "Error al cancelar la suscripción");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      setSaving(true);
      const updateData: UpdateProfileDto = {};

      if (formData.name !== (user?.name || "")) {
        updateData.name = formData.name || undefined;
      }
      if (formData.phone !== (user?.phone || "")) {
        updateData.phone = formData.phone || undefined;
      }
      if (formData.countryCode !== (user?.countryCode || "")) {
        updateData.countryCode = formData.countryCode || undefined;
      }
      if (formData.preferredWeightUnit !== (user?.preferredWeightUnit || "kg")) {
        updateData.preferredWeightUnit = formData.preferredWeightUnit;
      }

      const updated = await updateProfile(updateData);
      if (user) {
        dispatch(setUser({ ...user, ...updated } as typeof user));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      setError(error.response?.data?.message || "Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00b2de] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0b0b]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-3 md:px-8 py-2 md:py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/club")}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold">Mi Perfil</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 md:px-8 py-6 md:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              Perfil actualizado exitosamente
            </div>
          )}

          {/* Email (readonly) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/50 cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">El email no se puede cambiar</p>
          </div>

          {/* Nombre */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-medium text-white mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
            />
          </div>

          {/* Teléfono */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-medium text-white mb-2">
              Teléfono
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                placeholder="+56"
                maxLength={4}
                className="w-20 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="123456789"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
              />
            </div>
          </div>

          {/* Unidad de peso preferida */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <label className="block text-sm font-medium text-white mb-2">
              Unidad de peso preferida
            </label>
            <select
              value={formData.preferredWeightUnit}
              onChange={(e) => setFormData({ ...formData, preferredWeightUnit: e.target.value as "kg" | "lb" })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00b2de] focus:ring-1 focus:ring-[#00b2de]/30"
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="lb">Libras (lb)</option>
            </select>
            <p className="text-xs text-white/40 mt-1">
              Esta unidad se usará para mostrar y registrar tu peso
            </p>
          </div>

          {/* Suscripción */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              Suscripción al Club
            </h2>

            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                  <div>
                    <p className="font-bold text-[#00b2de]">{subscription.plan?.name}</p>
                    <p className="text-sm text-white/60">
                      Estado: <span className={
                        subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                      }>
                        {subscription.status === 'active' ? 'Activa' :
                          subscription.status === 'cancelled' ? 'Cancelada' : subscription.status}
                      </span>
                    </p>
                    {subscription.currentPeriodEnd && (
                      <p className="text-xs text-white/40 mt-1">
                        Siguiente cobro/vencimiento: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {subscription.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      disabled={cancelling}
                      className="px-4 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {cancelling ? "Cancelando..." : "Cancelar Suscripción"}
                    </button>
                  )}
                </div>

                {subscription.status === 'cancelled' && (
                  <p className="text-sm text-yellow-400/80 bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10">
                    Tu suscripción ha sido cancelada. Podrás seguir usando el club hasta que finalice tu periodo actual.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                <p className="text-white/60 text-sm">No tienes una suscripción activa</p>
                <button
                  type="button"
                  onClick={() => router.push("/club")}
                  className="px-4 py-2 text-sm bg-[#00b2de] hover:bg-[#00a0c8] text-white rounded-lg transition-colors font-medium"
                >
                  Ver planes
                </button>
              </div>
            )}
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelSubscription}
        title="Cancelar Suscripción"
        message="¿Estás seguro de que deseas cancelar tu suscripción al Club? Perderás el acceso al finalizar tu periodo actual."
        type="danger"
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        loading={cancelling}
        variant="club"
      />
    </div>
  );
}

