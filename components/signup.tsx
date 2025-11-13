"use client"

import { Form } from "@heroui/form"
import { Logo } from "./icons"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Signup() {
  return (
    <section className="flex flex-col items-center justify-center h-screen w-full px-6  text-white">
      {/* Logo animado */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Logo size={100} />
      </motion.div> */}

      {/* Contenedor del formulario */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md md:max-w-xl  border border-[#00b2de30] bg-[#0a0e12]/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8"
      >
        {/* Encabezado */}
        <div className="space-y-3 text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Tu transformación comienza aquí
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-sm mx-auto">
            Ingresa tus datos para crear tu cuenta y continuar con el pago 💪
          </p>
        </div>

        {/* Formulario */}
        <Form className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            labelPlacement="outside"
            type="text"
            placeholder="Nombre completo"
            variant="bordered"
            radius="lg"
            className="text-white placeholder-gray-500"
          />
          <Input
            type="email"
            placeholder="Correo electrónico"
            variant="bordered"
            radius="lg"
            className="text-white placeholder-gray-500"
          />
          <Input
            type="text"
            placeholder="Teléfono"
            variant="bordered"
            radius="lg"
            className="text-white placeholder-gray-500"
          />
          <Input
            type="password"
            placeholder="Contraseña"
            variant="bordered"
            radius="lg"
            className="text-white placeholder-gray-500"
          />

          <Button
            type="submit"
            color="primary"
            variant="solid"
            radius="lg"
            className="w-full font-bold text-base py-6 mt-2 transition-transform hover:scale-[1.02]"
          >
            Crear cuenta y continuar con el pago
          </Button>
        </Form>

        {/* Pie de formulario */}
        <p className="text-gray-500 text-xs text-center mt-6">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#00b2de] hover:underline cursor-pointer">
            Términos y Condiciones
          </span>
          .
        </p>
      </motion.div>

      <p className="text-xs text-center text-white mt-3">¿Ya tienes una cuenta? <Link href="/login" className="text-[#00b2de] hover:underline cursor-pointer">Inicia sesión</Link></p>
    </section>
  )
}
