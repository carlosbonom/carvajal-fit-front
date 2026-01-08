"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Send,
  FileSpreadsheet,
  Eye,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Check,
  Zap,
} from "lucide-react";
import * as XLSX from "xlsx";
import NewsletterEditor, { NewsletterEditorRef } from "@/components/newsletter-editor/NewsletterEditor";
import { ConfirmModal } from "@/components/confirm-modal";

import { AdminSidebar } from "@/components/admin-sidebar";
import {
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  sendBulkEmails,
  EmailTemplate,
  EmailRecipient,
} from "@/services/marketing";
import { uploadFile } from "@/services/files";
import { getAccessToken } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { getMembers } from "@/services/subscriptions";

// Datos dummy para demostración
const dummyTemplates: EmailTemplate[] = [
  {
    id: "welcome-template",
    name: "Bienvenida",
    subject: "¡Bienvenido al Club Carvajal Fit! 🎉",
    htmlContent: "", // Se cargará desde Unlayer
    design: undefined, // Aquí iría el JSON de Unlayer
    isLocked: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Promoción Verano 2024",
    subject: "Ofertas especiales de verano para ti",
    htmlContent: "<h2>¡Ofertas de Verano!</h2><p>Hola {{nombre}}, tenemos ofertas increíbles para ti este verano.</p>",
    design: undefined,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function MarketingPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Modal genérico para alertas y confirmaciones
  const [genericModalOpen, setGenericModalOpen] = useState(false);
  const [genericModalConfig, setGenericModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "success" | "info";
    isConfirm: boolean;
    confirmText?: string;
  }>({
    title: "",
    message: "",
    onConfirm: () => { },
    type: "info",
    isConfirm: false,
  });

  const showAlert = (title: string, message: string, type: "danger" | "warning" | "success" | "info" = "info") => {
    setGenericModalConfig({
      title,
      message,
      onConfirm: () => setGenericModalOpen(false),
      type,
      isConfirm: false,
      confirmText: "Aceptar"
    });
    setGenericModalOpen(true);
  };

  const showConfirm = (title: string, message: string, onConfirmAction: () => void, type: "danger" | "warning" | "success" | "info" = "warning") => {
    setGenericModalConfig({
      title,
      message,
      onConfirm: () => {
        onConfirmAction();
        setGenericModalOpen(false);
      },
      type,
      isConfirm: true,
      confirmText: "Confirmar"
    });
    setGenericModalOpen(true);
  };
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [sending, setSending] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const editorRef = useRef<NewsletterEditorRef>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    design: undefined as any,
  });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    // Verificar autenticación antes de cargar
    const token = getAccessToken();
    if (!token) {
      console.error("No hay token de autenticación. Redirigiendo al login...");
      router.push("/login");
      return;
    }

    loadTemplates();
  }, [router]);



  const loadTemplates = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();

      if (!token) {
        console.error("No hay token de autenticación");
        router.push("/login");
        return;
      }

      console.log("Token presente, cargando plantillas...");
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error: any) {
      console.error("Error al cargar plantillas:", error);

      // Si es un error 401, redirigir al login
      if (error.response?.status === 401) {
        showAlert("Sesión expirada", "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", "warning");
        router.push("/login");
        return;
      }

      showAlert("Error", "Error al cargar las plantillas. Por favor, recarga la página.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    const WELCOME_DESIGN = {
      blocks: [
        {
          id: 'header',
          type: 'text',
          content: {
            text: '¡Bienvenido al Club! 🎉',
            backgroundColor: '#0099cc',
            textColor: '#ffffff',
            textAlign: 'center',
            fontSize: 24
          }
        },
        {
          id: 'spacer1',
          type: 'spacer',
          content: { height: 30 }
        },
        {
          id: 'greeting',
          type: 'text',
          content: {
            text: 'Hola <b>{{nombre}}</b>,\n\n¡Estamos emocionados de darte la bienvenida al Club Carvajal Fit!\n\nTu suscripción ha sido activada exitosamente.',
            fontSize: 16,
            textColor: '#334155'
          }
        },
        {
          id: 'features',
          type: 'html',
          content: {
            html: '<div style="background-color: #f9fafb; border-left: 4px solid #0099cc; padding: 20px; border-radius: 4px; font-family: sans-serif;">\n  <h3 style="margin:0 0 10px 0; color:#1e293b; font-weight: bold; font-size: 16px;">¿Qué puedes hacer ahora?</h3>\n  <ul style="margin:0; padding-left:20px; color:#475569; font-size: 14px; line-height: 1.6;">\n    <li style="margin-bottom: 5px;">Acceder a todos los planes exclusivos</li>\n    <li style="margin-bottom: 5px;">Ver videos de ejercicios y rutinas</li>\n    <li style="margin-bottom: 5px;">Descargar guías nutricionales</li>\n  </ul>\n</div>'
          }
        },
        {
          id: 'spacer2',
          type: 'spacer',
          content: { height: 30 }
        },
        {
          id: 'cta',
          type: 'button',
          content: {
            text: 'Entrar al Club',
            url: 'https://carvajalfit.cl/login',
            backgroundColor: '#0099cc',
            color: '#ffffff',
            borderRadius: 8
          }
        },
        {
          id: 'footer',
          type: 'text',
          content: {
            text: '© 2025 Club Carvajal Fit. Todos los derechos reservados.',
            backgroundColor: '#111827',
            textColor: '#9ca3af',
            fontSize: 12,
            textAlign: 'center'
          }
        }
      ],
      globalStyles: {
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif"
      }
    };

    setTemplateForm({
      name: "Bienvenida al Club",
      subject: "¡Bienvenido a la familia Carvajal Fit!",
      htmlContent: "",
      design: WELCOME_DESIGN as any,
    });
    setShowTemplateModal(true);
    // Resetear el editor con el diseño de bienvenida
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.loadDesign(WELCOME_DESIGN as any);
      }
    }, 100);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      design: template.design,
    });
    setShowTemplateModal(true);

    // Cargar contenido en el editor
    setTimeout(() => {
      if (editorRef.current && template.design) {
        editorRef.current.loadDesign(template.design as any);
      }
    }, 500);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject) {
      showAlert("Campos requeridos", "El nombre y el asunto son requeridos", "warning");
      return;
    }

    try {
      setLoading(true);

      const design = editorRef.current?.getDesign();
      const htmlContent = editorRef.current?.getHtml();

      if (!design || !htmlContent) {
        showAlert("Error", "No se pudo obtener el contenido del editor", "danger");
        return;
      }

      if (editingTemplate) {
        // Actualizar template existente
        const updated = await updateEmailTemplate(editingTemplate.id, {
          name: templateForm.name,
          subject: templateForm.subject,
          htmlContent: htmlContent,
          design: design,
        });
        setTemplates(templates.map(t =>
          t.id === editingTemplate.id ? updated : t
        ));
      } else {
        // Crear nuevo template
        const newTemplate = await createEmailTemplate({
          name: templateForm.name,
          subject: templateForm.subject,
          htmlContent: htmlContent,
          design: design,
        });
        setTemplates([...templates, newTemplate]);
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
      showAlert("Éxito", "Plantilla guardada correctamente", "success");
    } catch (error) {
      console.error("Error al guardar plantilla:", error);
      showAlert("Error", "Error al guardar la plantilla", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    showConfirm(
      "Confirmar eliminación",
      "¿Estás seguro de que quieres eliminar esta plantilla?",
      async () => {
        try {
          setLoading(true);
          await deleteEmailTemplate(id);
          setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
          console.error("Error al eliminar plantilla:", error);
          showAlert("Error", "Error al eliminar la plantilla", "danger");
        } finally {
          setLoading(false);
        }
      },
      "danger"
    );
  };





  const handleLoadFromDatabase = async () => {
    try {
      setLoadingRecipients(true);
      const response = await getMembers();

      // Convertir miembros a EmailRecipient
      const dbRecipients: EmailRecipient[] = response.members
        .filter((member) => member.email) // Solo usuarios con email
        .map((member) => ({
          email: member.email,
          name: member.name || undefined,
          id: member.id, // Incluir ID para referencia
        }));

      setRecipients(dbRecipients);
      showAlert("Carga exitosa", `Se cargaron ${dbRecipients.length} destinatarios desde la base de datos`, "success");
    } catch (error) {
      console.error("Error al cargar desde la base de datos:", error);
      showAlert("Error", "Error al cargar los destinatarios desde la base de datos", "danger");
    } finally {
      setLoadingRecipients(false);
    }
  };

  const handleAddManualRecipient = () => {
    if (!manualEmail || !manualEmail.includes("@")) {
      showAlert("Email inválido", "Por favor ingresa un email válido", "warning");
      return;
    }

    const newRecipient: EmailRecipient = {
      email: manualEmail.trim(),
      name: manualName.trim() || undefined,
    };

    // Verificar que no esté duplicado
    if (recipients.some((r) => r.email.toLowerCase() === newRecipient.email.toLowerCase())) {
      showAlert("Email duplicado", "Este email ya está en la lista", "warning");
      return;
    }

    setRecipients([...recipients, newRecipient]);
    setManualEmail("");
    setManualName("");
    setShowManualAdd(false);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingRecipients(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      // Convertir a formato EmailRecipient
      const parsedRecipients: EmailRecipient[] = jsonData.map((row) => {
        // Buscar columnas comunes (case insensitive)
        const emailKey = Object.keys(row).find(
          (key) => key.toLowerCase().includes("email") || key.toLowerCase().includes("correo")
        );
        const nameKey = Object.keys(row).find(
          (key) => key.toLowerCase().includes("name") || key.toLowerCase().includes("nombre")
        );

        return {
          email: emailKey ? String(row[emailKey]).trim() : "",
          name: nameKey ? String(row[nameKey]).trim() : undefined,
          ...row, // Incluir todos los demás campos
        };
      }).filter((r) => r.email && r.email.includes("@")); // Filtrar filas sin email válido

      setRecipients(parsedRecipients);
      showAlert("Carga exitosa", `Se cargaron ${parsedRecipients.length} destinatarios desde el archivo Excel`, "success");
    } catch (error) {
      console.error("Error al leer Excel:", error);
      showAlert("Error", "Error al leer el archivo Excel. Por favor, verifica el formato del archivo.", "danger");
    } finally {
      setLoadingRecipients(false);
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };

  const handleSendEmails = async (templateId: string) => {
    if (recipients.length === 0) {
      showAlert("Sin destinatarios", "Debes cargar al menos un destinatario", "warning");
      return;
    }

    // Validar que todos los emails sean válidos
    const invalidEmails = recipients.filter((r) => !r.email || !r.email.includes("@"));
    if (invalidEmails.length > 0) {
      showAlert("Emails inválidos", `Hay ${invalidEmails.length} email(s) inválido(s). Por favor, corrígelos antes de enviar.`, "warning");
      return;
    }

    // Mostrar modal de confirmación
    setPendingTemplateId(templateId);
    setShowConfirmModal(true);
  };

  const confirmSendEmails = async () => {
    if (!pendingTemplateId) return;

    try {
      setSending(true);
      setShowConfirmModal(false);

      const result = await sendBulkEmails({
        templateId: pendingTemplateId,
        recipients,
      });

      // Mostrar resultado en modal
      setSendResult({
        success: result.success,
        failed: result.failed,
        errors: result.errors || [],
      });
      setShowResultModal(true);

      // Cerrar modal de envío y limpiar
      setShowSendModal(false);
      setRecipients([]);
      setPendingTemplateId(null);
    } catch (error: any) {
      console.error("Error al enviar correos:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error al enviar los correos";

      // Mostrar error en modal también
      setSendResult({
        success: 0,
        failed: recipients.length,
        errors: [errorMessage],
      });
      setShowResultModal(true);

      setShowSendModal(false);
      setPendingTemplateId(null);
    } finally {
      setSending(false);
    }
  };



  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"
          }`}
      >
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {/* Header Moderno */}
          <div className="mb-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    Newsletter
                  </h1>
                </div>
                <p className="text-lg text-gray-600 ml-14">
                  Crea plantillas profesionales y envíalas a tus miembros
                </p>
              </div>
              <button
                onClick={handleNewTemplate}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 font-medium"
              >
                <Plus className="w-5 h-5" />
                Nueva Plantilla
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plantillas</p>
                    <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Listos para enviar</p>
                    <p className="text-3xl font-bold text-gray-900">{templates.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Última actualización</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {templates.length > 0
                        ? new Date(templates[0].updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">Cargando plantillas...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay plantillas creadas
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Comienza creando tu primera plantilla de email para comunicarte con tus miembros
              </p>
              <button
                onClick={handleNewTemplate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 font-medium"
              >
                <Plus className="w-5 h-5" />
                Crear primera plantilla
              </button>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Asunto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actualizada
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {templates.map((template) => (
                      <tr
                        key={template.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                  {template.name}
                                </span>
                                {template.isLocked && (
                                  <span className="p-1 bg-yellow-100 text-yellow-600 rounded-lg" title="Plantilla protegida">
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 max-w-md truncate">
                            {template.subject}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(template.updatedAt).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            Activa
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePreviewTemplate(template)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Vista previa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRecipients([]);
                                setShowManualAdd(false);
                                setManualEmail("");
                                setManualName("");
                                setShowSendModal(true);
                                setEditingTemplate(template);
                              }}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Enviar"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (template.isLocked) {
                                  showAlert("Acción bloqueada", "Las plantillas protegidas no pueden ser eliminadas.", "warning");
                                  return;
                                }
                                handleDeleteTemplate(template.id);
                              }}
                              className={`p-2 rounded-xl transition-all ${template.isLocked ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
                              title={template.isLocked ? "Protegida" : "Eliminar"}
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Plantilla */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[98vh] overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">
                      {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      {editingTemplate ? "Modifica tu plantilla de email" : "Crea una nueva plantilla para tus campañas"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50">
                <div className="px-6 py-4 border-b border-gray-100 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                        Nombre de la plantilla
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all text-sm"
                        placeholder="Ej: Promoción de Verano"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                        Asunto del correo
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, subject: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all text-sm"
                        placeholder="Ej: ¡Oferta especial para ti!"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0">
                  <NewsletterEditor
                    ref={editorRef}
                    initialDesign={editingTemplate?.design as any}
                  />
                </div>
              </div>

              <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end shrink-0">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 font-medium"
                >
                  <Save className="w-4 h-4" />
                  Guardar Plantilla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Envío */}
        {showSendModal && editingTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Enviar Correos
                    </h2>
                    <p className="text-sm text-gray-600">
                      Plantilla: <span className="font-medium">{editingTemplate.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowSendModal(false);
                      setRecipients([]);
                      setShowManualAdd(false);
                      setManualEmail("");
                      setManualName("");
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
                <div className="space-y-6">
                  {/* Opciones de carga */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">
                      Cargar destinatarios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Cargar desde Base de Datos */}
                      <button
                        onClick={handleLoadFromDatabase}
                        disabled={loadingRecipients}
                        className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Desde Base de Datos</p>
                          <p className="text-xs text-gray-500 mt-1">Cargar todos los usuarios</p>
                        </div>
                        {loadingRecipients && (
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                      </button>

                      {/* Cargar desde Excel */}
                      <button
                        onClick={() => excelInputRef.current?.click()}
                        disabled={loadingRecipients}
                        className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="p-3 bg-green-100 rounded-xl">
                          <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Desde Excel</p>
                          <p className="text-xs text-gray-500 mt-1">Subir archivo .xlsx o .xls</p>
                        </div>
                      </button>
                      <input
                        ref={excelInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                      />

                      {/* Agregar Manualmente */}
                      <button
                        onClick={() => setShowManualAdd(true)}
                        disabled={loadingRecipients}
                        className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <Plus className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">Agregar Manual</p>
                          <p className="text-xs text-gray-500 mt-1">Ingresar uno por uno</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Formulario para agregar manualmente */}
                  {showManualAdd && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Agregar destinatario manualmente
                        </h3>
                        <button
                          onClick={() => {
                            setShowManualAdd(false);
                            setManualEmail("");
                            setManualName("");
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={manualEmail}
                            onChange={(e) => setManualEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddManualRecipient();
                              }
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Nombre (opcional)
                          </label>
                          <input
                            type="text"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            placeholder="Nombre completo"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddManualRecipient();
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAddManualRecipient}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          Agregar
                        </button>
                        <button
                          onClick={() => {
                            setShowManualAdd(false);
                            setManualEmail("");
                            setManualName("");
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {recipients.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-600" />
                            <h3 className="text-sm font-semibold text-gray-900">
                              Destinatarios
                            </h3>
                          </div>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                            {recipients.length} {recipients.length === 1 ? "destinatario" : "destinatarios"}
                          </span>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {recipients.slice(0, 10).map((recipient, index) => (
                              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 text-gray-900">{recipient.email}</td>
                                <td className="px-4 py-3 text-gray-600">{recipient.name || "-"}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => handleRemoveRecipient(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {recipients.length > 10 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-3 text-center text-gray-500 text-sm bg-gray-50/50">
                                  ... y {recipients.length - 10} más
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {recipients.length === 0 && !loadingRecipients && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-600">Carga destinatarios desde la base de datos, Excel o agrégalos manualmente</p>
                    </div>
                  )}

                  {loadingRecipients && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-600">Cargando destinatarios...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSendModal(false);
                    setRecipients([]);
                    setShowManualAdd(false);
                    setManualEmail("");
                    setManualName("");
                  }}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSendEmails(editingTemplate.id)}
                  disabled={recipients.length === 0 || sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Enviando..." : `Enviar a ${recipients.length} ${recipients.length === 1 ? "destinatario" : "destinatarios"}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Resultado de Envío */}
        {showResultModal && sendResult && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${sendResult.failed === 0
                      ? "bg-green-100"
                      : sendResult.success === 0
                        ? "bg-red-100"
                        : "bg-amber-100"
                      }`}>
                      {sendResult.failed === 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : sendResult.success === 0 ? (
                        <X className="w-5 h-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Resultado del envío
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      setSendResult(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`rounded-xl p-4 border-2 ${sendResult.success > 0
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className={`w-4 h-4 ${sendResult.success > 0 ? "text-green-600" : "text-gray-400"
                        }`} />
                      <span className="text-xs font-medium text-gray-600">Exitosos</span>
                    </div>
                    <p className={`text-2xl font-bold ${sendResult.success > 0 ? "text-green-600" : "text-gray-400"
                      }`}>
                      {sendResult.success}
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 border-2 ${sendResult.failed > 0
                    ? "bg-red-50 border-red-200"
                    : "bg-gray-50 border-gray-200"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <X className={`w-4 h-4 ${sendResult.failed > 0 ? "text-red-600" : "text-gray-400"
                        }`} />
                      <span className="text-xs font-medium text-gray-600">Fallidos</span>
                    </div>
                    <p className={`text-2xl font-bold ${sendResult.failed > 0 ? "text-red-600" : "text-gray-400"
                      }`}>
                      {sendResult.failed}
                    </p>
                  </div>
                </div>

                {/* Mensaje resumen */}
                <div className={`rounded-xl p-4 ${sendResult.failed === 0
                  ? "bg-green-50 border border-green-200"
                  : sendResult.success === 0
                    ? "bg-red-50 border border-red-200"
                    : "bg-amber-50 border border-amber-200"
                  }`}>
                  <p className={`text-sm font-medium ${sendResult.failed === 0
                    ? "text-green-900"
                    : sendResult.success === 0
                      ? "text-red-900"
                      : "text-amber-900"
                    }`}>
                    {sendResult.failed === 0
                      ? `¡Todos los correos se enviaron exitosamente! (${sendResult.success} ${sendResult.success === 1 ? "correo" : "correos"})`
                      : sendResult.success === 0
                        ? `No se pudo enviar ningún correo. Todos fallaron (${sendResult.failed} ${sendResult.failed === 1 ? "correo" : "correos"})`
                        : `Se enviaron ${sendResult.success} correos exitosamente, pero ${sendResult.failed} ${sendResult.failed === 1 ? "correo falló" : "correos fallaron"}`
                    }
                  </p>
                </div>

                {/* Lista de errores si hay */}
                {sendResult.errors && sendResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-60 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <h3 className="text-sm font-semibold text-red-900">
                        Errores ({sendResult.errors.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {sendResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-xs text-red-800 bg-red-100 rounded-lg p-2">
                          {error}
                        </div>
                      ))}
                      {sendResult.errors.length > 10 && (
                        <div className="text-xs text-red-600 text-center pt-2">
                          ... y {sendResult.errors.length - 10} error(es) más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setSendResult(null);
                  }}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Envío */}
        {showConfirmModal && editingTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Send className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Confirmar envío
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingTemplateId(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                      <Send className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        ¿Estás seguro de que quieres enviar {recipients.length} {recipients.length === 1 ? "correo" : "correos"}?
                      </p>
                      <p className="text-xs text-blue-700">
                        Plantilla: <span className="font-semibold">{editingTemplate.name}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Destinatarios:</span>
                    <span className="font-semibold text-gray-900">{recipients.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Asunto:</span>
                    <span className="font-semibold text-gray-900 truncate ml-2 max-w-[200px]" title={editingTemplate.subject}>
                      {editingTemplate.subject}
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-800">
                    <strong>Nota:</strong> Esta acción no se puede deshacer. Los correos se enviarán inmediatamente.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingTemplateId(null);
                  }}
                  disabled={sending}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSendEmails}
                  disabled={sending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirmar y enviar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Vista Previa */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Vista Previa
                    </h2>
                    <p className="text-sm text-gray-600">
                      {previewTemplate.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
                <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asunto:</span>
                  </div>
                  <p className="text-base text-gray-900 font-medium">
                    {previewTemplate.subject}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div
                    className="p-8 min-h-[300px]"
                    dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={genericModalOpen}
        onClose={() => setGenericModalOpen(false)}
        onConfirm={genericModalConfig.onConfirm}
        title={genericModalConfig.title}
        message={genericModalConfig.message}
        type={genericModalConfig.type}
        isConfirm={genericModalConfig.isConfirm}
        confirmText={genericModalConfig.confirmText}
      />
    </>
  );
}


