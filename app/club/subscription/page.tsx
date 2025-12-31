"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Calendar, Check, Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { getUserSubscription } from "@/services/subscriptions";

export default function SubscriptionPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      if (user?.subscription) {
        const sub = await getUserSubscription();
        setSubscription(sub);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Error al cargar suscripción:", error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <h1 className="text-xl md:text-2xl font-bold">Mi Suscripción</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 md:px-8 py-6 md:py-8">
        {user?.subscription ? (
          <div className="space-y-6">
            {/* Estado de la suscripción */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#00b2de]/10 border border-[#00b2de]/20">
                  <CreditCard className="w-5 h-5 text-[#00b2de]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Estado de la suscripción</h2>
                  <p className="text-sm text-white/60">Información de tu plan actual</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/70">Estado</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.subscription.status === "active"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {user.subscription.status === "active" ? "Activa" : "Inactiva"}
                  </span>
                </div>

                {subscription?.plan && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Plan</span>
                      <span className="text-white font-medium">{subscription.plan.name}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Ciclo de facturación</span>
                      <span className="text-white font-medium">{subscription.billingCycle?.name || "N/A"}</span>
                    </div>
                  </>
                )}

                {user.subscription.startedAt && (
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span className="text-white/70">Inicio:</span>
                    <span className="text-white font-medium">{formatDate(user.subscription.startedAt)}</span>
                  </div>
                )}

                {subscription?.currentPeriodEnd && (
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <Calendar className="w-4 h-4 text-white/60" />
                    <span className="text-white/70">Próximo pago:</span>
                    <span className="text-white font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Características del plan */}
            {subscription?.plan?.features && subscription.plan.features.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4">Características incluidas</h3>
                <div className="space-y-2">
                  {subscription.plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <Check className="w-4 h-4 text-[#00b2de] flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No tienes una suscripción activa</h2>
            <p className="text-white/60 mb-6">Suscríbete para acceder a todo el contenido</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[#00b2de] text-white rounded-lg hover:bg-[#00a0c8] transition-colors font-medium"
            >
              Ver planes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

