"use client";

import { useEffect, useState, FormEvent } from "react";
import { Shield, Loader2, Mail, CheckCircle, XCircle } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { requestPasswordChange, verifyAndChangePassword } from "@/services/auth";
import { useAppSelector } from "@/lib/store/hooks";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await requestPasswordChange();
      setSuccess(response.message);
      setStep("verify");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al solicitar cambio de contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyAndChangePassword({
        code: code.toUpperCase(),
        newPassword,
      });
      setSuccess(response.message);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("request");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cambiar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración
            </h1>
            <p className="text-gray-600">
              Cambiar contraseña
            </p>
          </div>

          <div className="bg-white rounded-lg shadow max-w-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Cambiar Contraseña
                </h2>
              </div>

              {step === "request" && (
                <form onSubmit={handleRequestCode} className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Para cambiar tu contraseña, te enviaremos un código de verificación de 6 caracteres a tu correo electrónico.
                    </p>
                    {user && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Email:</span> {user.email}
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Solicitar código de verificación
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === "verify" && (
                <form onSubmit={handleVerifyAndChange} className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Ingresa el código de 6 caracteres que recibiste en tu correo electrónico y tu nueva contraseña.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de verificación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl font-mono tracking-widest uppercase"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el código de 6 caracteres alfanuméricos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu nueva contraseña"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("request");
                        setCode("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError(null);
                        setSuccess(null);
                      }}
                      disabled={loading}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Cambiando...
                        </>
                      ) : (
                        "Cambiar contraseña"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}















