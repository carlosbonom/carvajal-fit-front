"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Check, ArrowLeft, Trash2, Plus, Minus, User as UserIcon, Mail, Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./icons";
import { CartItem } from "@/contexts/cart-jose-context";

export interface GuestData {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    shouldRegister: boolean;
}

interface MarketCheckoutViewProps {
    items: CartItem[];
    total: number;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    onCheckout: (method: string, guestData: GuestData) => Promise<void>;
    processing: boolean;
    creatorName: string;
    backUrl: string;
}

export function MarketCheckoutView({
    items,
    total,
    removeItem,
    updateQuantity,
    onCheckout,
    processing,
    creatorName,
    backUrl,
}: MarketCheckoutViewProps) {
    const router = useRouter();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        "webpay" | "mercadopago" | "paypal"
    >("mercadopago");

    const [guestData, setGuestData] = useState<GuestData>({
        name: "",
        email: "",
        shouldRegister: false
    });

    const [errors, setErrors] = useState<Partial<GuestData>>({});

    const handleInputChange = (field: keyof GuestData, value: any) => {
        setGuestData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<GuestData> = {};
        if (!guestData.name) newErrors.name = "El nombre es requerido";
        if (!guestData.email) newErrors.email = "El email es requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) newErrors.email = "Email inválido";

        if (guestData.shouldRegister) {
            if (!guestData.phone) newErrors.phone = "El teléfono es requerido";
            if (!guestData.password) newErrors.password = "La contraseña es requerida";
            else if (guestData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckoutClick = () => {
        if (validateForm()) {
            onCheckout(selectedPaymentMethod, guestData);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-black text-white">
            {/* Botón Volver */}
            <motion.button
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-[#00b2de]/30 bg-[#0a0e12]/80 backdrop-blur-sm text-gray-300 hover:border-[#00b2de] hover:text-white hover:bg-[#0a0e12] transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                onClick={() => router.push(backUrl)}
            >
                <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 py-12">
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
                    className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 40 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                >
                    {/* Columna Izquierda: Items del Carrito y Datos */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-6 md:p-8">

                            {/* Datos de Cliente */}
                            <div className="mb-8 border-b border-white/10 pb-8">
                                <h3 className="text-xl font-bold text-white mb-6">Tus Datos</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Nombre Completo"
                                        placeholder="Ej: Juan Pérez"
                                        value={guestData.name}
                                        onValueChange={(v) => handleInputChange("name", v)}
                                        errorMessage={errors.name}
                                        isInvalid={!!errors.name}
                                        startContent={<UserIcon className="w-4 h-4 text-default-400" />}
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper: "border-white/20 hover:border-[#00b2de]/50 group-data-[focus=true]:border-[#00b2de]",
                                        }}
                                    />
                                    <Input
                                        label="Correo Electrónico"
                                        placeholder="juan@ejemplo.com"
                                        type="email"
                                        value={guestData.email}
                                        onValueChange={(v) => handleInputChange("email", v)}
                                        errorMessage={errors.email}
                                        isInvalid={!!errors.email}
                                        startContent={<Mail className="w-4 h-4 text-default-400" />}
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper: "border-white/20 hover:border-[#00b2de]/50 group-data-[focus=true]:border-[#00b2de]",
                                        }}
                                    />
                                </div>

                                <div className="mt-4">
                                    <Checkbox
                                        isSelected={guestData.shouldRegister}
                                        onValueChange={(v) => handleInputChange("shouldRegister", v)}
                                        color="primary"
                                    >
                                        <span className="text-sm text-gray-300">Quiero crear una cuenta para ver mis compras</span>
                                    </Checkbox>
                                </div>

                                <AnimatePresence>
                                    {guestData.shouldRegister && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-4 overflow-hidden pt-4"
                                        >
                                            <Input
                                                label="Teléfono"
                                                placeholder="+569..."
                                                value={guestData.phone || ""}
                                                onValueChange={(v) => handleInputChange("phone", v)}
                                                errorMessage={errors.phone}
                                                isInvalid={!!errors.phone}
                                                startContent={<Phone className="w-4 h-4 text-default-400" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "border-white/20 hover:border-[#00b2de]/50 group-data-[focus=true]:border-[#00b2de]",
                                                }}
                                            />
                                            <Input
                                                label="Contraseña"
                                                placeholder="******"
                                                type="password"
                                                value={guestData.password || ""}
                                                onValueChange={(v) => handleInputChange("password", v)}
                                                errorMessage={errors.password}
                                                isInvalid={!!errors.password}
                                                startContent={<Lock className="w-4 h-4 text-default-400" />}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: "border-white/20 hover:border-[#00b2de]/50 group-data-[focus=true]:border-[#00b2de]",
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Tu Carrito
                                </span>
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    ({items.length} productos)
                                </span>
                            </h2>

                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.product.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00b2de]/30 transition-colors"
                                        >
                                            {/* Imagen */}
                                            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#0e141b]">
                                                {item.product.thumbnailUrl ? (
                                                    <img
                                                        src={item.product.thumbnailUrl}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <Plus className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-white line-clamp-1">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-[#00b2de]">
                                                        ${item.selectedPrice.amount.toLocaleString("es-CL")}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    {/* Controles cantidad */}
                                                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-medium w-4 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Eliminar */}
                                                    <button
                                                        onClick={() => removeItem(item.product.id)}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Resumen y Pago */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-6 border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Resumen</h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>${total.toLocaleString("es-CL")}</span>
                                    </div>

                                    <div className="pt-2 border-t border-white/10 flex justify-between text-white text-lg font-bold">
                                        <span>Total</span>
                                        <span>${total.toLocaleString("es-CL")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Método de Pago */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-3">
                                    Método de pago
                                </h3>
                                <div className="space-y-3">


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
                                                className="h-12 object-contain"
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
                                                className="h-10 object-contain"
                                                src="https://melli.fydeli.com/carvajal-fit/logos/PayPal-Logo-White-RGB.png"
                                            />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Botón Pago */}
                            <Button
                                className="w-full font-bold text-base py-6 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                                color="primary"
                                disabled={processing || items.length === 0}
                                isLoading={processing}
                                radius="lg"
                                variant="solid"
                                onClick={handleCheckoutClick}
                            >
                                {processing ? "Procesando..." : `Pagar $${total.toLocaleString("es-CL")}`}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
