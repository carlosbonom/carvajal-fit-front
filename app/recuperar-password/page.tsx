"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { ArrowLeft, Mail, Key, Lock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import { Logo } from "@/components/icons";
import { forgotPassword, resetPassword, login, getProfile } from "@/services/auth";
import { saveTokens } from "@/lib/auth-utils";
import { useAppDispatch } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/userSlice";

export default function RecuperarPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMigration, setIsMigration] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const mode = searchParams.get("mode");
    const initialEmail = searchParams.get("email");
    const initialCode = searchParams.get("code");

    if (mode === "verify" && initialEmail && initialCode) {
      setStep("verify");
      setEmail(initialEmail);
      setCode(initialCode);
      setIsMigration(true);
    }
  }, [searchParams]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", code: "", newPassword: "", confirmPassword: "" });

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "El email es requerido" }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "El email no es válido" }));
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("Código enviado a tu correo electrónico");
      setStep("verify");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Error al enviar el código";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", code: "", newPassword: "", confirmPassword: "" });

    if (!code) {
      setErrors((prev) => ({ ...prev, code: "El código es requerido" }));
      return;
    }

    if (code.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        code: "El código debe tener 6 caracteres",
      }));
      return;
    }

    if (!newPassword) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "La nueva contraseña es requerida",
      }));
      return;
    }

    if (newPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "La contraseña debe tener al menos 8 caracteres",
      }));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Las contraseñas no coinciden",
      }));
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      toast.success("Contraseña restablecida exitosamente");

      // Auto-login if migration or if desired for better UX
      if (isMigration || true) { // Enable auto-login for all
        try {
          const loginResponse = await login({ email, password: newPassword });
          saveTokens(loginResponse.accessToken, loginResponse.refreshToken);
          const userProfile = await getProfile(loginResponse.accessToken);
          dispatch(setUser(userProfile));

          router.push("/club");
          return; // Stop execution here to prevent redirect to login
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          toast.error("Por favor inicia sesión con tu nueva contraseña");
        }
      }

      router.push("/login");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Error al restablecer la contraseña";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <section className="w-full max-w-md">
        {/* Logo y botón volver */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/login"
            className="flex items-center gap-2 text-gray-400 hover:text-[#00b2de] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver al login</span>
          </Link>
          <Logo />
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 border border-[#00b2de]/20 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === "request"
              ? "Recuperar Contraseña"
              : isMigration ? "Activa tu cuenta" : "Verificar Código"}
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            {step === "request"
              ? "Ingresa tu email para recibir un código de verificación"
              : isMigration
                ? "Configura tu nueva contraseña para acceder a la plataforma"
                : "Ingresa el código que recibiste por email y tu nueva contraseña"}
          </p>

          {step === "request" ? (
            <Form onSubmit={handleRequestCode}>
              <Input
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                  label: "!text-white font-medium",
                }}
                errorMessage={errors.email}
                isInvalid={!!errors.email}
                label="Email"
                labelPlacement="outside"
                placeholder="tu@email.com"
                radius="lg"
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                type="email"
                value={email}
                variant="bordered"
                onValueChange={(value) => {
                  setEmail(value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
              />

              <Button
                className="w-full font-bold text-base py-6 mt-6 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
                color="primary"
                isDisabled={isLoading}
                isLoading={isLoading}
                radius="lg"
                type="submit"
                variant="solid"
              >
                Enviar Código
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleResetPassword}>
              <div className="space-y-4">
                <Input
                  classNames={{
                    input: "text-white text-center text-lg tracking-widest",
                    inputWrapper:
                      "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                    label: "!text-white font-medium",
                  }}
                  errorMessage={errors.code}
                  isInvalid={!!errors.code}
                  label="Código de Verificación"
                  labelPlacement="outside"
                  maxLength={6}
                  placeholder="ABC123"
                  radius="lg"
                  startContent={<Key className="w-4 h-4 text-gray-400" />}
                  value={code}
                  variant="bordered"
                  // Deshabilitar edición de código si es migración para evitar errores, pero permitir si el usuario quiere cambiarlo
                  isReadOnly={isMigration}
                  onValueChange={(value) => {
                    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    setCode(upperValue.slice(0, 6));
                    if (errors.code) {
                      setErrors((prev) => ({ ...prev, code: "" }));
                    }
                  }}
                />

                <Input
                  classNames={{
                    input: "text-white",
                    inputWrapper:
                      "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                    label: "!text-white font-medium",
                  }}
                  errorMessage={errors.newPassword}
                  isInvalid={!!errors.newPassword}
                  label="Nueva Contraseña"
                  labelPlacement="outside"
                  placeholder="Mínimo 8 caracteres"
                  radius="lg"
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  type="password"
                  value={newPassword}
                  variant="bordered"
                  onValueChange={(value) => {
                    setNewPassword(value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }
                  }}
                />

                <Input
                  classNames={{
                    input: "text-white",
                    inputWrapper:
                      "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                    label: "!text-white font-medium",
                  }}
                  errorMessage={errors.confirmPassword}
                  isInvalid={!!errors.confirmPassword}
                  label="Confirmar Contraseña"
                  labelPlacement="outside"
                  placeholder="Repite la contraseña"
                  radius="lg"
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  type="password"
                  value={confirmPassword}
                  variant="bordered"
                  onValueChange={(value) => {
                    setConfirmPassword(value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 font-bold text-base py-6 transition-all hover:scale-[1.02]"
                  color="default"
                  isDisabled={isLoading}
                  radius="lg"
                  type="button"
                  variant="bordered"
                  onPress={() => {
                    setStep("request");
                    setIsMigration(false);
                    router.replace("/recuperar-password"); // Clear params
                  }}
                >
                  Volver
                </Button>
                <Button
                  className="w-full font-bold text-base py-6 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
                  color="primary"
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  radius="lg"
                  type="submit"
                  variant="solid"
                >
                  {isMigration ? "Activar y Entrar" : "Restablecer"}
                </Button>
              </div>
            </Form>
          )}
        </motion.div>
      </section>
    </div>
  );
}





