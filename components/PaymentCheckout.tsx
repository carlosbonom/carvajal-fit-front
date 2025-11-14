"use client"

import { useState } from "react"
import { Card } from "@heroui/card"
import { Button } from "@heroui/button"
import { Check, CreditCard, Smartphone } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function PaymentCheckout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan")
  
  const [isAnnual, setIsAnnual] = useState(planFromUrl === "annual")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"webpay" | "mercadopago" | null>(null)

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
    if (!selectedPaymentMethod) {
      alert("Por favor selecciona un método de pago")
      return
    }

    console.log({
      plan: isAnnual ? "annual" : "monthly",
      price: displayPrice,
      paymentMethod: selectedPaymentMethod
    })

    // Aquí irá la lógica de pago
    alert(`Procesando pago con ${selectedPaymentMethod === "webpay" ? "Webpay" : "Mercado Pago"}...`)
  }

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Finalizar Compra
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Revisa tu pedido y selecciona tu método de pago
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Columna Izquierda - Resumen de Membresía */}
          <div className="space-y-6">
            <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl">
              <div className="p-6 space-y-6">
                {/* Switch Mensual / Anual */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Selecciona tu plan
                  </h3>
                  <div className="flex items-center justify-center gap-3 p-4 bg-black/40 rounded-xl">
                    <span
                      className={`text-sm ${
                        !isAnnual ? "text-white font-medium" : "text-gray-500"
                      }`}
                    >
                      Mensual
                    </span>
                    <button
                      onClick={() => setIsAnnual(!isAnnual)}
                      className="relative w-14 h-7 rounded-full transition-colors duration-300"
                      style={{
                        backgroundColor: isAnnual ? "#00b2de" : "#374151",
                      }}
                    >
                      <span
                        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300"
                        style={{
                          transform: isAnnual
                            ? "translateX(28px)"
                            : "translateX(0)",
                        }}
                      />
                    </button>
                    <span
                      className={`text-sm ${
                        isAnnual ? "text-white font-medium" : "text-gray-500"
                      }`}
                    >
                      Anual
                    </span>
                  </div>
                </div>

                {/* Resumen del Plan */}
                <div className="border-t border-[#00b2de20] pt-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Club Carvajal Fit
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Plan {isAnnual ? "Anual" : "Mensual"}
                  </p>

                  {/* Precio */}
                  <div className="bg-[#00b2de10] border border-[#00b2de30] rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-300">Subtotal</span>
                      <span className="text-white font-semibold">
                        ${displayPrice.toLocaleString("es-CL")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">
                        {displayPriceUSD} USD
                      </span>
                      <span className="text-xs text-gray-500">
                        {isAnnual ? "Facturado anualmente" : "Facturado mensualmente"}
                      </span>
                    </div>
                  </div>

                  {/* Beneficios */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      ✨ Incluye:
                    </h4>
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2 text-sm">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-4 h-4 rounded-full bg-[#00b2de33] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-[#00b2de]" />
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {benefit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#00b2de20] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total a pagar
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#00b2de]">
                        ${displayPrice.toLocaleString("es-CL")}
                      </div>
                      <div className="text-sm text-gray-400">
                        {displayPriceUSD} USD
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna Derecha - Método de Pago */}
          <div className="space-y-6">
            <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl">
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">
                  Método de pago
                </h3>

                {/* Opciones de Pago */}
                <div className="space-y-4">
                  {/* Webpay */}
                  <button
                    onClick={() => setSelectedPaymentMethod("webpay")}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedPaymentMethod === "webpay"
                        ? "border-[#00b2de] bg-[#00b2de10]"
                        : "border-[#00b2de30] bg-black/40 hover:border-[#00b2de50]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "webpay"
                            ? "bg-[#00b2de]"
                            : "bg-[#00b2de20]"
                        }`}
                      >
                        <CreditCard
                          className={`w-6 h-6 ${
                            selectedPaymentMethod === "webpay"
                              ? "text-white"
                              : "text-[#00b2de]"
                          }`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-white mb-1">
                          Webpay Plus
                        </h4>
                        <p className="text-xs text-gray-400">
                          Tarjetas de crédito y débito
                        </p>
                      </div>
                      {selectedPaymentMethod === "webpay" && (
                        <div className="w-6 h-6 rounded-full bg-[#00b2de] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Mercado Pago */}
                  <button
                    onClick={() => setSelectedPaymentMethod("mercadopago")}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedPaymentMethod === "mercadopago"
                        ? "border-[#00b2de] bg-[#00b2de10]"
                        : "border-[#00b2de30] bg-black/40 hover:border-[#00b2de50]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedPaymentMethod === "mercadopago"
                            ? "bg-[#00b2de]"
                            : "bg-[#00b2de20]"
                        }`}
                      >
                        <Smartphone
                          className={`w-6 h-6 ${
                            selectedPaymentMethod === "mercadopago"
                              ? "text-white"
                              : "text-[#00b2de]"
                          }`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-white mb-1">
                          Mercado Pago
                        </h4>
                        <p className="text-xs text-gray-400">
                          Múltiples métodos de pago
                        </p>
                      </div>
                      {selectedPaymentMethod === "mercadopago" && (
                        <div className="w-6 h-6 rounded-full bg-[#00b2de] flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Información de Seguridad */}
                <div className="bg-[#00b2de10] border border-[#00b2de20] rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#00b2de20] flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-[#00b2de]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white mb-1">
                        Pago 100% seguro
                      </h5>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Tus datos están protegidos con encriptación de última generación
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón de Pago */}
                <Button
                  size="lg"
                  className={`w-full font-semibold text-white rounded-xl py-7 transition-all ${
                    selectedPaymentMethod
                      ? "opacity-100 hover:scale-[1.02]"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{ backgroundColor: "#00b2de" }}
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod}
                >
                  {selectedPaymentMethod
                    ? `Pagar con ${selectedPaymentMethod === "webpay" ? "Webpay" : "Mercado Pago"}`
                    : "Selecciona un método de pago"}
                </Button>

                {/* Garantía */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Garantía de devolución de 7 días
                  </p>
                </div>
              </div>
            </Card>

            {/* Botón Volver */}
            <Button
              variant="bordered"
              className="w-full border-[#00b2de30] text-gray-300 hover:border-[#00b2de] hover:text-white rounded-xl"
              onClick={() => router.back()}
            >
              ← Volver atrás
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


