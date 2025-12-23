"use client";

import { useEffect, useState, FormEvent } from "react";
import { Save, Loader2, MessageCircle, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { DateTimePicker } from "@/components/datetime-picker";
import { getClubConfig, updateClubConfig, type ClubConfig } from "@/services/club-config";

export default function ClubConfigPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<ClubConfig | null>(null);
  
  const [whatsappLink, setWhatsappLink] = useState("");
  const [nextMeetingDateTime, setNextMeetingDateTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClubConfig();
      setConfig(data);
      setWhatsappLink(data.whatsappLink || "");
      setNextMeetingDateTime(data.nextMeetingDateTime || "");
      setMeetingLink(data.meetingLink || "");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cargar la configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedConfig = await updateClubConfig({
        whatsappLink: whatsappLink || undefined,
        nextMeetingDateTime: nextMeetingDateTime || undefined,
        meetingLink: meetingLink || undefined,
      });
      
      setConfig(updatedConfig);
      setSuccess("Configuración guardada exitosamente");
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al guardar la configuración"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${
          isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"
        }`}
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configurar Club
            </h1>
            <p className="text-gray-600">
              Configura el link de WhatsApp y la próxima reunión del club
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mensajes de éxito y error */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-green-800">{success}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {/* Link de WhatsApp */}
                <div>
                  <label
                    htmlFor="whatsappLink"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-primary" />
                      Link de WhatsApp
                    </div>
                  </label>
                  <input
                    type="url"
                    id="whatsappLink"
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Link del grupo de WhatsApp de la comunidad
                  </p>
                </div>

                {/* Fecha y hora de próxima reunión */}
                <div>
                  <DateTimePicker
                    value={nextMeetingDateTime}
                    onChange={setNextMeetingDateTime}
                    label="Fecha y Hora de Próxima Reunión"
                    placeholder="Seleccionar fecha y hora de la reunión"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Fecha y hora de la próxima reunión (horario América/Santiago)
                  </p>
                </div>

                {/* Link de la reunión */}
                <div>
                  <label
                    htmlFor="meetingLink"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-primary" />
                      Link de la Reunión
                    </div>
                  </label>
                  <input
                    type="url"
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/... o https://zoom.us/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Link para unirse a la reunión (Google Meet, Zoom, etc.)
                  </p>
                </div>

                {/* Botón de guardar */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar Configuración
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

