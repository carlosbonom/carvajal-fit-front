"use client"

import {
  Brain,
  TrendingUp,
  Video,
  Gift,
  Check,
  GraduationCap,
  Calendar,
} from "lucide-react"
import { Card } from "@heroui/card"
import { Button } from "@heroui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function MembershipCardv2() {
  const router = useRouter()
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

  const features = [
    {
      icon: Calendar,
      title: "Planificación Mensual",
      description:
        "Videos de entrenamiento, guía de alimentación y mentalidad.",
    },
    {
      icon: GraduationCap,
      title: "Aprende Mientras Entrenas",
      description:
        "Ciclo de 6 meses: Definición → Mantenimiento → Aumento de masa muscular",
    },
    {
      icon: Gift,
      title: "Contenido Gratis",
      description: "Todos los PDF de entrenamiento incluidos",
    },
    {
      icon: Video,
      title: "Zoom Semanal en Vivo",
      description:
        "Viernes 1 hora para resolver dudas y nuevos conocimientos",
    },
    {
      icon: Brain,
      title: "Transformación Mental",
      description: "Mentalidad inquebrantable en 6 meses",
    },
    {
      icon: TrendingUp,
      title: "Resultados Sostenibles",
      description: "Sin efecto rebote, mantén tus logros",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse items-center justify-center bg-black py-16 px-6 gap-12">
      {/* --- Caja de Membresía --- */}
      <section className="w-full max-w-md">
        <Card
          className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-lg"
        >
          <div className="p-8 space-y-8">
            {/* Switch Mensual / Anual */}
            <div className="flex items-center justify-center gap-3 pb-4 border-b border-[#00b2de20]">
              <span
                className={`text-sm ${
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
                className={`text-sm ${
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
            </div>

            {/* Título */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                CLUB CARVAJAL FIT
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                Transforma tu cuerpo con una ruta clara y efectiva. Sin errores,
                sin tiempo perdido.
              </p>
            </div>

            {/* Beneficios */}
            <div className="space-y-2.5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2.5 text-sm">
                  <div className="flex-shrink-0">
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

            {/* CTA */}
            <div className="pt-4 space-y-3">
              <div className="text-center text-xs text-gray-500">
                Personal trainer +$400.000/mes • Entrenar solo = años de
                errores
              </div>

              <Button
                size="lg"
                className="w-full font-semibold text-white rounded-xl py-6"
                style={{ backgroundColor: "#00b2de" }}
                onClick={() => router.push(`/checkout?plan=${isAnnual ? 'annual' : 'monthly'}`)}
              >
                Únete al Club Ahora
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* --- Sección de Features --- */}
      <section className="w-full max-w-3xl text-center">
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            ¿QUÉ ENCONTRARÁS EN EL CLUB?
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
            Todo lo que necesitas para lograr tu objetivo rápidamente.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-[#00b2de20] bg-[#0e141b]/70 rounded-xl p-5 hover:border-[#00b2de70] transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00b2de20] flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#00b2de]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="font-semibold text-white text-sm uppercase mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
