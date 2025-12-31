"use client";

import { Card, CardBody } from "@heroui/card";
import { motion } from "framer-motion";

export function Teachers() {
  return (
    <section
      className="py-16 md:py-24 text-white bg-transparent"
      id="profesores"
    >
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-xl max-w-5xl mx-auto overflow-hidden">
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-6">
              {/* Imagen */}
              <div className="flex justify-center">
                <div className="aspect-square w-64 md:w-80 rounded-2xl overflow-hidden shadow-lg border border-[#00b2de20]">
                  <img
                    alt="Gabriel y José Carvajal"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    src="https://melli.fydeli.com/carvajal-fit/Foto%20Quienes%20son%20tus%20Coaches.webp"
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
                      Miami, Orlando, Tampa, Ciudad de México, Monterrey, Buenos
                      Aires
                    </span>{" "}
                    y más.
                  </p>

                  <p>
                    Especialistas en{" "}
                    <span className="font-semibold text-white">
                      pérdida de grasa, aumento de masa muscular y mejora
                      integral de la salud
                    </span>
                    , con un enfoque sostenible y realista.
                  </p>

                  <p>
                    <span className="font-semibold text-white">
                      Divulgadores de Mentalidad y Disciplina:
                    </span>{" "}
                    A través de sus charlas y podcasts, comparten herramientas
                    sobre espiritualidad, abundancia y el dominio de la
                    gratificación instantánea.
                  </p>

                  <p>
                    Su enfoque busca equilibrar el rendimiento físico con los
                    pilares mentales y espirituales que discuten en sus
                    plataformas de contenido, promoviendo una{" "}
                    <span className="font-semibold text-white">
                      disciplina inquebrantable
                    </span>
                    .
                  </p>

                  <p>
                    No solo enseñan:{" "}
                    <span className="font-semibold text-white">
                      viven lo que predican
                    </span>
                    . En sus redes los verás aplicando diariamente los mismos
                    sistemas y valores que comparten en sus charlas y episodios.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
