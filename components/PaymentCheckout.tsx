"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Check, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { Logo } from "./icons";

import {
  getPlans,
  createSubscription,
  createWebpayTransaction,
  createPayPalOrder,
  createPayPalSubscription,
  createMercadoPagoCheckout,
  type Plan,
  type Price,
} from "@/services/subscriptions";
import { getProfile } from "@/services/auth";
import { useAppSelector } from "@/lib/store/hooks";

function PaymentCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan");

  const [isAnnual, setIsAnnual] = useState(planFromUrl === "annual");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "webpay" | "mercadopago" | "paypal" | "mercadopago-subscription"
  >("webpay");
  const user = useAppSelector((state) => state.user.user);

  // Cargar planes del API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPlans();

        // Obtener el primer plan (CLUB CARVAJAL FIT)
        if (response.plans && response.plans.length > 0) {
          setPlan(response.plans[0]);
        }
      } catch (err) {
        setError("Error al cargar los planes");
        console.error("Error al cargar planes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Cambiar el método de pago por defecto cuando cambia el ciclo
  useEffect(() => {
    if (isAnnual) {
      setSelectedPaymentMethod("webpay");
    } else {
      setSelectedPaymentMethod("mercadopago-subscription");
    }
  }, [isAnnual]);

  // Obtener precios según el ciclo de facturación
  const getPriceByCycle = (
    prices: Price[],
    cycle: "month" | "year",
    currency: "CLP" | "USD",
  ): number | null => {
    const price = prices.find(
      (p) => p.billingCycle.intervalType === cycle && p.currency === currency,
    );

    return price ? price.amount : null;
  };

  const monthlyPriceCLP = plan?.prices
    ? (getPriceByCycle(plan.prices, "month", "CLP") ?? 49990)
    : 49990;
  const annualPriceCLP = plan?.prices
    ? (getPriceByCycle(plan.prices, "year", "CLP") ?? 599880)
    : 599880;
  const monthlyPriceUSD = plan?.prices
    ? (getPriceByCycle(plan.prices, "month", "USD") ?? 50)
    : 50;
  const annualPriceUSD = plan?.prices
    ? (getPriceByCycle(plan.prices, "year", "USD") ?? 600)
    : 600;

  const displayPrice = isAnnual ? annualPriceCLP : monthlyPriceCLP;
  const displayPriceUSD = isAnnual ? annualPriceUSD : monthlyPriceUSD;

  const benefits = plan?.features || [
    "Ruta de entrenamiento estructurada por fases",
    "Guía completa de cardio optimizada",
    "Zoom grupal en vivo todos los viernes",
    "Grupo privado de WhatsApp",
    "Tabla Excel profesional de progreso",
    "Acceso inmediato a todos los planes PDF",
  ];

  const handlePayment = async () => {
    if (!plan) {
      setError("No se ha cargado el plan. Por favor, recarga la página.");

      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Obtener el precio según el ciclo seleccionado
      const selectedCycle = isAnnual ? "year" : "month";
      const selectedPrice = plan.prices.find(
        (p) =>
          p.billingCycle.intervalType === selectedCycle && p.currency === "CLP",
      );

      if (!selectedPrice) {
        throw new Error("No se encontró el precio para el ciclo seleccionado");
      }

      // Si es WebPay, usar el nuevo flujo
      if (selectedPaymentMethod === "webpay") {
        const webpayResponse = await createWebpayTransaction({
          planId: plan.id,
          billingCycleId: selectedPrice.billingCycle.id,
          currency: selectedPrice.currency,
        });

        // WebPay requiere enviar un formulario POST con el token
        // Crear y enviar formulario automáticamente
        const form = document.createElement("form");
        form.method = "POST";
        form.action = webpayResponse.url;

        // Agregar el token como input hidden
        const tokenInput = document.createElement("input");
        tokenInput.type = "hidden";
        tokenInput.name = "token_ws";
        tokenInput.value = webpayResponse.token;
        form.appendChild(tokenInput);

        // Agregar el formulario al body y enviarlo
        document.body.appendChild(form);
        form.submit();

        return;
      }

      // Para PayPal
      if (selectedPaymentMethod === "paypal") {
        if (!isAnnual) {
          // Suscripción mensual (PayPal Subscription)
          const paypalSubscriptionResponse = await createPayPalSubscription({
            planId: plan.id,
            billingCycleId: selectedPrice.billingCycle.id,
            currency: selectedPrice.currency,
          });

          // Redirigir a PayPal para aprobar la suscripción
          window.location.href = paypalSubscriptionResponse.approveUrl;
          return;
        } else {
          // Pago anual (PayPal Order - Pago único)
          const paypalResponse = await createPayPalOrder({
            planId: plan.id,
            billingCycleId: selectedPrice.billingCycle.id,
            currency: selectedPrice.currency,
          });

          // Redirigir a PayPal para aprobar el pago
          window.location.href = paypalResponse.approveUrl;
          return;
        }
      }

      // Para Mercado Pago Checkout (nueva API)
      if (selectedPaymentMethod === "mercadopago") {
        const mercadoPagoResponse = await createMercadoPagoCheckout({
          planId: plan.id,
          billingCycleId: selectedPrice.billingCycle.id,
          currency: selectedPrice.currency,
        });

        // Redirigir a Mercado Pago Checkout
        window.location.href = mercadoPagoResponse.initPoint;
        return;
      }

      // Para Mercado Pago Suscripción (Preapproval)
      if (selectedPaymentMethod === "mercadopago-subscription") {
        // Fallthrough to generic subscription creation
      }

      // Para otros métodos de pago (legacy)
      // Obtener datos del usuario si están disponibles
      let userEmail = user?.email;
      let userName = user?.name;

      // Si no hay datos del usuario en Redux, intentar obtenerlos del perfil
      if (!userEmail || !userName) {
        try {
          const profile = await getProfile();

          userEmail = profile.email;
          userName = profile.name || undefined;
        } catch (err) {
          console.warn("No se pudo obtener el perfil del usuario:", err);
        }
      }

      // Crear la suscripción
      const subscriptionData = {
        planId: plan.id,
        billingCycleId: selectedPrice.billingCycle.id,
        currency: selectedPrice.currency,
        paymentMethod: (selectedPaymentMethod === "mercadopago-subscription" ? "mercadopago" : selectedPaymentMethod) as "mercadopago" | "paypal",
        payerEmail: userEmail,
        payerFirstName: userName?.split(" ")[0],
        payerLastName: userName?.split(" ").slice(1).join(" "),
        backUrl: `${window.location.origin}/checkout/success`,
      };

      const response = await createSubscription(subscriptionData);

      // Redirigir según el método de pago
      if (response.url) {
        // Redirigir a otro método
        window.location.href = response.url;
      } else if (response.initPoint) {
        // Redirigir a Mercado Pago (Suscripción)
        window.location.href = response.initPoint;
      } else {
        throw new Error(
          response.message || "No se recibió URL de redirección para el pago",
        );
      }
    } catch (err: any) {
      console.error("Error al procesar el pago:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Error al procesar el pago. Por favor, intenta nuevamente.",
      );
      setProcessing(false);
    }
  };

  // Componente Skeleton para el estado de carga
  const PaymentSkeleton = () => (
    <div className="min-h-screen w-full relative overflow-hidden">
      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-[#00b2de]/30 bg-[#0a0e12]/80 backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Logo size={80} />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-8 md:p-10"
          initial={{ opacity: 0, y: 40 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          <div className="space-y-3 text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto rounded bg-white/5" />
            <Skeleton className="h-4 w-64 mx-auto rounded bg-white/5" />
          </div>

          <div className="mb-6 space-y-6">
            <div className="flex items-center justify-center gap-3 pb-4 border-b border-[#00b2de20]">
              <Skeleton className="h-4 w-16 rounded bg-white/5" />
              <Skeleton className="h-6 w-12 rounded-full bg-white/5" />
              <Skeleton className="h-4 w-16 rounded bg-white/5" />
            </div>

            <div className="text-center space-y-2">
              <Skeleton className="h-12 w-32 mx-auto rounded bg-white/5" />
              <Skeleton className="h-4 w-24 mx-auto rounded bg-white/5" />
              <Skeleton className="h-3 w-32 mx-auto rounded bg-white/5" />
            </div>
          </div>

          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-3 rounded bg-white/5" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
              <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
            </div>
          </div>

          <div className="mb-6 pt-4 border-t border-[#00b2de]/20">
            <div className="space-y-1.5">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-white/5" />
                  <Skeleton className="h-3 flex-1 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
        </motion.div>
      </section>
    </div>
  );

  if (loading) {
    return <PaymentSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Botón Volver - Icono en esquina superior izquierda */}
      <motion.button
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-[#00b2de]/30 bg-[#0a0e12]/80 backdrop-blur-sm text-gray-300 hover:border-[#00b2de] hover:text-white hover:bg-[#0a0e12] transition-all duration-300"
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.5 }}
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        {/* Logo animado */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => router.push("/")}
        >
          <Logo size={80} />
        </motion.div>

        {/* Contenedor principal */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-8 md:p-10"
          initial={{ opacity: 0, y: 40 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          {/* Encabezado */}
          <div className="space-y-3 text-center mb-8">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Finalizar Suscripción
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
              Revisa tu plan y completa el pago
            </p>
          </div>

          {/* Switch Mensual / Anual y Precio */}
          <div className="mb-6 space-y-6">
            {/* Switch Mensual / Anual */}
            <div className="flex items-center justify-center gap-3 pb-4 border-b border-[#00b2de20]">
              <span
                className={`text-sm transition-colors ${!isAnnual ? "text-white font-medium" : "text-gray-500"
                  }`}
              >
                Mensual
              </span>
              <button
                className="relative w-12 h-6 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isAnnual ? "#00b2de" : "#374151",
                }}
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300"
                  style={{
                    transform: isAnnual ? "translateX(24px)" : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`text-sm transition-colors ${isAnnual ? "text-white font-medium" : "text-gray-500"
                  }`}
              >
                Anual
              </span>
            </div>

            {/* Precio */}
            <div className="text-center space-y-1">
              <div className="text-4xl font-bold text-white">
                ${displayPrice.toLocaleString("es-CL")}
              </div>
              <div className="text-sm text-gray-400">
                {displayPriceUSD} USD / {isAnnual ? "año" : "mes"}
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Renovación automática
              </p>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">
              Método de pago
            </h3>

            <div className="space-y-3">
              {/* WebPay - Solo Anual */}
              {isAnnual && (
                <button
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${selectedPaymentMethod === "webpay"
                    ? "border-[#00b2de] bg-[#00b2de]/10"
                    : "border-[#00b2de]/20 bg-transparent hover:border-[#00b2de]/40"
                    }`}
                  type="button"
                  onClick={() => setSelectedPaymentMethod("webpay")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedPaymentMethod === "webpay"
                        ? "bg-[#00b2de]"
                        : "bg-gray-600 border-2 border-gray-500"
                        }`}
                    >
                      {selectedPaymentMethod === "webpay" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <img
                      alt="WebPay"
                      className="h-10 object-contain"
                      src="https://melli.fydeli.com/carvajal-fit/logos/1.Webpay_FN_300px.png"
                    />
                  </div>
                </button>
              )}

              {/* Mercado Pago One-Time - Solo Anual */}
              {isAnnual && (
                <button
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${selectedPaymentMethod === "mercadopago"
                    ? "border-[#00b2de] bg-[#00b2de]/10"
                    : "border-[#00b2de]/20 bg-transparent hover:border-[#00b2de]/40"
                    }`}
                  type="button"
                  onClick={() => setSelectedPaymentMethod("mercadopago")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedPaymentMethod === "mercadopago"
                        ? "bg-[#00b2de]"
                        : "bg-gray-600 border-2 border-gray-500"
                        }`}
                    >
                      {selectedPaymentMethod === "mercadopago" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <img
                      alt="Mercado Pago"
                      className="h-12 object-contain"
                      src="https://melli.fydeli.com/carvajal-fit/logos/mercado_pago_logo.png"
                    />
                  </div>
                </button>
              )}

              {/* Mercado Pago Suscripción - Solo Mensual */}
              {!isAnnual && (
                <button
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${selectedPaymentMethod === "mercadopago-subscription"
                    ? "border-[#00b2de] bg-[#00b2de]/10"
                    : "border-[#00b2de]/20 bg-transparent hover:border-[#00b2de]/40"
                    }`}
                  type="button"
                  onClick={() => setSelectedPaymentMethod("mercadopago-subscription")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedPaymentMethod === "mercadopago-subscription"
                        ? "bg-[#00b2de]"
                        : "bg-gray-600 border-2 border-gray-500"
                        }`}
                    >
                      {selectedPaymentMethod === "mercadopago-subscription" && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <img
                      alt="Mercado Pago"
                      className="h-12 object-contain"
                      src="https://melli.fydeli.com/carvajal-fit/logos/mercado_pago_logo.png"
                    />
                  </div>
                </button>
              )}

              {/* PayPal - Disponible en ambos */}
              <button
                className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${selectedPaymentMethod === "paypal"
                  ? "border-[#00b2de] bg-[#00b2de]/10"
                  : "border-[#00b2de]/20 bg-transparent hover:border-[#00b2de]/40"
                  }`}
                type="button"
                onClick={() => setSelectedPaymentMethod("paypal")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedPaymentMethod === "paypal"
                      ? "bg-[#00b2de]"
                      : "bg-gray-600 border-2 border-gray-500"
                      }`}
                  >
                    {selectedPaymentMethod === "paypal" && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <img
                    alt="PayPal"
                    className="h-10 object-contain"
                    src="https://melli.fydeli.com/carvajal-fit/logos/PayPal-Logo-White-RGB.png"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Beneficios compactos */}
          <div className="mb-6 pt-4 border-t border-[#00b2de]/20">
            <div className="space-y-1.5">
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-4 h-4 rounded-full bg-[#00b2de33] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#00b2de]" />
                  </div>
                  <span className="leading-tight">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Botón de Pago */}
          <Button
            className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            color="primary"
            disabled={processing || !plan}
            radius="lg"
            type="button"
            variant="solid"
            onClick={handlePayment}
          >
            {processing
              ? "Procesando..."
              : `Suscribirse con ${selectedPaymentMethod === "webpay"
                ? "WebPay"
                : selectedPaymentMethod === "mercadopago"
                  ? "Mercado Pago"
                  : selectedPaymentMethod === "mercadopago-subscription"
                    ? "Mercado Pago (Suscripción)"
                    : "PayPal"
              }`}
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

export function PaymentCheckout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-white">Cargando...</div>
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}
