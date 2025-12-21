"use client";
import { Accordion, AccordionItem } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
const faqs = [
  {
    question: "¿Qué incluye la membresía mensual?",
    answer:
      "Acceso completo al Club Carvajal Fit, que incluye entrenamientos estructurados mes a mes, biblioteca de videos (gimnasio y casa), cardio guiado, educación práctica en nutrición y mentalidad, Zoom grupales semanales y comunidad privada de apoyo.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí. Puedes cancelar tu membresía cuando quieras, sin contratos ni permanencias obligatorias. Mantienes el acceso hasta el término del período ya pagado.",
  },
  {
    question: "¿Necesito experiencia previa en el gimnasio?",
    answer:
      "No. El club está diseñado para principiantes, intermedios y avanzados. Cada entrenamiento tiene indicaciones claras y opciones de progresión según tu nivel.",
  },
  {
    question: "¿Puedo entrenar desde casa?",
    answer:
      "Sí. El entrenamiento está adecuado tanto para gimnasio como para casa, con alternativas según el equipamiento disponible o si prefieres entrenar sin máquinas.",
  },
  {
    question: "¿Cuánto tiempo debo dedicar al entrenamiento?",
    answer:
      "Entre 45 y 90 minutos por sesión, dependiendo del bloque del mes. El programa está pensado para ser realista y sostenible, incluso con agendas ocupadas.",
  },
  {
    question: "¿Incluye plan de alimentación?",
    answer:
      "Incluye educación nutricional práctica (calorías, macronutrientes, hábitos y criterio). No es una dieta rígida personalizada, sino un sistema para que aprendas a comer bien de forma sostenible y autónoma.",
  },
  {
    question: "¿Cómo funcionan los Zoom grupales?",
    answer:
      "Se realizan todas las semanas, con temas como entrenamiento, nutrición, mentalidad y resolución de dudas. Puedes participar activamente o solo escuchar. Las sesiones quedan grabadas para quienes no puedan asistir en vivo.",
  },
  {
    question: "¿Cuándo veré resultados?",
    answer:
      "La mayoría nota cambios en las primeras 3–4 semanas si sigue el programa con constancia. Los resultados dependen del compromiso, pero el sistema está diseñado para generar progreso real y mantenible.",
  },
];

export function Faq() {
  return (
    <section
      className="text-white items-center justify-center pt-16 pb-16"
      id="faq"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
            Preguntas Frecuentes
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-gray-400 text-center mt-4">
            Resolvemos tus dudas sobre el Club Carvajal Fit
          </p>
        </div>

        <Accordion
          className="max-w-3xl mx-auto text-left font-semibold text-foreground bg-[#080c0f] border border-[#00b2de30] rounded-2xl shadow-lg"
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
          variant="shadow"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              aria-label={faq.question}
              title={
                <p className="text-md md:text-lg  text-white font-semibold">
                  {faq.question}
                </p>
              }
              indicator={
                <ChevronLeft className="w-4 h-4 text-primary-500 transition-transform duration-300 group-data-[open=true]:rotate-180" />
              }
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
  );
}
