"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Logo } from "@/components/icons";
import { marketPaymentService } from "@/services/market-payments";
import { useCartJose } from "@/contexts/cart-jose-context";

function MarketValidateContent() {
    const router = useRouter();
    const { clearCart } = useCartJose();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"success" | "failed" | "pending">("pending");
    const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<any>(null);

    useEffect(() => {
        validateTransaction();
    }, []);

    const validateTransaction = async () => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentProvider = urlParams.get("paymentProvider") || "webpay";

            let response;

            if (paymentProvider === "webpay") {
                const token = urlParams.get("token_ws");
                const tbkToken = urlParams.get("TBK_TOKEN");
                const tbkOrdenCompra = urlParams.get("TBK_ORDEN_COMPRA");

                // Caso: Transacción abortada por el usuario (TBK_TOKEN presente)
                if (tbkToken && !token) {
                    console.warn("Transacción abortada por usuario");
                    setStatus("failed");
                    setError("La transacción fue cancelada por el usuario.");
                    setLoading(false);
                    return;
                }

                // Caso: Error en timeout (TBK_ORDEN_COMPRA sin token_ws)
                if (tbkOrdenCompra && !token) {
                    console.warn("Transacción fallida (timeout o error)");
                    setStatus("failed");
                    setError("La transacción ha expirado o falló.");
                    setLoading(false);
                    return;
                }

                if (!token) {
                    setStatus("failed");
                    setError("No se recibió el token de validación");
                    setLoading(false);
                    return;
                }

                console.log("Validando transacción Webpay con token:", token);
                response = await marketPaymentService.validateWebpay("jose", token);
            } else if (paymentProvider === "mercadopago") {
                const paymentId = urlParams.get("payment_id");
                const mpStatus = urlParams.get("status");
                const externalReference = urlParams.get("external_reference");

                if (!paymentId || !mpStatus) {
                    setStatus("failed");
                    setError("No se recibieron los datos de Mercado Pago");
                    setLoading(false);
                    return;
                }

                console.log("Validando transacción Mercado Pago:", paymentId);
                response = await marketPaymentService.validateMercadoPago(
                    "jose",
                    paymentId,
                    mpStatus,
                    externalReference || ""
                );
            } else if (paymentProvider === "paypal") {
                const token = urlParams.get("token"); // PayPal Order ID

                if (!token) {
                    setStatus("failed");
                    setError("No se recibió el token de PayPal");
                    setLoading(false);
                    return;
                }

                console.log("Validando transacción PayPal:", token);
                response = await marketPaymentService.validatePayPal("jose", token);
            }

            if (response && response.status === "completed") {
                setStatus("success");
                setOrderDetails(response.order);
                clearCart(); // Limpiar carrito tras éxito
            } else {
                setStatus("failed");
                setError("El pago fue rechazado o no se pudo completar.");
            }

        } catch (err: any) {
            console.error("Error validando transacción:", err);
            setStatus("failed");
            setError(err.response?.data?.message || err.message || "Error al validar el pago");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 mx-auto text-[#00b2de] animate-spin" />
                    <h2 className="text-2xl font-bold">Verificando tu compra...</h2>
                    <p className="text-gray-400">Por favor espera un momento mientras confirmamos el pago.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-black">
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
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
                    className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-8 md:p-10 text-center space-y-6"
                    initial={{ opacity: 0, y: 40 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                >
                    {status === "success" ? (
                        <>
                            <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
                            <div className="space-y-3">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                                    ¡Compra Exitosa! 🎉
                                </h2>
                                <p className="text-gray-400">
                                    Tu pedido está confirmado.
                                </p>
                                {orderDetails && (
                                    <div className="p-4 bg-white/5 rounded-xl text-sm text-left space-y-2">
                                        <p><span className="text-gray-400">Orden:</span> {orderDetails.orderNumber || orderDetails.id}</p>
                                        <p><span className="text-gray-400">Total:</span> ${Number(orderDetails.total).toLocaleString('es-CL')}</p>
                                    </div>
                                )}
                            </div>
                            <Button
                                className="w-full font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                                onClick={() => router.push("/market/jose")}
                            >
                                Volver a la Tienda
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
                                    {error || "Hubo un problema al procesar tu pago."}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1 font-bold text-base py-6 bg-[#00b2de] hover:bg-[#00a0c8]"
                                    onClick={() => router.push("/market/jose/checkout")}
                                >
                                    Reintentar
                                </Button>
                                <Button
                                    className="flex-1 font-bold text-base py-6"
                                    variant="bordered"
                                    onClick={() => router.push("/market/jose")}
                                >
                                    Volver
                                </Button>
                            </div>
                        </>
                    )}
                </motion.div>
            </section>
        </div>
    );
}

export default function MarketValidatePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Cargando...</div>}>
            <MarketValidateContent />
        </Suspense>
    );
}
