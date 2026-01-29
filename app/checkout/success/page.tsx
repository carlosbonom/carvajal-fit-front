"use client";

import type { UserSubscription } from "@/services/subscriptions";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@heroui/button";

import { Logo } from "@/components/icons";
import { getProfile } from "@/services/auth";
import { validateWebpayPayment, validatePayPalPayment, validateMercadoPagoPayment, validateMercadoPagoSubscription } from "@/services/subscriptions";

function SubscriptionSuccessContent() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      // Verificar si hay parámetros de pago en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token_ws");
      const tbkToken = urlParams.get("TBK_TOKEN"); // Token de transacción rechazada WebPay
      const orderId = urlParams.get("token"); // PayPal retorna orderId como "token"
      const payerId = urlParams.get("PayerID"); // PayPal también puede retornar PayerID
      const paymentId = urlParams.get("payment_id") || urlParams.get("preference_id"); // Mercado Pago retorna payment_id
      const preapprovalId = urlParams.get("preapproval_id"); // Mercado Pago retorna preapproval_id para suscripciones
      const status = urlParams.get("status"); // Mercado Pago retorna status
      const subscriptionId = urlParams.get("subscriptionId");
      const paymentProvider = urlParams.get("paymentProvider") ||
        (token || tbkToken ? "webpay" :
          payerId || orderId ? "paypal" :
            paymentId || status || preapprovalId ? "mercadopago" : null);

      // Si hay TBK_TOKEN, significa que la transacción de WebPay fue rechazada
      if (tbkToken) {
        console.warn("Transacción rechazada por WebPay. TBK_TOKEN:", tbkToken);
        setLoading(false);
        setValidating(false);
        // El estado se manejará en el render para mostrar error
        return;
      }

      // Validar pago de WebPay
      if (token && paymentProvider === "webpay") {
        setValidating(true);
        try {
          console.log("Validando transacción WebPay con token:", token);
          const validationResult = await validateWebpayPayment(token, subscriptionId || undefined);

          if (validationResult.success && validationResult.subscription) {
            setSubscription(validationResult.subscription);

            // Redirigir al club después de 3 segundos
            setTimeout(() => {
              router.push(validationResult.redirectUrl || "/club");
            }, 3000);
            return;
          } else {
            throw new Error("El pago no pudo ser validado");
          }
        } catch (err: any) {
          console.error("Error al validar pago WebPay:", err);
          setError(err.response?.data?.message || err.message || "Error al validar el pago");
          setLoading(false);
          setValidating(false);
          return;
        }
      }

      // Validar pago de PayPal
      if ((orderId || payerId) && paymentProvider === "paypal") {
        setValidating(true);
        try {
          // PayPal retorna orderId como "token" en la URL, o podemos obtenerlo de otro parámetro
          const paypalOrderId = orderId || urlParams.get("orderId");

          if (!paypalOrderId) {
            throw new Error("No se recibió el ID de la orden de PayPal");
          }

          console.log("Validando pago PayPal con orderId:", paypalOrderId);
          const validationResult = await validatePayPalPayment(paypalOrderId, subscriptionId || undefined);

          if (validationResult.success && validationResult.subscription) {
            setSubscription(validationResult.subscription);

            // Redirigir al club después de 3 segundos
            setTimeout(() => {
              router.push(validationResult.redirectUrl || "/club");
            }, 3000);
            return;
          } else {
            throw new Error("El pago no pudo ser validado");
          }
        } catch (err: any) {
          console.error("Error al validar pago PayPal:", err);
          setError(err.response?.data?.message || err.message || "Error al validar el pago");
          setLoading(false);
          setValidating(false);
          return;
        }
      }

      // Validar pago de Mercado Pago
      if ((paymentId || status || preapprovalId) && paymentProvider === "mercadopago") {
        setValidating(true);
        try {
          let validationResult;

          if (preapprovalId) {
            console.log("Validando suscripción Mercado Pago con preapprovalId:", preapprovalId);
            validationResult = await validateMercadoPagoSubscription(preapprovalId);
          } else {
            // Mercado Pago retorna payment_id en la URL cuando el pago es exitoso
            const mercadoPagoPaymentId = paymentId;

            if (!mercadoPagoPaymentId) {
              throw new Error("No se recibió el ID del pago de Mercado Pago");
            }

            // Verificar que el status sea approved
            if (status && status !== "approved") {
              throw new Error(`El pago no fue aprobado. Estado: ${status}`);
            }

            console.log("Validando pago Mercado Pago con paymentId:", mercadoPagoPaymentId);
            validationResult = await validateMercadoPagoPayment(mercadoPagoPaymentId, subscriptionId || undefined);
          }

          if (validationResult.success && validationResult.subscription) {
            setSubscription(validationResult.subscription);

            // Redirigir al club después de 3 segundos
            setTimeout(() => {
              router.push(validationResult.redirectUrl || "/club");
            }, 3000);
            return;
          } else {
            throw new Error("El pago no pudo ser validado");
          }
        } catch (err: any) {
          console.error("Error al validar pago Mercado Pago:", err);
          setError(err.response?.data?.message || err.message || "Error al validar el pago");
          setLoading(false);
          setValidating(false);
          return;
        }
      }

      // Si no hay token de WebPay, esperar un momento para que el webhook procese la notificación
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
      setValidating(false);
    }
  };

  if (loading || validating) {
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
            {validating ? "Validando tu pago..." : "Procesando tu suscripción..."}
          </h2>
          <p className="text-gray-400">
            {validating
              ? "Por favor espera un momento mientras confirmamos tu pago con WebPay."
              : "Por favor espera un momento mientras verificamos el estado de tu pago."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Obtener parámetros de la URL para verificar TBK_TOKEN
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const isActive = subscription?.status === "active";
  const isPending = subscription?.status === "payment_failed";
  const hasError = error !== null || urlParams.get("TBK_TOKEN") !== null;

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
          ) : hasError ? (
            <>
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Error en el Pago
                </h2>
                <p className="text-gray-400">
                  {error || "Hubo un problema al procesar tu pago. La transacción fue rechazada o cancelada. Por favor intenta nuevamente."}
                </p>
                {urlParams.get("TBK_TOKEN") && (
                  <p className="text-yellow-400 text-sm mt-2">
                    La transacción fue rechazada por el banco emisor o cancelada por el usuario.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                  size="lg"
                  variant="solid"
                  onClick={() => router.push("/checkout")}
                >
                  Reintentar Pago
                </Button>
                <Button
                  className="flex-1 font-bold text-base py-6"
                  size="lg"
                  variant="bordered"
                  onClick={() => router.push("/club")}
                >
                  Volver al Club
                </Button>
              </div>
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
