"use client"

import { Form } from "@heroui/form"
import { Logo } from "./icons"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [errors, setErrors] = useState({ name: "", email: "", phone: "" })

  const validateName = (value: string) => {
    if (!value) {
      return "El nombre completo es obligatorio"
    }
    if (value.length < 3) {
      return "El nombre debe tener al menos 3 caracteres"
    }
    return ""
  }

  const validateEmail = (value: string) => {
    if (!value) {
      return "El correo electrónico es obligatorio"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Por favor ingresa un correo electrónico válido"
    }
    return ""
  }

  const validatePhone = (value: string) => {
    if (!value) {
      return "El teléfono es obligatorio"
    }
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(value)) {
      return "Por favor ingresa un número de teléfono válido"
    }
    if (value.replace(/\D/g, '').length < 8) {
      return "El teléfono debe tener al menos 8 dígitos"
    }
    return ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const phoneError = validatePhone(phone)
    
    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError
    })

    if (!nameError && !emailError && !phoneError) {
      // Guardar datos del usuario en sessionStorage para usarlos en checkout
      sessionStorage.setItem('signupData', JSON.stringify({ name, email, phone }))
      // Redirigir a la página de checkout
      router.push('/checkout')
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">

      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        {/* Logo animado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Logo size={80} />
        </motion.div>

        {/* Contenedor del formulario */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl  p-8 md:p-10"
        >
          {/* Encabezado */}
          <div className="space-y-3 text-center mb-8">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Tu transformación comienza aquí
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
              Ingresa tus datos para crear tu cuenta
            </p>
          </div>

          {/* Formulario */}
          <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Input
              label="Nombre completo"
              labelPlacement="outside"
              type="text"
              placeholder="Ingresa tu nombre completo"
              variant="bordered"
              radius="lg"
              value={name}
              onValueChange={(value) => {
                setName(value)
                if (errors.name) {
                  setErrors({ ...errors, name: validateName(value) })
                }
              }}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              classNames={{
                input: "text-white",
                inputWrapper: "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400"
              }}
            />
            <Input
              label="Correo electrónico"
              labelPlacement="outside"
              type="email"
              placeholder="tu@email.com"
              variant="bordered"
              radius="lg"
              value={email}
              onValueChange={(value) => {
                setEmail(value)
                if (errors.email) {
                  setErrors({ ...errors, email: validateEmail(value) })
                }
              }}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              classNames={{
                input: "text-white",
                inputWrapper: "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400"
              }}
            />
            <Input
              label="Teléfono"
              labelPlacement="outside"
              type="text"
              placeholder="+56 9 1234 5678"
              variant="bordered"
              radius="lg"
              value={phone}
              onValueChange={(value) => {
                setPhone(value)
                if (errors.phone) {
                  setErrors({ ...errors, phone: validatePhone(value) })
                }
              }}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
              classNames={{
                input: "text-white",
                inputWrapper: "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400"
              }}
            />
            {/* <Input
              label="Contraseña"
              labelPlacement="outside"
              type="password"
              placeholder="Crea una contraseña segura"
              variant="bordered"
              radius="lg"
              classNames={{
                input: "text-white",
                inputWrapper: "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium"
              }}
            /> */}

            <Button
              type="submit"
              color="primary"
              variant="solid"
              radius="lg"
              className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
            >
                Únirse al Club
            </Button>
          </Form>

          {/* Pie de formulario */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Al continuar, aceptas nuestros{" "}
            <Link 
              href="/terminos"
              className="text-[#00b2de] hover:text-[#00d4ff] hover:underline transition-colors"
            >
              Términos y Condiciones
            </Link>
          </p>
        </motion.div>

        {/* Link de login */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-center text-gray-400 mt-2"
        >
          ¿Ya tienes una cuenta?{" "}
          <Link 
            href="/login" 
            className="text-[#00b2de] hover:text-[#00d4ff] hover:underline transition-colors font-medium"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </section>
    </div>
  )
}
