"use client";

import type { UserSubscription } from "@/services/subscriptions";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@heroui/button";

import { Logo } from "@/components/icons";
import { getProfile } from "@/services/auth";

function SubscriptionSuccessContent() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Esperar un momento para que el webhook procese la notificación
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Obtener perfil del usuario que incluye la suscripción
      const response = await getProfile();

      setSubscription(response.subscription);

      // Si la suscripción está activa, redirigir automáticamente al club después de 3 segundos
      if (response.subscription?.status === "active") {
        setTimeout(() => {
          router.push("/club");
        }, 3000);
      }
    } catch (err) {
      console.error("Error al verificar suscripción:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-black">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="w-16 h-16 mx-auto text-[#00b2de] animate-spin" />
          <h2 className="text-2xl font-bold text-white">
            Procesando tu suscripción...
          </h2>
          <p className="text-gray-400">
            Por favor espera un momento mientras verificamos el estado de tu
            pago.
          </p>
        </motion.div>
      </div>
    );
  }

  const isActive = subscription?.status === "active";
  const isPending = subscription?.status === "payment_failed";

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        {/* Logo animado */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => router.push("/")}
        >
          <Logo size={80} />
        </motion.div>

        {/* Contenedor principal */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center space-y-6"
          initial={{ opacity: 0, y: 40 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          {isActive ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  ¡Suscripción Activada! 🎉
                </h2>
                <p className="text-gray-400">
                  Tu suscripción ha sido activada exitosamente.
                </p>
                <p className="text-sm text-[#00b2de] mt-2">
                  Serás redirigido al Club en unos segundos...
                </p>
                {subscription && (
                  <div className="mt-4 p-4 rounded-lg bg-[#00b2de]/10 border border-[#00b2de]/30 text-left space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Plan: </span>
                      <span className="text-white font-semibold">
                        {subscription.plan.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ciclo: </span>
                      <span className="text-white font-semibold">
                        {subscription.billingCycle.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        Próxima renovación:{" "}
                      </span>
                      <span className="text-white font-semibold">
                        {new Date(
                          subscription.currentPeriodEnd,
                        ).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <Button
                className="w-full font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                size="lg"
                onClick={() => router.push("/club")}
              >
                Ir al Club
              </Button>
            </>
          ) : isPending ? (
            <>
              <XCircle className="w-20 h-20 mx-auto text-yellow-500" />
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Pago Pendiente
                </h2>
                <p className="text-gray-400">
                  Tu suscripción está pendiente de autorización. Recibirás una
                  notificación cuando se procese.
                </p>
              </div>
              <Button
                className="w-full font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                size="lg"
                onClick={() => router.push("/club")}
              >
                Ver Estado
              </Button>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Error en el Pago
                </h2>
                <p className="text-gray-400">
                  Hubo un problema al procesar tu pago. Por favor intenta
                  nuevamente.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                  size="lg"
                  variant="solid"
                  onClick={() => router.push("/pricing")}
                >
                  Volver a Planes
                </Button>
                <Button
                  className="flex-1 font-bold text-base py-6"
                  size="lg"
                  variant="bordered"
                  onClick={() => router.push("/checkout")}
                >
                  Reintentar
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </section>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-white">Cargando...</div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
