"use client";
import { Accordion, AccordionItem } from "@heroui/react";
import { ChevronDown, ChevronLeft, Icon } from "lucide-react";
const faqs = [
  {
    question: "¿Qué incluye la membresía mensual?",
    answer:
      "La membresía incluye acceso completo a todos los programas de entrenamiento estructurados por fases, zoom grupal semanal en vivo, grupo privado de WhatsApp con motivación diaria, tabla Excel de progreso, todos los PDFs de entrenamiento, y guías de alimentación y mentalidad.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción en cualquier momento. No hay contratos a largo plazo ni penalizaciones por cancelación.",
  },
  {
    question: "¿Necesito experiencia previa en el gimnasio?",
    answer:
      "No, nuestros programas están diseñados para todos los niveles, desde principiantes hasta avanzados. Comenzarás con una evaluación inicial y seguirás un plan personalizado según tu nivel.",
  },
  {
    question: "¿Puedo entrenar desde casa?",
    answer:
      "Sí, ofrecemos planes tanto para gimnasio como para entrenar desde casa. Tendrás acceso a ambas opciones con tu membresía.",
  },
  {
    question: "¿Cuánto tiempo debo dedicar al entrenamiento?",
    answer:
      "Recomendamos entre 45-60 minutos por sesión, de 4 a 6 días por semana, dependiendo de tu fase de entrenamiento y objetivos personales.",
  },
  {
    question: "¿Incluye plan de alimentación?",
    answer:
      "Sí, incluimos guías de alimentación generales y recomendaciones nutricionales. Sin embargo, esto no reemplaza la consulta con un nutricionista profesional para planes personalizados.",
  },
  {
    question: "¿Cómo funcionan los Zoom grupales?",
    answer:
      "Todos los viernes realizamos un Zoom grupal de 1 hora donde resolvemos dudas, compartimos conocimientos nuevos y mantenemos la motivación del grupo. Es un espacio sagrado que no se falla nunca.",
  },
  {
    question: "¿Cuándo veré resultados?",
    answer:
      "Los primeros cambios visibles suelen aparecer entre las 4-6 semanas con constancia. Sin embargo, cada cuerpo es diferente y los resultados dependen de tu dedicación, alimentación y descanso.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="text-white items-center justify-center pt-16 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">Preguntas Frecuentes</h2>
          <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">Resolvemos tus dudas sobre el Club Carvajal Fit</p>
        </div>

        <Accordion 
         motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                height: "auto",
                overflowY: "unset",
                transition: {
                  height: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 1,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 1,
                  },
                },
              },
              exit: {
                y: -10,
                opacity: 0,
                height: 0,
                overflowY: "hidden",
                transition: {
                  height: {
                    easings: "ease",
                    duration: 0.25,
                  },
                  opacity: {
                    easings: "ease",
                    duration: 0.3,
                  },
                },
              },
            },
          }}
        variant="shadow" className="max-w-3xl mx-auto text-left font-semibold text-foreground bg-[#080c0f] border border-[#00b2de30] rounded-2xl shadow-lg">
        {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              aria-label={faq.question}
              title={<p className="text-md md:text-lg  text-white font-semibold">{faq.question}</p>}
              indicator={<ChevronLeft className="w-4 h-4 text-primary-500 transition-transform duration-300 group-data-[open=true]:rotate-180" />}
            //   className="text-lg md:text-xl lg:text-2xl text-white font-semibold"
            >
              <p className="text-xs md:text-sm lg:text-base text-gray-400">
                {faq.answer}
              </p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
