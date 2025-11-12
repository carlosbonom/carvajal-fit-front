"use client"

import { Check } from "lucide-react"
import { Card } from "@heroui/card"
import { Button } from "@heroui/button"
import { useState } from "react"

export function MembershipCardv2() {
  const [isAnnual, setIsAnnual] = useState(false)

  const monthlyPrice = 49990
  const annualPrice = monthlyPrice * 12
  const monthlyPriceUSD = 50
  const annualPriceUSD = monthlyPriceUSD * 12

  const displayPrice = isAnnual ? annualPrice : monthlyPrice
  const displayPriceUSD = isAnnual ? annualPriceUSD : monthlyPriceUSD

  const benefits = [
    "Ruta de entrenamiento estructurada por fases (definición, mantenimiento, volumen)",
    "Guía completa de cardio optimizada",
    "Zoom grupal en vivo todos los viernes",
    "Grupo privado de WhatsApp con mensaje diario 5:00 AM",
    "Tabla Excel profesional de progreso con gráficos automáticos",
    "Acceso inmediato a todos los planes PDF disponibles",
  ]

  return (
    <section className="min-h-screen flex items-center justify-center bg-black py-12 px-4">
      <Card className="max-w-md w-full bg-[#0a0e12] border" style={{ borderColor: "#00b2de30" }}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center gap-3 pb-4 border-b" style={{ borderColor: "#00b2de20" }}>
            <span className={`text-sm ${!isAnnual ? "text-white font-medium" : "text-gray-500"}`}>Mensual</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ backgroundColor: isAnnual ? "#00b2de" : "#374151" }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-md"
                style={{ transform: isAnnual ? "translateX(24px)" : "translateX(0)" }}
              />
            </button>
            <span className={`text-sm ${isAnnual ? "text-white font-medium" : "text-gray-500"}`}>Anual</span>
          </div>

          <div className="text-center space-y-1">
            <div className="text-4xl font-bold text-white">${displayPrice.toLocaleString("es-CL")}</div>
            <div className="text-sm text-gray-400">
              {displayPriceUSD} USD / {isAnnual ? "año" : "mes"}
            </div>
          </div>

          <div className="text-center space-y-2 py-4">
            <h2 className="text-xl font-bold text-white">CLUB CARVAJAL FIT</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Transforma tu cuerpo con una ruta clara y efectiva. Sin errores, sin tiempo perdido.
            </p>
          </div>

          <div className="space-y-2.5">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2.5 text-sm">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#00b2de" }}
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <div className="text-center text-xs text-gray-500">
              Personal trainer +$400.000/mes • Entrenar solo = años de errores
            </div>

            <Button size="lg" className="w-full font-semibold text-white" style={{ backgroundColor: "#00b2de" }}>
            Únete al Club Ahora
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
}
