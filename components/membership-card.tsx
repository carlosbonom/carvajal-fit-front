import { Check } from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export function MembershipCard() {
  const router = useRouter();
  const benefits = [
    {
      title: "Ruta de entrenamiento estructurada por fases",
      description:
        "Comienzas con 3 meses de definición, luego pasas a una fase de mantenimiento y finalmente a aumento de masa muscular. Cada fase se desbloquea en orden mes a mes.",
      value: "$400.000 (400 USD)",
    },
    {
      title: "Explicación completa sobre cómo hacer el cardio correctamente",
      description:
        "Qué tipo de cardio hacer, en qué momento del día, cuánta duración, y cómo combinarlo con tu entrenamiento.",
      value: "$100.000 (100 USD)",
    },
    {
      title: "Zoom grupal en vivo todos los viernes conmigo",
      description:
        "Espacio para resolver dudas, mantenerte enfocado y corregir el rumbo si es necesario.",
      value: "$50.000 mensual (50 USD)",
    },
    {
      title: "Grupo privado de WhatsApp",
      description:
        "Recibes un mensaje de motivación todos los días a las 5:00 am para empezar enfocado y conectado al proceso y retroalimentación de las personas que están en tu mismo camino.",
      value: "$20.000 mensual (20 USD)",
    },
    {
      title: "Tabla Excel profesional de progreso",
      description:
        "Puedes registrar tu peso, porcentaje de grasa, medidas, fotos y seguir tu evolución con gráficos automáticos.",
      value: "$20.000 (20 USD)",
    },
    {
      title: "Acceso inmediato a todos mis planes en PDF",
      description:
        "Incluye planes de entrenamiento para quemar grasa, tonificar glúteos, abdomen y piernas, y entrenar en casa o gimnasio.",
      value: "más de $80.000 (80 USD)",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-black" id="club">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-2 border-accent/20 shadow-2xl bg-[#080c0f] text-white border-primary-800">
          <CardHeader className="flex flex-col text-center space-y-10 pb-10s text-white">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-bold ">$49.990</div>
              <div className="text-xl text-muted-foreground  text-gray-600 font-semibold">
                MENSUALES
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold ">
                💥 CLUB CARVAJAL FIT
              </h2>
              <p className="text-lg font-semibold ">
                Transforma tu cuerpo. Mantén el foco. Evoluciona cada mes.
              </p>
              <p className="text-base text-muted-foreground italic leading-relaxed text-gray-600">
                &quot;Todos los que pertenecen al club tienen un gran físico y
                mentalidad, sino acá la obtienen&quot;
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <p className="text-sm text-muted-foreground text-gray-600">
                ✅ Valor mensual:{" "}
                <span className="font-semibold  text-white">
                  $49.990 CLP (50 USD)
                </span>
              </p>
              <p className="text-sm text-muted-foreground text-gray-600">
                Entrenar con un personal trainer te puede costar más de{" "}
                <span className="font-semibold">$400.000 al mes (400 USD)</span>
              </p>
              <p className="text-sm text-muted-foreground text-gray-600">
                Entrenar solo y sin guía te puede costar años de errores y
                frustración.
              </p>
              <p className="text-sm font-semibold text-accent text-primary-500">
                Este Club te da una ruta clara y efectiva.
              </p>
            </div>
          </CardHeader>

          <CardBody className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">
                🔥 ¿QUÉ INCLUYE TU SUSCRIPCIÓN?
              </h3>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center bg-primary-900">
                        <Check className="w-4 h-4 text-accent text-primary-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold ">✅ {benefit.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed text-gray-600">
                        {benefit.description}
                      </p>
                      <p className="text-sm font-medium text-accent text-primary-500">
                        Valor referencial: {benefit.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">
                  💰 VALOR TOTAL ESTIMADO: sobre $650.000 CLP (700 USD)
                </p>
                <p className="text-2xl font-bold text-accent text-primary-500">
                  🟢 Tu inversión real: solo $49.990 CLP al mes (50 USD)
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 space-y-3 bg-gray-900">
                <p className="text-base  font-medium leading-relaxed">
                  Este Club no es un plan suelto. Es una guía completa, real y
                  progresiva.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed text-gray-600">
                  Ahorras tiempo, dinero, frustración y años de ensayo y error.
                </p>
                <p className="text-base font-semibold ">
                  No vamos a regalar ni un día más. Te esperamos
                </p>
              </div>

              <Button
                className="w-full font-bold"
                color="primary"
                size="lg"
                variant="solid"
                onClick={() => router.push("/signup")}
              >
                Únete al Club Ahora
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
