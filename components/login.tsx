"use client"

import { Form } from "@heroui/form"
import { Logo } from "./icons"
import { Input } from "@heroui/input"
import { Button } from "@heroui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({ email: "", password: "" })
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

  const validatePassword = (value: string) => {
    if (!value) {
      return "La contraseña es obligatoria"
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres"
    }
    return ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    setErrors({
      email: emailError,
      password: passwordError
    })

    if (!emailError && !passwordError) {
      console.log("Formulario válido", { email, password })
      // Aquí irá la lógica de login
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
              Bienvenido de vuelta
            </h2>
            <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto">
                Ingresa a tu cuenta del Club Carvajal Fit
            </p>
          </div>

          {/* Formulario */}
          <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
              label="Contraseña"
              labelPlacement="outside"
              type="password"
              placeholder="Ingresa tu contraseña"
              variant="bordered"
              radius="lg"
              value={password}
              onValueChange={(value) => {
                setPassword(value)
                if (errors.password) {
                  setErrors({ ...errors, password: validatePassword(value) })
                }
              }}
              isInvalid={!!errors.password}
              errorMessage={errors.password}
              classNames={{
                input: "text-white",
                inputWrapper: "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400"
              }}
            />

            {/* Link olvidaste contraseña */}
            <div className="flex justify-end -mt-3">
              <Link 
                href="/recuperar-password" 
                className="text-xs text-gray-400 hover:text-[#00b2de] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              color="primary"
              variant="solid"
              radius="lg"
              className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
            >
              Iniciar sesión
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

        {/* Link de registro */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-center text-gray-400 mt-2"
        >
          ¿No tienes una cuenta?{" "}
          <Link 
            href="/signup" 
            className="text-[#00b2de] hover:text-[#00d4ff] hover:underline transition-colors font-medium"
          >
            Regístrate
          </Link>
        </motion.p>
      </section>
    </div>
  )
}