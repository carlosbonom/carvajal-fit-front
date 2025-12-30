"use client";

import {
  Brain,
  TrendingUp,
  Video,
  Gift,
  Check,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getPlans, type Plan, type Price } from "@/services/subscriptions";

export function MembershipCardv2() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    "Ruta de entrenamiento estructurada por fases (definición, mantenimiento, volumen)",
    "Guía completa de cardio optimizada",
    "Zoom grupal en vivo todos los viernes",
    "Grupo privado de WhatsApp con mensaje diario 5:00 AM",
    "Tabla Excel profesional de progreso con gráficos automáticos",
    "Acceso inmediato a todos los planes PDF disponibles",
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "Metodología por Fases: Definición, Mantenimiento y Volumen",
      description:
        "Una ruta clara diseñada por ambos hermanos para que sepas exactamente qué hacer en cada etapa de tu evolución física.",
    },
    {
      icon: Calendar,
      title: "Mentorías de Mentalidad y Abundancia (Martes)",
      description:
        "Sesiones en vivo de alto nivel para hackear tu disciplina, dominar la gratificación instantánea y alinear tu mente con el éxito.",
    },
    {
      icon: Video,
      title: "Sesiones de Preguntas y Respuestas (Viernes)",
      description:
        "1 hora semanal de acceso directo con nosotros para resolver dudas de entrenamiento y dieta en tiempo real via zoom",
    },
    {
      icon: Gift,
      title: "Grupo Privado de WhatsApp",
      description:
        "Acceso a nuestra comunidad de alto rendimiento con mensajes de motivación diaria y retroalimentación constante.",
    },
    {
      icon: GraduationCap,
      title: "Guía de Alimentación y Nutrición",
      description:
        "Aprende a nutrir tu cuerpo de manera efectiva con nuestra guía de alimentación diseñada para acompañar tus fases de entrenamiento.",
    },
    {
      icon: TrendingUp,
      title: "Protocolo de Cardio Optimizado",
      description:
        "Explicación completa sobre qué tipo de cardio hacer, en qué momento del día y cómo combinarlo para maximizar tus resultados.",
    },
    {
      icon: Brain,
      title: "Programa de Transformación Mental",
      description:
        "Acceso a la sección exclusiva de videos sobre mentalidad inquebrantable para asegurar un cambio interno permanente.",
    },
    {
      icon: TrendingUp,
      title: "Sistema de Mantenimiento y Cero Rebote",
      description:
        "No buscamos un cambio temporal. Te damos las herramientas para que mantengas tus logros y tu nueva identidad de por vida.",
    },
  ];

  // Componente Skeleton para el estado de carga
  const MembershipSkeleton = () => (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse items-center justify-center bg-black py-16 px-6 gap-12">
      {/* --- Caja de Membresía Skeleton --- */}
      <section className="w-full max-w-md">
        <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-lg">
          <div className="p-8 space-y-8">
            {/* Switch Skeleton */}
            <div className="flex items-center justify-center gap-3 pb-4 border-b border-[#00b2de20]">
              <Skeleton className="h-4 w-16 rounded bg-white/5" />
              <Skeleton className="h-6 w-12 rounded-full bg-white/5" />
              <Skeleton className="h-4 w-16 rounded bg-white/5" />
            </div>

            {/* Precio Skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-12 w-32 mx-auto rounded bg-white/5" />
              <Skeleton className="h-4 w-24 mx-auto rounded bg-white/5" />
            </div>

            {/* Título Skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 mx-auto rounded bg-white/5" />
              <Skeleton className="h-4 w-full max-w-sm mx-auto rounded bg-white/5" />
              <Skeleton className="h-4 w-3/4 mx-auto rounded bg-white/5" />
            </div>

            {/* Beneficios Skeleton */}
            <div className="space-y-2.5">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex gap-2.5">
                  <Skeleton className="h-4 w-4 rounded-full flex-shrink-0 bg-white/5" />
                  <Skeleton className="h-4 flex-1 rounded bg-white/5" />
                </div>
              ))}
            </div>

            {/* CTA Skeleton */}
            <div className="pt-4 space-y-3">
              <Skeleton className="h-3 w-full rounded bg-white/5" />
              <Skeleton className="h-12 w-full rounded-xl bg-white/5" />
            </div>
          </div>
        </Card>
      </section>

      {/* --- Sección de Features Skeleton --- */}
      <section className="w-full max-w-3xl text-center">
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-64 mx-auto rounded bg-white/5" />
          <Skeleton className="h-4 w-96 mx-auto rounded bg-white/5" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="border border-[#00b2de20] bg-[#0e141b]/70 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0 bg-white/5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded bg-white/5" />
                  <Skeleton className="h-3 w-full rounded bg-white/5" />
                  <Skeleton className="h-3 w-5/6 rounded bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  if (loading) {
    return <MembershipSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse items-center justify-center bg-black py-16 px-6 gap-12">
      {/* --- Caja de Membresía --- */}
      <section className="w-full max-w-md">
        <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-lg">
          <div className="p-8 space-y-8">
            {/* Switch Mensual / Anual */}
            <div
              className="relative flex items-center justify-center gap-4 py-5 px-6 mb-6 rounded-xl backdrop-blur-sm border border-[#00b2de40] shadow-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(0, 178, 222, 0.15) 0%, rgba(0, 100, 200, 0.15) 100%)",
              }}
            >
              {/* Glow effect */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: "radial-gradient(circle at 50% 50%, rgba(0, 178, 222, 0.3) 0%, transparent 70%)",
                }}
              />

              <span
                className={`relative z-10 text-sm font-semibold transition-all duration-300 ${!isAnnual ? "text-white scale-105" : "text-gray-400"
                  }`}
              >
                Mensual
              </span>
              <button
                className="relative z-10 w-14 h-7 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: isAnnual ? "#00b2de" : "#374151",
                  boxShadow: isAnnual ? "0 0 20px rgba(0, 178, 222, 0.4)" : "none",
                }}
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300"
                  style={{
                    transform: isAnnual ? "translateX(28px)" : "translateX(0)",
                  }}
                />
              </button>
              <span
                className={`relative z-10 text-sm font-semibold transition-all duration-300 ${isAnnual ? "text-white scale-105" : "text-gray-400"
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
                {plan?.name || "CLUB CARVAJAL FIT"}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                {plan?.description ||
                  "Transforma tu cuerpo con una ruta clara y efectiva. Sin errores, sin tiempo perdido."}
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
                  <p className="text-gray-300 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4 space-y-3">
              <div className="text-center text-xs text-gray-500">
                Personal trainer +$400.000/mes • Entrenar solo = años de errores
              </div>

              <Button
                className="w-full font-semibold text-white rounded-xl py-6"
                size="lg"
                style={{ backgroundColor: "#00b2de" }}
                onClick={() => router.push("/signup")}
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
            DOMINA TU CUERPO Y TU MENTE: EL ECOSISTEMA CARVAJALFIT
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
  );
}
