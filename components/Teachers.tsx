import { Card, CardBody } from "@heroui/card";


export function Teachers() {
  return (
    <section id="profesores" className="py-16 md:py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">CONOCE A TUS COACHES</h2>
            <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
                Ellos te acompañarán en tu transformación
            </p>
        </div>

        <Card className="bg-[#0a0e12] border border-[#00b2de30] rounded-2xl shadow-lg max-w-4xl mx-auto p-3 text-white">
          <CardBody className="flex flex-col gap-3 sm:flex-row">
            <div className="mb-8 md:w-4xl">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted ">
                <img
                  src="https://placehold.co/300x300/gray/white?text=Imagen"
                  alt="Gabriel Carvajal"
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-6 text-center">
              <h3 className="text-2xl font-bold">Gabriel y José Carvajal</h3>

              <div className="space-y-4 text-muted-foreground leading-relaxed text-gray-400">
                <p>
                  Personal trainer profesionales con{" "}
                  <span className="font-semibold text-white">11 años de experiencia</span> en el entrenamiento
                  físico, grupal e individualizado.
                </p>

                <p>
                  Han realizado entrenamientos a lo largo del mundo, especialmente{" "}
                  <span className="font-semibold text-white">
                    Miami, Orlando, Tampa, Ciudad de México, Monterrey, Buenos Aires
                  </span>
                  , etc.
                </p>

                <p>
                  Se especializan en{" "}
                  <span className="font-semibold text-white">
                    pérdida de porcentaje de grasa, aumento de masa muscular y entrenamiento para mejorar la salud
                  </span>
                  , siempre con un enfoque saludable y sostenible en el tiempo.
                </p>

                <p>
                  No solo se quedan en la teoría,{" "}
                  <span className="font-semibold text-white">
                    les gusta poner en práctica todo lo que enseñan!!
                  </span>{" "}
                  En sus redes sociales los puedes ver a diario motivando y ejecutando los mismos sistemas de
                  entrenamiento que proponen.
                </p>

                <p className="text-lg font-bold text-accent pt-4 text-primary-500">
                  Súmate!! No hay tiempo que perder para alcanzar tu mejor versión física y mental!!!
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}
