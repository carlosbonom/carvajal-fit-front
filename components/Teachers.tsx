"use client"

import { Card, CardBody } from "@heroui/card"
import { motion } from "framer-motion"

export function Teachers() {
  return (
    <section id="profesores" className="py-16 md:py-24 text-white bg-transparent">
      <div className="container mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
            Conoce a tus coaches
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
            Ellos te acompañarán en tu transformación
          </p>
        </div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-xl max-w-5xl mx-auto overflow-hidden">
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
              {/* Imagen */}
              <div className="flex justify-center">
                <div className="aspect-square w-64 md:w-80 rounded-2xl overflow-hidden shadow-lg border border-[#00b2de20]">
                  <img
                    src="https://placehold.co/400x400/gray/white?text=Gabriel+y+José"
                    alt="Gabriel y José Carvajal"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Texto */}
              <div className="text-center md:text-left space-y-5">
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  Gabriel y José Carvajal
                </h3>

                <div className="space-y-3 text-gray-400 leading-relaxed">
                  <p>
                    Personal trainers profesionales con{" "}
                    <span className="font-semibold text-white">
                      más de 11 años de experiencia
                    </span>{" "}
                    en el entrenamiento físico, grupal e individualizado.
                  </p>

                  <p>
                    Han entrenado a personas en{" "}
                    <span className="font-semibold text-white">
                      Miami, Orlando, Tampa, Ciudad de México, Monterrey, Buenos Aires
                    </span>{" "}
                    y más.
                  </p>

                  <p>
                    Especialistas en{" "}
                    <span className="font-semibold text-white">
                      pérdida de grasa, aumento de masa muscular y mejora integral de la salud
                    </span>
                    , con un enfoque sostenible y realista.
                  </p>

                  <p>
                    No solo enseñan:{" "}
                    <span className="font-semibold text-white">
                      viven lo que predican
                    </span>
                    . En sus redes los verás aplicando los mismos sistemas que comparten.
                  </p>

                  <p className="text-lg font-semibold text-[#00b2de] pt-3">
                    ¡Súmate! El momento para alcanzar tu mejor versión es ahora 💪
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
