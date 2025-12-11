"use client";

import { useEffect, useState } from "react";
import { Settings, Save, User, Bell, Shield, Globe } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
  ];

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
              Administra la configuración de tu panel de administración
            </p>
          </div>

          <div className="bg-white rounded-lg shadow">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Configuración General
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Plataforma
                        </label>
                        <input
                          type="text"
                          defaultValue="Carvajal Fit"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email de Contacto
                        </label>
                        <input
                          type="email"
                          defaultValue="contacto@carvajalfit.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zona Horaria
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                          <option value="America/Santiago">America/Santiago (CLT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Información del Perfil
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre
                        </label>
                        <input
                          type="text"
                          defaultValue="Admin"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="admin@carvajalfit.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Preferencias de Notificaciones
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Notificaciones por Email
                          </p>
                          <p className="text-sm text-gray-500">
                            Recibe notificaciones importantes por correo electrónico
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Nuevas Suscripciones
                          </p>
                          <p className="text-sm text-gray-500">
                            Notificarme cuando un nuevo miembro se suscribe
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Cancelaciones
                          </p>
                          <p className="text-sm text-gray-500">
                            Notificarme cuando un miembro cancela su suscripción
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Seguridad
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cambiar Contraseña
                        </label>
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar contraseña"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Autenticación de Dos Factores
                          </p>
                          <p className="text-sm text-gray-500">
                            Añade una capa extra de seguridad a tu cuenta
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de guardar */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}





