"use client";

import type { Country } from "react-phone-number-input";

import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneInput, {
  isValidPhoneNumber,
  parsePhoneNumber,
  getCountryCallingCode,
} from "react-phone-number-input";

import { Logo } from "./icons";

import { register, getProfile } from "@/services/auth";
import { saveTokens, getAccessToken } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/userSlice";
import { store } from "@/lib/store/store";

import "react-phone-number-input/style.css";

export default function Signup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<Country>("CL");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  // Verificar si hay un usuario logueado al cargar el componente
  useEffect(() => {
    const checkExistingUser = async () => {
      // Verificar si ya hay usuario en Redux
      let currentUser = store.getState().user.user;

      // Si no hay usuario en Redux, intentar cargarlo desde el token
      if (!currentUser) {
        const token = getAccessToken();

        if (token) {
          try {
            const userProfile = await getProfile(token);

            dispatch(setUser(userProfile));
            currentUser = userProfile;
          } catch (error) {
            console.error("Error al cargar usuario:", error);
          }
        }
      }

      // Si hay usuario logueado, verificar su subscription
      if (currentUser) {
        if (!currentUser.subscription) {
          // Si subscription es null, redirigir al checkout
          router.push("/checkout");

          return;
        } else {
          // Si tiene subscription, redirigir al club (ya está registrado)
          router.push("/club");

          return;
        }
      }

      // Si no hay usuario, permitir ver el formulario
      setIsCheckingUser(false);
    };

    checkExistingUser();
  }, []);

  // También verificar cuando cambie el usuario en Redux
  useEffect(() => {
    if (user) {
      if (!user.subscription) {
        router.push("/checkout");
      } else {
        router.push("/club");
      }
    }
  }, [user]);

  // Función para parsear el número de teléfono y extraer countryCode y phone
  const parsePhoneNumberData = (phoneValue: string, countryValue: Country) => {
    if (!phoneValue) {
      return { countryCode: "", phone: "" };
    }

    try {
      const phoneNumber = parsePhoneNumber(phoneValue, countryValue);

      if (phoneNumber && phoneNumber.isValid()) {
        const countryCode = phoneNumber.countryCallingCode;
        const nationalNumber = phoneNumber.nationalNumber;

        return {
          countryCode: countryCode || "",
          phone: nationalNumber || "",
        };
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
    }

    // Fallback: si no se puede parsear, usar el país actual para obtener el código
    try {
      if (countryValue) {
        const countryCode = getCountryCallingCode(countryValue);
        // Intentar extraer el número sin el código de país
        const phoneWithoutPlus = phoneValue.replace(/^\s*\+?\s*/, "");
        const countryCodeString = countryCode.toString();
        let phone = phoneWithoutPlus;

        // Si el número comienza con el código de país, quitarlo
        if (phoneWithoutPlus.startsWith(countryCodeString)) {
          phone = phoneWithoutPlus.substring(countryCodeString.length).trim();
        }

        return {
          countryCode: countryCodeString,
          phone: phone || phoneWithoutPlus,
        };
      }
    } catch (error) {
      console.error("Error in fallback parsing:", error);
    }

    // Último fallback: devolver el número completo como phone
    return { countryCode: "", phone: phoneValue.replace(/^\s*\+?\s*/, "") };
  };

  const validateName = (value: string) => {
    if (!value) {
      return "El nombre completo es obligatorio";
    }
    if (value.length < 3) {
      return "El nombre debe tener al menos 3 caracteres";
    }

    return "";
  };

  const validateEmail = (value: string) => {
    if (!value) {
      return "El correo electrónico es obligatorio";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return "Por favor ingresa un correo electrónico válido";
    }

    return "";
  };

  const validatePhone = (value: string | undefined) => {
    if (!value) {
      return "El teléfono es obligatorio";
    }
    if (!isValidPhoneNumber(value)) {
      return "Por favor ingresa un número de teléfono válido";
    }

    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) {
      return "La contraseña es obligatoria";
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const passwordError = validatePassword(password);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
    });

    if (!nameError && !emailError && !phoneError && !passwordError) {
      setIsLoading(true);
      try {
        // Parsear el número de teléfono para separar countryCode y phone
        const { countryCode: parsedCountryCode, phone: parsedPhone } =
          parsePhoneNumberData(phone, country);

        // Preparar datos para el registro
        const registerData = {
          email,
          password,
          name,
          phone: parsedPhone,
          countryCode: parsedCountryCode,
          // Puedes agregar más campos opcionales aquí si los necesitas
          // preferredCurrency: 'CLP',
        };

        const response = await register(registerData);

        // Guardar tokens en localStorage
        saveTokens(response.accessToken, response.refreshToken);

        // Obtener el perfil del usuario con /auth/me
        const userProfile = await getProfile(response.accessToken);

        // Guardar el usuario en Redux
        dispatch(setUser(userProfile));

        // Redirigir según si tiene subscription o no
        if (!userProfile.subscription) {
          // Si no tiene subscription, redirigir al checkout
          router.push("/checkout");
        } else {
          // Si tiene subscription, redirigir al club
          router.push("/club");
        }
      } catch (error: any) {
        console.error("Error en registro:", error);
        if (error.response) {
          // Error de la API
          const errorMessage =
            error.response.data?.message ||
            (Array.isArray(error.response.data?.message)
              ? error.response.data.message.join(", ")
              : "Error al registrar usuario");

          // Verificar si el error es de email ya registrado
          const isEmailRegisteredError =
            errorMessage.toLowerCase().includes("email") &&
            (errorMessage.toLowerCase().includes("ya está registrado") ||
              errorMessage.toLowerCase().includes("ya existe") ||
              errorMessage.toLowerCase().includes("already registered") ||
              errorMessage.toLowerCase().includes("already exists"));

          if (isEmailRegisteredError) {
            // Redirigir al login con el email precargado (el toast se mostrará en login)
            router.push(`/login?email=${encodeURIComponent(email)}`);

            return;
          }

          setSubmitError(errorMessage);
        } else if (error.request) {
          // Error de red
          setSubmitError(
            "Error de conexión. Por favor, verifica tu conexión a internet.",
          );
        } else {
          // Otro error
          setSubmitError(
            "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Mostrar loading mientras se verifica el usuario
  if (isCheckingUser) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 py-2 text-white">
        {/* Logo animado */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onClick={() => router.push("/")}
        >
          <Logo size={80} />
        </motion.div>

        {/* Contenedor del formulario */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md md:max-w-lg border border-[#00b2de]/20 bg-[#0a0e12]/95 backdrop-blur-xl rounded-3xl  p-8 md:p-10"
          initial={{ opacity: 0, y: 40 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
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
              classNames={{
                input: "text-white",
                inputWrapper:
                  "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400",
              }}
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              label="Nombre completo"
              labelPlacement="outside"
              placeholder="Ingresa tu nombre completo"
              radius="lg"
              type="text"
              value={name}
              variant="bordered"
              onValueChange={(value) => {
                setName(value);
                if (errors.name) {
                  setErrors({ ...errors, name: validateName(value) });
                }
              }}
            />
            <Input
              classNames={{
                input: "text-white",
                inputWrapper:
                  "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400",
              }}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label="Correo electrónico"
              labelPlacement="outside"
              placeholder="tu@email.com"
              radius="lg"
              type="email"
              value={email}
              variant="bordered"
              onValueChange={(value) => {
                setEmail(value);
                if (errors.email) {
                  setErrors({ ...errors, email: validateEmail(value) });
                }
              }}
            />
            <div className="flex flex-col gap-2 w-full">
              <label
                className="text-white font-medium text-sm"
                htmlFor="phone-input-field"
              >
                Teléfono
              </label>
              <div className="w-full">
                <PhoneInput
                  international
                  className={`phone-input-custom ${errors.phone ? "phone-input-error" : ""}`}
                  country={country}
                  defaultCountry="CL"
                  numberInputProps={{
                    className: "text-white",
                    id: "phone-input-field",
                  }}
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onBlur={() => {
                    if (phone) {
                      setErrors({ ...errors, phone: validatePhone(phone) });
                    }
                  }}
                  onChange={(value) => {
                    setPhone(value || "");
                    // Detectar automáticamente el país del número ingresado
                    if (value) {
                      try {
                        const phoneNumber = parsePhoneNumber(value);

                        if (phoneNumber && phoneNumber.country) {
                          setCountry(phoneNumber.country);
                        }
                      } catch (error) {
                        // Si no se puede detectar, mantener el país actual
                      }
                    }
                    if (errors.phone) {
                      setErrors({ ...errors, phone: validatePhone(value) });
                    }
                  }}
                  onCountryChange={(countryValue) => {
                    if (countryValue) {
                      setCountry(countryValue);
                    }
                  }}
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <Input
              classNames={{
                input: "text-white",
                inputWrapper:
                  "border-[#00b2de]/30 hover:border-[#00b2de]/50 focus-within:border-[#00b2de] transition-colors bg-black/30",
                label: "!text-white font-medium",
                errorMessage: "text-red-400",
              }}
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label="Contraseña"
              labelPlacement="outside"
              placeholder="Crea una contraseña segura"
              radius="lg"
              type="password"
              value={password}
              variant="bordered"
              onValueChange={(value) => {
                setPassword(value);
                if (errors.password) {
                  setErrors({ ...errors, password: validatePassword(value) });
                }
              }}
            />

            {submitError && (
              <div className="text-red-400 text-sm text-center mt-2">
                {submitError}
              </div>
            )}

            <Button
              className="w-full font-bold text-base py-6 mt-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,178,222,0.4)]"
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              radius="lg"
              type="submit"
              variant="solid"
            >
              Crear cuenta y continuar
            </Button>
          </Form>

          {/* Pie de formulario */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Al continuar, aceptas nuestros{" "}
            <Link
              className="text-[#00b2de] hover:text-[#00d4ff] hover:underline transition-colors"
              href="/terminos"
            >
              Términos y Condiciones
            </Link>
          </p>
        </motion.div>

        {/* Link de login */}
        <motion.p
          animate={{ opacity: 1 }}
          className="text-sm text-center text-gray-400 mt-2"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            className="text-[#00b2de] hover:text-[#00d4ff] hover:underline transition-colors font-medium"
            href="/login"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </section>
    </div>
  );
}
