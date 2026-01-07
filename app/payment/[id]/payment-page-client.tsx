"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Logo } from "@/components/icons";

import {
    getPaymentDetails,
    createWebpayTransaction,
    createPayPalOrder,
    createMercadoPagoCheckout,
    type PaymentDetails,
} from "@/services/subscriptions";
import { useAppSelector } from "@/lib/store/hooks";

interface PaymentPageClientProps {
    id: string;
}

export default function PaymentPageClient({ id }: PaymentPageClientProps) {
    const router = useRouter();

    const [details, setDetails] = useState<PaymentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        "webpay" | "mercadopago" | "paypal"
    >("webpay");

    const user = useAppSelector((state) => state.user.user);

    // Cargar detalles del pago
    useEffect(() => {
        const loadDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getPaymentDetails(id);
                setDetails(data);
            } catch (err: any) {
                console.error("Error al cargar detalles de pago:", err);
                setError("Error al cargar la información del pago. El enlace puede haber expirado o ser inválido.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDetails();
        }
    }, [id]);

    const handlePayment = async () => {
        if (!details) return;

        // Verificar si el usuario está logueado
        if (!user) {
            // Guardar URL de retorno
            const returnUrl = `/payment/${id}`;
            router.push(`/login?callback=${encodeURIComponent(returnUrl)}`);
            return;
        }

        try {
            setProcessing(true);
            setError(null);

            // Validar que el pago pertenece al usuario logueado (si el detalle incluye email)
            // Opcional: El backend también valida esto si pasamos subscriptionId
            if (details.userEmail && user.email !== details.userEmail) {
                // Podríamos mostrar un warning o permitir pagar a nombre de otro?
                // Por seguridad y consistencia, mejor avisar.
                // Pero dado que el backend valida "subscription.user.id !== user.id", fallará allí si no coinciden.
            }

            const commonData = {
                planId: "reuse", // El backend ignorará esto si pasamos subscriptionId
                billingCycleId: "reuse", // El backend ignorará esto si pasamos subscriptionId
                currency: details.currency,
                subscriptionId: details.subscriptionId,
            };

            if (selectedPaymentMethod === "webpay") {
                const webpayResponse = await createWebpayTransaction({
                    ...commonData,
                    planId: "00000000-0000-0000-0000-000000000000", // Dummy UUID
                    billingCycleId: "00000000-0000-0000-0000-000000000000", // Dummy UUID
                });

                const form = document.createElement("form");
                form.method = "POST";
                form.action = webpayResponse.url;

                const tokenInput = document.createElement("input");
                tokenInput.type = "hidden";
                tokenInput.name = "token_ws";
                tokenInput.value = webpayResponse.token;
                form.appendChild(tokenInput);

                document.body.appendChild(form);
                form.submit();
                return;
            }

            if (selectedPaymentMethod === "paypal") {
                const paypalResponse = await createPayPalOrder({
                    ...commonData,
                    planId: "00000000-0000-0000-0000-000000000000",
                    billingCycleId: "00000000-0000-0000-0000-000000000000",
                });

                window.location.href = paypalResponse.approveUrl;
                return;
            }

            if (selectedPaymentMethod === "mercadopago") {
                const mercadoPagoResponse = await createMercadoPagoCheckout({
                    ...commonData,
                    planId: "00000000-0000-0000-0000-000000000000",
                    billingCycleId: "00000000-0000-0000-0000-000000000000",
                });

                window.location.href = mercadoPagoResponse.initPoint;
                return;
            }

        } catch (err: any) {
            console.error("Error al procesar el pago:", err);
            // Extraer mensaje de error
            const message = err.response?.data?.message || err.message || "Error al procesar el pago.";

            // Si el error es "La suscripción no pertenece al usuario", mostrar mensaje amigable
            if (message.includes("pertenece al usuario")) {
                setError("Esta suscripción pertenece a otro usuario. Por favor inicia sesión con la cuenta correcta.");
            } else {
                setError(message);
            }
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#00b2de]" />
            </div>
        );
    }

    if (!details || error) {
        return (
            <div className="min-h-screen w-full relative overflow-hidden bg-black flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-[#0a0e12]/95 border border-red-500/30 rounded-3xl p-8 text-center backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                    <p className="text-gray-400 mb-6">{error || "No se pudo cargar la información."}</p>
                    <Button
                        className="w-full bg-[#00b2de] text-white font-semibold"
                        onClick={() => router.push("/")}
                    >
                        Volver al inicio
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-black">
            {/* Botón Volver */}
            <motion.button
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-[#00b2de]/30 bg-[#0a0e12]/80 backdrop-blur-sm text-gray-300 hover:border-[#00b2de] hover:text-white hover:bg-[#0a0e12] transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                onClick={() => router.push("/")}
            >
                <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-12 text-white">
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 cursor-pointer"
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onClick={() => router.push("/")}
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
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white/90">
                            Pago de Suscripción
                        </h2>
                        <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                            {details.status === 'active' ? 'Renovación de tu membresía' : 'Completa tu pago pendiente'}
                        </p>
                    </div>

                    <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Plan</span>
                            <span className="text-white font-medium">{details.planName}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Ciclo</span>
                            <span className="text-white font-medium capitalize">{details.billingCycle}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Total a pagar</span>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-[#00b2de]">
                                    ${details.amount.toLocaleString("es-CL")}
                                </span>
                                <span className="text-xs text-gray-500 block">{details.currency}</span>
                            </div>
                        </div>
                    </div>

                    {/* Método de Pago */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-white mb-3">
                            Selecciona método de pago
                        </h3>

                        <div className="space-y-3">
                            {/* WebPay */}
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
                                        className="h-8 object-contain"
                                        src="https://melli.fydeli.com/carvajal-fit/logos/1.Webpay_FN_300px.png"
                                    />
                                    <span className="text-sm font-medium ml-auto text-gray-300">Débito / Crédito</span>
                                </div>
                            </button>

                            {/* Mercado Pago */}
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
                                        className="h-8 object-contain"
                                        src="https://melli.fydeli.com/carvajal-fit/logos/mercado_pago_logo.png"
                                    />
                                </div>
                            </button>

                            {/* PayPal */}
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
                                        className="h-8 object-contain"
                                        src="https://melli.fydeli.com/carvajal-fit/logos/PayPal-Logo-White-RGB.png"
                                    />
                                    <span className="text-sm font-medium ml-auto text-gray-300">USD</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
                        color="primary"
                        disabled={processing}
                        radius="lg"
                        type="button"
                        variant="solid"
                        onClick={handlePayment}
                    >
                        {processing ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            !user ? "Iniciar Sesión para Pagar" : "Pagar Ahora"
                        )}
                    </Button>

                    {!user && (
                        <p className="text-center text-xs text-gray-500 mt-4">
                            Serás redirigido al inicio de sesión antes de procesar el pago.
                        </p>
                    )}

                </motion.div>
            </section>
        </div>
    );
}
