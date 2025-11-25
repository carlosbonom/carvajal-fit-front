"use client"

import { useState } from "react"
import { Button } from "@heroui/button"
import { Check, Smartphone, ArrowLeft } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Logo } from "./icons"

export function PaymentCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan")
  
  const [isAnnual, setIsAnnual] = useState(planFromUrl === "annual")
  // Mercado Pago siempre seleccionado y no se puede cambiar
  const selectedPaymentMethod = "mercadopago"

  const monthlyPrice = 49990
  const annualPrice = monthlyPrice * 12
  const monthlyPriceUSD = 50
  const annualPriceUSD = monthlyPriceUSD * 12

  const displayPrice = isAnnual ? annualPrice : monthlyPrice
  const displayPriceUSD = isAnnual ? annualPriceUSD : monthlyPriceUSD

  const benefits = [
    "Ruta de entrenamiento estructurada por fases",
    "Guía completa de cardio optimizada",
    "Zoom grupal en vivo todos los viernes",
    "Grupo privado de WhatsApp",
    "Tabla Excel profesional de progreso",
    "Acceso inmediato a todos los planes PDF",
  ]

  const handlePayment = () => {
    console.log({
      plan: isAnnual ? "annual" : "monthly",
      price: displayPrice,
      paymentMethod: selectedPaymentMethod,
      subscription: true
    })

    // Aquí irá la lógica de pago con Mercado Pago suscripción
    alert(`Procesando suscripción con Mercado Pago...`)
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Botón Volver - Icono en esquina superior izquierda */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => router.back()}
        className="absolute top-6 left-6 z-20 w-10 h-10 flex items-center justify-center rounded-full border border-[#00b2de]/30 bg-[#0a0e12]/80 backdrop-blur-sm text-gray-300 hover:border-[#00b2de] hover:text-white hover:bg-[#0a0e12] transition-all duration-300"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        {/* Logo animado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo size={80} />
        </motion.div>

        {/* Contenedor principal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl p-8 md:p-10"
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
                className={`text-sm transition-colors ${
                  !isAnnual ? "text-white font-medium" : "text-gray-500"
                }`}
              >
                Mensual
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isAnnual ? "#00b2de" : "#374151",
                }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300"
                  style={{
                    transform: isAnnual
                      ? "translateX(24px)"
                      : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`text-sm transition-colors ${
                  isAnnual ? "text-white font-medium" : "text-gray-500"
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
            
            {/* Mercado Pago - Siempre seleccionado */}
            <div className="w-full p-2 rounded-xl border-2 border-[#00b2de] bg-[#00b2de]/10">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#00b2de] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <img src="https://melli.fydeli.com/carvajal-fit/logos/mercado_pago_logo.png" alt="Mercado Pago" width={150} height={150} />
              </div>
            </div>
          </div>
          

          {/* Beneficios compactos */}
          <div className="mb-6 pt-4 border-t border-[#00b2de]/20">
            <div className="space-y-1.5">
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2 text-xs text-gray-300"
                >
                 <div className="w-4 h-4 rounded-full bg-[#00b2de33] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-[#00b2de]" />
                  </div>
                  <span className="leading-tight">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Botón de Pago */}
          <Button
            type="button"
            color="primary"
            variant="solid"
            radius="lg"
            className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
            onClick={handlePayment}
          >
            Suscribirse con Mercado Pago
          </Button>
        </motion.div>
      </section>
    </div>
  )
}