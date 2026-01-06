"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Send,
  Image as ImageIcon,
  FileSpreadsheet,
  Eye,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Maximize2,
  Minimize2,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
} from "lucide-react";
import * as XLSX from "xlsx";
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
    id: "1",
    name: "Bienvenida Nuevos Miembros",
    subject: "¡Bienvenido al Club Carvajal Fit!",
    htmlContent: "<h1>¡Hola {{nombre}}!</h1><p>Gracias por unirte a nuestro club. Estamos emocionados de tenerte aquí.</p>",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Promoción Verano 2024",
    subject: "Ofertas especiales de verano para ti",
    htmlContent: "<h2>¡Ofertas de Verano!</h2><p>Hola {{nombre}}, tenemos ofertas increíbles para ti este verano.</p>",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Recordatorio de Pago",
    subject: "Recordatorio: Renovación de membresía",
    htmlContent: "<p>Hola {{nombre}}, tu membresía está próxima a vencer. Renueva ahora y mantén tus beneficios.</p>",
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(600);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resizingImage, setResizingImage] = useState<HTMLImageElement | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [resizeStartWidth, setResizeStartWidth] = useState<number>(0);
  const [draggingImage, setDraggingImage] = useState<HTMLDivElement | null>(null);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [buttonConfig, setButtonConfig] = useState({
    text: "",
    url: "",
    color: "#00b2de",
    textColor: "#ffffff",
  });
  const [resizingButton, setResizingButton] = useState<HTMLDivElement | null>(null);
  const [draggingButton, setDraggingButton] = useState<HTMLDivElement | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartLeft, setDragStartLeft] = useState<number>(0);
  const [dragStartTop, setDragStartTop] = useState<number>(0);
  const [dragPlaceholder, setDragPlaceholder] = useState<HTMLDivElement | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<'bg' | 'text' | null>(null);
  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false);
  const [textColorValue, setTextColorValue] = useState('#000000');

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    htmlContent: "",
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

  // Efecto para manejar el redimensionamiento de imágenes en el editor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingImage || !editorRef.current) return;

      // Obtener el ancho máximo disponible del editor
      const editorWidth = editorRef.current.offsetWidth - 48; // Restar padding (24px cada lado)
      const maxWidth = Math.min(editorWidth, 2000);

      const deltaX = e.clientX - resizeStartX;
      const newWidth = Math.max(100, Math.min(maxWidth, resizeStartWidth + deltaX));

      if (resizingImage) {
        resizingImage.style.width = `${newWidth}px`;
        resizingImage.style.maxWidth = `${newWidth}px`;
        resizingImage.setAttribute('data-width', newWidth.toString());

        // Actualizar el wrapper para que coincida con el tamaño de la imagen
        const wrapper = resizingImage.parentElement;
        if (wrapper && wrapper.classList.contains('image-wrapper')) {
          const imgHeight = resizingImage.offsetHeight || resizingImage.clientHeight;
          if (imgHeight > 0) {
            wrapper.style.width = `${newWidth}px`;
            wrapper.style.height = `${imgHeight}px`;
          }

          // Reposicionar el handle en la esquina inferior derecha
          const resizeHandle = wrapper.querySelector('.resize-handle') as HTMLElement;
          if (resizeHandle) {
            resizeHandle.style.bottom = '4px';
            resizeHandle.style.right = '4px';
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (resizingImage && editorRef.current) {
        // Asegurar que el wrapper y el handle estén correctamente posicionados
        const wrapper = resizingImage.parentElement;
        if (wrapper && wrapper.classList.contains('image-wrapper')) {
          const imgHeight = resizingImage.offsetHeight || resizingImage.clientHeight;
          const imgWidth = resizingImage.offsetWidth || resizingImage.clientWidth;
          if (imgHeight > 0 && imgWidth > 0) {
            wrapper.style.width = `${imgWidth}px`;
            wrapper.style.height = `${imgHeight}px`;
          }

          // Reposicionar el handle
          const resizeHandle = wrapper.querySelector('.resize-handle') as HTMLElement;
          if (resizeHandle) {
            resizeHandle.style.bottom = '4px';
            resizeHandle.style.right = '4px';
          }
        }

        // Actualizar el contenido del editor
        const currentContent = editorRef.current.innerHTML;
        setTemplateForm(prev => ({
          ...prev,
          htmlContent: currentContent,
        }));
      }
      setResizingImage(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (resizingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingImage, resizeStartX, resizeStartWidth]);

  // Efecto para manejar el arrastre y redimensionamiento de botones e imágenes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingButton) {
        const deltaX = e.clientX - resizeStartX;
        const newWidth = Math.max(100, Math.min(500, resizeStartWidth + deltaX * 1.5));

        const link = resizingButton.querySelector('a') as HTMLAnchorElement;
        if (link) {
          link.style.width = `${newWidth}px`;
          link.style.minWidth = `${newWidth}px`;
          link.style.maxWidth = `${newWidth}px`;
        }
      } else if ((draggingButton || draggingImage) && editorRef.current) {
        // Mover el elemento flotante siguiendo el mouse
        const draggedElement = draggingButton || draggingImage;
        if (draggedElement) {
          const deltaX = e.clientX - dragStartX;
          const deltaY = e.clientY - dragStartY;

          draggedElement.style.left = `${dragStartLeft + deltaX}px`;
          draggedElement.style.top = `${dragStartTop + deltaY}px`;
        }

        // Obtener la posición del cursor en el editor
        let range: Range | null = null;
        try {
          if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY);
          } else if ((document as any).caretPositionFromPoint) {
            const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
            if (pos) {
              range = document.createRange();
              range.setStart(pos.offsetNode, pos.offset);
              range.collapse(true);
            }
          }
        } catch (error) {
          // Fallback: usar getSelection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
          }
        }

        if (range && editorRef.current.contains(range.commonAncestorContainer) && dragPlaceholder && (draggingButton || draggingImage)) {
          // Encontrar el nodo donde insertar
          let insertNode = range.commonAncestorContainer;

          // Si es un nodo de texto, usar el padre
          if (insertNode.nodeType === Node.TEXT_NODE) {
            insertNode = insertNode.parentNode as Node;
          }

          // Buscar un nodo válido para insertar (no el elemento arrastrado ni su contenido)
          const draggedElement = draggingButton || draggingImage;
          while (insertNode && insertNode !== editorRef.current) {
            if (insertNode.nodeType === Node.ELEMENT_NODE) {
              const element = insertNode as HTMLElement;
              // Si es el placeholder, no hacer nada
              if (element.classList.contains('drag-placeholder')) {
                return;
              }
              // Si es un nodo válido y no es el elemento arrastrado, insertar ahí
              if (element !== draggedElement && !draggedElement?.contains(element)) {
                // Determinar si insertar antes o después basado en la posición Y
                const elementRect = element.getBoundingClientRect();
                const shouldInsertBefore = e.clientY < elementRect.top + elementRect.height / 2;

                try {
                  // Remover placeholder de su posición actual
                  if (dragPlaceholder.parentNode) {
                    dragPlaceholder.parentNode.removeChild(dragPlaceholder);
                  }

                  // Insertar en la nueva posición
                  if (shouldInsertBefore && element.parentNode) {
                    element.parentNode.insertBefore(dragPlaceholder, element);
                  } else if (element.parentNode) {
                    if (element.nextSibling) {
                      element.parentNode.insertBefore(dragPlaceholder, element.nextSibling);
                    } else {
                      element.parentNode.appendChild(dragPlaceholder);
                    }
                  }
                } catch (error) {
                  console.log('Error moviendo placeholder:', error);
                }
                return;
              }
            }
            insertNode = insertNode.parentNode as Node;
          }

          // Si llegamos al editor, insertar al final
          if (insertNode === editorRef.current && dragPlaceholder.parentNode !== editorRef.current) {
            try {
              if (dragPlaceholder.parentNode) {
                dragPlaceholder.parentNode.removeChild(dragPlaceholder);
              }
              editorRef.current.appendChild(dragPlaceholder);
            } catch (error) {
              console.log('Error insertando placeholder:', error);
            }
          }
        }
      }
    };

    const handleMouseUp = () => {
      if (resizingButton || draggingButton || draggingImage) {
        if (editorRef.current) {
          const currentContent = editorRef.current.innerHTML;
          setTemplateForm(prev => ({
            ...prev,
            htmlContent: currentContent,
          }));
        }

        // Limpiar estilos visuales y mover el elemento a la posición final
        if (draggingButton) {
          draggingButton.style.opacity = '1';
          draggingButton.style.position = '';
          draggingButton.style.left = '';
          draggingButton.style.top = '';
          draggingButton.style.margin = '';
          draggingButton.style.zIndex = '';

          const link = draggingButton.querySelector('a') as HTMLAnchorElement;
          if (link) {
            link.style.outline = 'none';
            link.style.pointerEvents = 'auto';
          }

          // Si hay un placeholder, mover el botón ahí y eliminar el placeholder
          if (dragPlaceholder && dragPlaceholder.parentNode) {
            const placeholderParent = dragPlaceholder.parentNode;
            placeholderParent.insertBefore(draggingButton, dragPlaceholder);
            placeholderParent.removeChild(dragPlaceholder);
            setDragPlaceholder(null);
          }
        }

        if (draggingImage) {
          draggingImage.style.opacity = '1';
          draggingImage.style.position = '';
          draggingImage.style.left = '';
          draggingImage.style.top = '';
          draggingImage.style.margin = '';
          draggingImage.style.zIndex = '';

          const img = draggingImage.querySelector('img') as HTMLImageElement;
          if (img) {
            img.style.outline = 'none';
          }

          // Si hay un placeholder, mover la imagen ahí y eliminar el placeholder
          if (dragPlaceholder && dragPlaceholder.parentNode) {
            const placeholderParent = dragPlaceholder.parentNode;
            placeholderParent.insertBefore(draggingImage, dragPlaceholder);
            placeholderParent.removeChild(dragPlaceholder);
            setDragPlaceholder(null);
          }
        }
        if (resizingButton) {
          const link = resizingButton.querySelector('a') as HTMLAnchorElement;
          if (link) {
            link.style.outline = 'none';
          }
          // Limpiar la marca de redimensionamiento
          (resizingButton as any).__isResizing = false;
        }
      }

      setResizingButton(null);
      setDraggingButton(null);
      setDraggingImage(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (resizingButton || draggingButton || draggingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      if (resizingButton) {
        document.body.style.cursor = 'ew-resize';
      } else if (draggingButton || draggingImage) {
        document.body.style.cursor = 'move';
      }
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingButton, draggingButton, draggingImage, resizeStartX, resizeStartWidth, dragStartX, dragStartY, dragStartLeft, dragStartTop, dragPlaceholder]);

  // Efecto para hacer las imágenes redimensionables cuando se cargan en el editor
  useEffect(() => {
    if (!editorRef.current || !showTemplateModal) return;

    const makeImagesResizable = () => {
      const images = editorRef.current?.querySelectorAll('img:not(.resize-handle img)') as NodeListOf<HTMLImageElement>;
      images?.forEach((img) => {
        // Evitar agregar múltiples handles
        if (img.parentElement?.classList.contains('image-wrapper')) return;

        // Crear wrapper para la imagen
        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper relative inline-block my-2 group';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.maxWidth = '100%';
        wrapper.style.overflow = 'visible'; // Asegurar que el handle sea visible

        // Ajustar el wrapper para que coincida con el tamaño de la imagen
        const adjustWrapperSize = () => {
          if (img.offsetWidth > 0 && img.offsetHeight > 0) {
            wrapper.style.width = `${img.offsetWidth}px`;
            wrapper.style.height = `${img.offsetHeight}px`;
          }
        };

        if (img.complete) {
          setTimeout(adjustWrapperSize, 0);
        } else {
          img.onload = adjustWrapperSize;
        }

        // Insertar wrapper antes de la imagen
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Estilos de la imagen - siempre ajustarse al ancho del editor
        const editorWidth = editorRef.current?.offsetWidth || 600;
        const maxEditorWidth = editorWidth - 48; // Restar padding

        img.style.display = 'block';
        img.style.position = 'relative';
        img.style.height = 'auto';
        img.style.cursor = 'default';
        img.style.userSelect = 'none';

        // Ajustar el ancho de la imagen al editor si es necesario
        const currentWidthValue = parseInt(img.style.width) || img.offsetWidth || 600;
        const finalWidth = Math.min(currentWidthValue, maxEditorWidth);
        img.style.width = `${finalWidth}px`;
        img.style.maxWidth = `${finalWidth}px`;
        img.setAttribute('data-width', finalWidth.toString());

        // Crear handle de redimensionamiento - posicionado relativo al wrapper
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeHandle.setAttribute('contentEditable', 'false');
        resizeHandle.setAttribute('draggable', 'false');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '20px';
        resizeHandle.style.height = '20px';
        resizeHandle.style.backgroundColor = '#00b2de';
        resizeHandle.style.border = '2px solid white';
        resizeHandle.style.borderRadius = '50%';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.opacity = '0';
        resizeHandle.style.transition = 'opacity 0.2s';
        resizeHandle.style.zIndex = '1000';
        resizeHandle.style.pointerEvents = 'auto';
        resizeHandle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        resizeHandle.style.userSelect = 'none';
        resizeHandle.style.webkitUserSelect = 'none';
        resizeHandle.title = 'Arrastra para redimensionar';

        // Prevenir eventos de texto y teclado en el handle
        resizeHandle.addEventListener('keydown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('keypress', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('keyup', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('input', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('paste', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        // Función para actualizar la posición del handle
        const updateHandlePosition = () => {
          adjustWrapperSize();
          resizeHandle.style.bottom = '4px';
          resizeHandle.style.right = '4px';
        };

        // Actualizar tamaño del wrapper cuando la imagen carga
        if (img.complete) {
          setTimeout(adjustWrapperSize, 0);
        } else {
          const originalOnload = img.onload;
          img.onload = function (e) {
            if (originalOnload) originalOnload.call(this, e);
            adjustWrapperSize();
          };
        }

        // Mostrar handle al hacer hover
        const handleMouseEnter = () => {
          adjustWrapperSize();
          resizeHandle.style.opacity = '1';
          img.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
        };

        const handleMouseLeave = () => {
          if (resizingImage !== img) {
            resizeHandle.style.opacity = '0';
            img.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseenter', handleMouseEnter);
        wrapper.addEventListener('mouseleave', handleMouseLeave);

        // Toolbar de alineación para imágenes
        const alignToolbar = document.createElement("div");
        alignToolbar.className = "image-align-toolbar";
        alignToolbar.style.position = "absolute";
        alignToolbar.style.top = "-40px";
        alignToolbar.style.left = "50%";
        alignToolbar.style.transform = "translateX(-50%)";
        alignToolbar.style.display = "flex";
        alignToolbar.style.gap = "4px";
        alignToolbar.style.backgroundColor = "white";
        alignToolbar.style.padding = "4px";
        alignToolbar.style.borderRadius = "6px";
        alignToolbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        alignToolbar.style.opacity = "0";
        alignToolbar.style.transition = "opacity 0.2s";
        alignToolbar.style.zIndex = "1001";
        alignToolbar.style.pointerEvents = "auto";

        const alignButtons = [
          { align: "left", icon: "left", title: "Izquierda" },
          { align: "center", icon: "center", title: "Centro" },
          { align: "right", icon: "right", title: "Derecha" },
          { align: "full", icon: "full", title: "Ancho completo" },
        ];

        alignButtons.forEach(({ align, icon, title }) => {
          const btn = document.createElement("button");
          btn.style.cssText = `
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
          `;
          btn.title = title;

          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("width", "16");
          svg.setAttribute("height", "16");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          if (icon === "left") {
            path.setAttribute("d", "M21 10H7m14-4H3m18 8H7m14 4H3");
          } else if (icon === "center") {
            path.setAttribute("d", "M18 10H6m16-4H2m20 8H4m18 4H2");
          } else if (icon === "right") {
            path.setAttribute("d", "M3 10h14m4-4H3m18 8H7m14 4H3");
          } else if (icon === "full") {
            path.setAttribute("d", "M3 3h18m-18 4h18m-18 4h18m-18 4h18m-18 4h18");
          }
          svg.appendChild(path);
          btn.appendChild(svg);

          btn.onmouseenter = () => {
            btn.style.backgroundColor = "#f3f4f6";
            btn.style.color = "#00b2de";
          };
          btn.onmouseleave = () => {
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#6b7280";
          };

          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Guardar el tamaño actual ANTES de hacer cualquier cambio
            const savedWidth = img.style.width || img.getAttribute('data-width') || '';
            const widthValue = savedWidth ? (savedWidth.includes('px') ? savedWidth : `${savedWidth}px`) : '';

            if (align === "full") {
              // Full width: cambiar a 100%
              wrapper.style.width = "100%";
              wrapper.style.display = "block";
              wrapper.style.textAlign = "";
              img.style.width = "100%";
              img.style.maxWidth = "100%";
              img.style.display = "block";
            } else {
              // Para left, center, right: mantener wrapper en 100% para que textAlign funcione
              wrapper.style.width = "100%";
              wrapper.style.display = "block";
              wrapper.style.textAlign = align;
              img.style.display = "inline-block";

              // Restaurar el tamaño original si existe (NO cambiar a 100%)
              if (widthValue && widthValue !== '100%') {
                img.style.width = widthValue;
                img.style.maxWidth = widthValue;
                if (savedWidth && !savedWidth.includes('px')) {
                  img.setAttribute('data-width', savedWidth);
                }
              } else if (!widthValue) {
                // Si no hay tamaño guardado, mantener el tamaño actual
                const currentWidth = img.offsetWidth;
                if (currentWidth > 0) {
                  img.style.width = `${currentWidth}px`;
                  img.style.maxWidth = `${currentWidth}px`;
                  img.setAttribute('data-width', currentWidth.toString());
                }
              }
            }

            // Actualizar handle después de un pequeño delay
            setTimeout(() => {
              const resizeHandle = wrapper.querySelector('.resize-handle') as HTMLElement;
              if (resizeHandle) {
                if (align === "full") {
                  // Para full, el handle se posiciona relativo al wrapper completo
                  resizeHandle.style.bottom = '4px';
                  resizeHandle.style.right = '4px';
                } else {
                  // Para otras alineaciones, calcular posición basada en la imagen
                  const imgRect = img.getBoundingClientRect();
                  const wrapperRect = wrapper.getBoundingClientRect();
                  if (imgRect.width > 0 && imgRect.height > 0) {
                    const imgRight = imgRect.right - wrapperRect.left;
                    const imgBottom = imgRect.bottom - wrapperRect.top;
                    resizeHandle.style.bottom = `${wrapperRect.height - imgBottom + 4}px`;
                    resizeHandle.style.right = `${wrapperRect.width - imgRight + 4}px`;
                  } else {
                    resizeHandle.style.bottom = '4px';
                    resizeHandle.style.right = '4px';
                  }
                }
              }
            }, 10);

            if (editorRef.current) {
              setTemplateForm(prev => ({
                ...prev,
                htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
              }));
            }
          };

          alignToolbar.appendChild(btn);
        });

        // Mostrar/ocultar toolbar
        const showToolbar = () => {
          if (resizingImage !== img) {
            alignToolbar.style.opacity = '1';
            resizeHandle.style.opacity = '1';
            img.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
          }
        };

        const hideToolbar = (e?: MouseEvent) => {
          const relatedTarget = e?.relatedTarget as HTMLElement;
          if (resizingImage !== img &&
            !relatedTarget?.closest('.image-align-toolbar') &&
            !relatedTarget?.classList.contains('resize-handle')) {
            alignToolbar.style.opacity = '0';
            resizeHandle.style.opacity = '0';
            img.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseenter', showToolbar);
        wrapper.addEventListener('mouseleave', hideToolbar);
        alignToolbar.addEventListener('mouseenter', showToolbar);
        alignToolbar.addEventListener('mouseleave', hideToolbar);

        // Mantener visible el handle cuando se hace hover sobre él
        resizeHandle.addEventListener('mouseenter', () => {
          resizeHandle.style.opacity = '1';
          img.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
        });

        // Manejar inicio de redimensionamiento
        const handleMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setResizingImage(img);
          setResizeStartX(e.clientX);
          const width = parseInt(img.style.width) || img.offsetWidth;
          setResizeStartWidth(width);
          resizeHandle.style.opacity = '1';
          img.style.outline = '2px solid #00b2de';
        };

        resizeHandle.addEventListener('mousedown', handleMouseDown);

        // Manejar inicio de arrastre de la imagen
        let dragStartPos = { x: 0, y: 0 };
        let isDragging = false;
        let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
        let mouseUpHandler: (() => void) | null = null;

        const handleDragMouseDown = (e: MouseEvent) => {
          const target = e.target as HTMLElement;

          // No arrastrar si se hace click en el handle de redimensionamiento, toolbar o si ya se está redimensionando
          if (target.classList.contains('resize-handle') ||
            target.closest('.resize-handle') ||
            target.closest('.image-align-toolbar') ||
            resizingImage === img) {
            return;
          }

          // Guardar posición inicial
          dragStartPos = { x: e.clientX, y: e.clientY };
          isDragging = false;

          const rect = wrapper.getBoundingClientRect();
          const editorRect = editorRef.current?.getBoundingClientRect();

          if (editorRect && editorRef.current) {
            // Asegurar que el editor tenga position relative
            if (getComputedStyle(editorRef.current).position === 'static') {
              editorRef.current.style.position = 'relative';
            }

            // Detectar movimiento para iniciar arrastre
            mouseMoveHandler = (moveEvent: MouseEvent) => {
              const deltaX = Math.abs(moveEvent.clientX - dragStartPos.x);
              const deltaY = Math.abs(moveEvent.clientY - dragStartPos.y);

              // Si el mouse se movió más de 5px, iniciar arrastre
              if ((deltaX > 5 || deltaY > 5) && !isDragging) {
                isDragging = true;

                // Crear placeholder en la posición actual
                const placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.height = `${wrapper.offsetHeight}px`;
                placeholder.style.minHeight = '40px';
                placeholder.style.border = '2px dashed #00b2de';
                placeholder.style.borderRadius = '4px';
                placeholder.style.margin = '10px 0';
                placeholder.style.opacity = '0.5';

                // Insertar placeholder donde está la imagen
                if (wrapper.parentNode) {
                  wrapper.parentNode.insertBefore(placeholder, wrapper);
                  setDragPlaceholder(placeholder);
                }

                // Hacer la imagen flotante para arrastrar
                const currentRect = wrapper.getBoundingClientRect();
                wrapper.style.position = 'fixed';
                wrapper.style.left = `${currentRect.left}px`;
                wrapper.style.top = `${currentRect.top}px`;
                wrapper.style.margin = '0';
                wrapper.style.zIndex = '10000';
                wrapper.style.pointerEvents = 'none';

                setDraggingImage(wrapper);
                setDragStartX(moveEvent.clientX);
                setDragStartY(moveEvent.clientY);
                setDragStartLeft(currentRect.left);
                setDragStartTop(currentRect.top);

                wrapper.style.opacity = '0.8';
                img.style.outline = '2px solid #00b2de';
              }
            };

            mouseUpHandler = () => {
              if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
              }
              if (mouseUpHandler) {
                document.removeEventListener('mouseup', mouseUpHandler);
              }
              mouseMoveHandler = null;
              mouseUpHandler = null;
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
          }
        };

        // Agregar listeners con menor prioridad (sin capture) para que el resize tenga prioridad
        wrapper.addEventListener('mousedown', handleDragMouseDown, false);
        img.addEventListener('mousedown', handleDragMouseDown, false);

        // Limpiar estilos al soltar
        const handleDragEnd = () => {
          if (draggingImage === wrapper) {
            wrapper.style.opacity = '1';
            img.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseup', handleDragEnd);

        wrapper.appendChild(img);
        wrapper.appendChild(resizeHandle); // El handle está en el wrapper pero se posiciona relativo a la imagen
        wrapper.appendChild(alignToolbar);
      });
    };

    // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(makeImagesResizable, 200);

    // Observar cambios en el editor para hacer nuevas imágenes redimensionables
    const observer = new MutationObserver(() => {
      makeImagesResizable();
    });

    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [showTemplateModal]);

  // Efecto para hacer los botones movibles y redimensionables cuando se cargan en el editor
  useEffect(() => {
    if (!editorRef.current || !showTemplateModal) return;

    const makeButtonsDraggable = () => {
      // Buscar todos los divs que contienen botones (links con estilos de botón)
      const buttonWrappers = editorRef.current?.querySelectorAll('div.button-wrapper') as NodeListOf<HTMLDivElement>;
      const links = editorRef.current?.querySelectorAll('a[style*="padding"]') as NodeListOf<HTMLAnchorElement>;

      links?.forEach((link) => {
        // Evitar procesar botones que ya tienen wrapper
        if (link.parentElement?.classList.contains('button-wrapper')) return;

        // Verificar si es un botón (tiene padding y background color)
        const hasButtonStyle = link.style.padding && link.style.backgroundColor;
        if (!hasButtonStyle) return;

        // Crear wrapper para el botón
        const wrapper = document.createElement('div');
        wrapper.className = 'button-wrapper relative inline-block my-2 group';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.textAlign = 'center';
        wrapper.style.margin = '15px 0';
        wrapper.style.cursor = 'move';

        // Insertar wrapper antes del link
        link.parentNode?.insertBefore(wrapper, link);
        wrapper.appendChild(link);

        // Asegurar que el link tenga minWidth y position relative
        if (!link.style.minWidth) {
          link.style.minWidth = '120px';
        }
        link.style.position = 'relative';

        // Crear handle de redimensionamiento - posicionado relativo al link
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'button-resize-handle';
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.bottom = '4px';
        resizeHandle.style.right = '4px';
        resizeHandle.style.width = '20px';
        resizeHandle.style.height = '20px';
        resizeHandle.style.backgroundColor = '#00b2de';
        resizeHandle.style.border = '2px solid white';
        resizeHandle.style.borderRadius = '50%';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.opacity = '0';
        resizeHandle.style.transition = 'opacity 0.2s';
        resizeHandle.style.zIndex = '1000';
        resizeHandle.style.pointerEvents = 'auto';
        resizeHandle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        resizeHandle.title = 'Arrastra para redimensionar';

        // Mostrar handles al hacer hover
        const handleMouseEnter = () => {
          resizeHandle.style.opacity = '1';
          link.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
        };

        const handleMouseLeave = (e: MouseEvent) => {
          // No ocultar si el mouse está sobre el handle
          if (resizingButton !== wrapper && draggingButton !== wrapper &&
            !(e.relatedTarget as HTMLElement)?.classList.contains('button-resize-handle')) {
            resizeHandle.style.opacity = '0';
            link.style.outline = 'none';
          }
        };

        // Mantener visible el handle cuando se hace hover sobre él
        resizeHandle.addEventListener('mouseenter', () => {
          resizeHandle.style.opacity = '1';
          link.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
        });

        // Toolbar de alineación para botones existentes
        const alignToolbar = document.createElement("div");
        alignToolbar.className = "button-align-toolbar";
        alignToolbar.style.position = "absolute";
        alignToolbar.style.top = "-40px";
        alignToolbar.style.left = "50%";
        alignToolbar.style.transform = "translateX(-50%)";
        alignToolbar.style.display = "flex";
        alignToolbar.style.gap = "4px";
        alignToolbar.style.backgroundColor = "white";
        alignToolbar.style.padding = "4px";
        alignToolbar.style.borderRadius = "6px";
        alignToolbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        alignToolbar.style.opacity = "0";
        alignToolbar.style.transition = "opacity 0.2s";
        alignToolbar.style.zIndex = "1001";
        alignToolbar.style.pointerEvents = "auto";

        const alignButtons = [
          { align: "left", icon: "left", title: "Izquierda" },
          { align: "center", icon: "center", title: "Centro" },
          { align: "right", icon: "right", title: "Derecha" },
          { align: "full", icon: "full", title: "Ancho completo" },
        ];

        alignButtons.forEach(({ align, icon, title }) => {
          const btn = document.createElement("button");
          btn.style.cssText = `
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
          `;
          btn.title = title;

          // Crear SVG del icono
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("width", "16");
          svg.setAttribute("height", "16");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          if (icon === "left") {
            path.setAttribute("d", "M21 10H7m14-4H3m18 8H7m14 4H3");
          } else if (icon === "center") {
            path.setAttribute("d", "M18 10H6m16-4H2m20 8H4m18 4H2");
          } else if (icon === "right") {
            path.setAttribute("d", "M3 10h14m4-4H3m18 8H7m14 4H3");
          } else if (icon === "full") {
            path.setAttribute("d", "M3 3h18m-18 4h18m-18 4h18m-18 4h18m-18 4h18");
          }
          svg.appendChild(path);
          btn.appendChild(svg);

          btn.onmouseenter = () => {
            btn.style.backgroundColor = "#f3f4f6";
            btn.style.color = "#00b2de";
          };
          btn.onmouseleave = () => {
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#6b7280";
          };

          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (align === "full") {
              wrapper.style.width = "100%";
              wrapper.style.display = "block";
              link.style.width = "100%";
              link.style.display = "block";
              link.style.textAlign = "center";
            } else {
              wrapper.style.width = "";
              wrapper.style.display = "inline-block";
              link.style.width = "";
              link.style.display = "inline-block";
              wrapper.style.textAlign = align;
            }

            // Actualizar contenido
            if (editorRef.current) {
              setTemplateForm(prev => ({
                ...prev,
                htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
              }));
            }
          };

          alignToolbar.appendChild(btn);
        });

        // Mostrar/ocultar toolbar
        const showToolbar = () => {
          if (resizingButton !== wrapper && draggingButton !== wrapper) {
            alignToolbar.style.opacity = '1';
            resizeHandle.style.opacity = '1';
            link.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
          }
        };

        const hideToolbar = (e?: MouseEvent) => {
          const relatedTarget = e?.relatedTarget as HTMLElement;
          if (resizingButton !== wrapper && draggingButton !== wrapper &&
            !relatedTarget?.closest('.button-align-toolbar') &&
            !relatedTarget?.classList.contains('button-resize-handle')) {
            alignToolbar.style.opacity = '0';
            resizeHandle.style.opacity = '0';
            link.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseenter', showToolbar);
        wrapper.addEventListener('mouseleave', hideToolbar);
        alignToolbar.addEventListener('mouseenter', showToolbar);
        alignToolbar.addEventListener('mouseleave', hideToolbar);

        // Manejar inicio de redimensionamiento - debe tener prioridad sobre el arrastre
        const handleResizeMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          // Marcar que estamos redimensionando para evitar que se active el arrastre
          (wrapper as any).__isResizing = true;

          setResizingButton(wrapper);
          setResizeStartX(e.clientX);
          const currentWidth = link.offsetWidth || parseInt(link.style.width) || 200;
          setResizeStartWidth(currentWidth);
          resizeHandle.style.opacity = '1';
          link.style.outline = '2px solid #00b2de';

          // Prevenir que el arrastre se active
          return false;
        };

        // Desactivar clicks en el link durante la edición
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        });

        resizeHandle.addEventListener('mousedown', handleResizeMouseDown, true); // Usar capture phase para prioridad

        // Manejar inicio de arrastre - permitir arrastrar desde el link también
        let dragStartPos = { x: 0, y: 0 };
        let isDragging = false;
        let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
        let mouseUpHandler: (() => void) | null = null;

        const handleDragMouseDown = (e: MouseEvent) => {
          const target = e.target as HTMLElement;

          // No arrastrar si se hace click en el handle de redimensionamiento, toolbar o si ya se está redimensionando
          if (target.classList.contains('button-resize-handle') ||
            target.closest('.button-resize-handle') ||
            target.closest('.button-align-toolbar') ||
            (wrapper as any).__isResizing) {
            return;
          }

          // Guardar posición inicial
          dragStartPos = { x: e.clientX, y: e.clientY };
          isDragging = false;

          // Si es click en el link, prevenir el comportamiento por defecto temporalmente
          if (target.tagName === 'A') {
            e.preventDefault();
          }

          const rect = wrapper.getBoundingClientRect();
          const editorRect = editorRef.current?.getBoundingClientRect();

          if (editorRect && editorRef.current) {
            // Asegurar que el editor tenga position relative
            if (getComputedStyle(editorRef.current).position === 'static') {
              editorRef.current.style.position = 'relative';
            }

            // Detectar movimiento para iniciar arrastre
            mouseMoveHandler = (moveEvent: MouseEvent) => {
              const deltaX = Math.abs(moveEvent.clientX - dragStartPos.x);
              const deltaY = Math.abs(moveEvent.clientY - dragStartPos.y);

              // Si el mouse se movió más de 5px, iniciar arrastre
              if ((deltaX > 5 || deltaY > 5) && !isDragging) {
                isDragging = true;

                // Crear placeholder en la posición actual
                const placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.height = `${wrapper.offsetHeight}px`;
                placeholder.style.minHeight = '40px';
                placeholder.style.border = '2px dashed #00b2de';
                placeholder.style.borderRadius = '4px';
                placeholder.style.margin = '10px 0';
                placeholder.style.opacity = '0.5';

                // Insertar placeholder donde está el botón
                if (wrapper.parentNode) {
                  wrapper.parentNode.insertBefore(placeholder, wrapper);
                  setDragPlaceholder(placeholder);
                }

                // Hacer el botón flotante para arrastrar
                const currentRect = wrapper.getBoundingClientRect();
                wrapper.style.position = 'fixed';
                wrapper.style.left = `${currentRect.left}px`;
                wrapper.style.top = `${currentRect.top}px`;
                wrapper.style.margin = '0';
                wrapper.style.zIndex = '10000';
                wrapper.style.pointerEvents = 'none';

                setDraggingButton(wrapper);
                setDragStartX(moveEvent.clientX);
                setDragStartY(moveEvent.clientY);
                setDragStartLeft(currentRect.left);
                setDragStartTop(currentRect.top);

                wrapper.style.opacity = '0.8';
                link.style.outline = '2px solid #00b2de';
                link.style.pointerEvents = 'none';
              }
            };

            mouseUpHandler = () => {
              if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
              }
              if (mouseUpHandler) {
                document.removeEventListener('mouseup', mouseUpHandler);
              }
              mouseMoveHandler = null;
              mouseUpHandler = null;
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
          }
        };

        // Agregar listeners con menor prioridad (sin capture) para que el resize tenga prioridad
        wrapper.addEventListener('mousedown', handleDragMouseDown, false);
        link.addEventListener('mousedown', handleDragMouseDown, false);

        // Limpiar estilos al soltar
        const handleDragEnd = () => {
          if (draggingButton === wrapper) {
            wrapper.style.opacity = '1';
            link.style.outline = 'none';
            link.style.pointerEvents = 'auto'; // Reactivar clicks en el link
          }
        };

        wrapper.addEventListener('mouseup', handleDragEnd);

        link.appendChild(resizeHandle); // El handle debe estar dentro del link para posicionarse relativo a él

        // Verificar si ya tiene toolbar, si no, agregarlo
        if (!wrapper.querySelector('.button-align-toolbar')) {
          // Crear toolbar de alineación si no existe
          const existingAlignToolbar = document.createElement("div");
          existingAlignToolbar.className = "button-align-toolbar";
          existingAlignToolbar.style.position = "absolute";
          existingAlignToolbar.style.top = "-40px";
          existingAlignToolbar.style.left = "50%";
          existingAlignToolbar.style.transform = "translateX(-50%)";
          existingAlignToolbar.style.display = "flex";
          existingAlignToolbar.style.gap = "4px";
          existingAlignToolbar.style.backgroundColor = "white";
          existingAlignToolbar.style.padding = "4px";
          existingAlignToolbar.style.borderRadius = "6px";
          existingAlignToolbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
          existingAlignToolbar.style.opacity = "0";
          existingAlignToolbar.style.transition = "opacity 0.2s";
          existingAlignToolbar.style.zIndex = "1001";
          existingAlignToolbar.style.pointerEvents = "auto";

          const alignButtons = [
            { align: "left", icon: "left", title: "Izquierda" },
            { align: "center", icon: "center", title: "Centro" },
            { align: "right", icon: "right", title: "Derecha" },
            { align: "full", icon: "full", title: "Ancho completo" },
          ];

          alignButtons.forEach(({ align, icon, title }) => {
            const btn = document.createElement("button");
            btn.style.cssText = `
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              background: transparent;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;
              color: #6b7280;
            `;
            btn.title = title;

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "16");
            svg.setAttribute("height", "16");
            svg.setAttribute("viewBox", "0 0 24 24");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "currentColor");
            svg.setAttribute("stroke-width", "2");
            svg.setAttribute("stroke-linecap", "round");
            svg.setAttribute("stroke-linejoin", "round");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            if (icon === "left") {
              path.setAttribute("d", "M21 10H7m14-4H3m18 8H7m14 4H3");
            } else if (icon === "center") {
              path.setAttribute("d", "M18 10H6m16-4H2m20 8H4m18 4H2");
            } else if (icon === "right") {
              path.setAttribute("d", "M3 10h14m4-4H3m18 8H7m14 4H3");
            } else if (icon === "full") {
              path.setAttribute("d", "M3 3h18m-18 4h18m-18 4h18m-18 4h18m-18 4h18");
            }
            svg.appendChild(path);
            btn.appendChild(svg);

            btn.onmouseenter = () => {
              btn.style.backgroundColor = "#f3f4f6";
              btn.style.color = "#00b2de";
            };
            btn.onmouseleave = () => {
              btn.style.backgroundColor = "transparent";
              btn.style.color = "#6b7280";
            };

            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();

              const buttonLink = wrapper.querySelector('a') as HTMLAnchorElement;
              if (!buttonLink) return;

              if (align === "full") {
                wrapper.style.width = "100%";
                wrapper.style.display = "block";
                wrapper.style.textAlign = "center";
                buttonLink.style.width = "100%";
                buttonLink.style.display = "block";
                buttonLink.style.textAlign = "center";
              } else if (align === "center") {
                wrapper.style.width = "100%";
                wrapper.style.display = "block";
                wrapper.style.textAlign = "center";
                buttonLink.style.width = "";
                buttonLink.style.display = "inline-block";
                buttonLink.style.textAlign = "center";
              } else if (align === "left") {
                wrapper.style.width = "100%";
                wrapper.style.display = "block";
                wrapper.style.textAlign = "left";
                buttonLink.style.width = "";
                buttonLink.style.display = "inline-block";
                buttonLink.style.textAlign = "center";
              } else if (align === "right") {
                wrapper.style.width = "100%";
                wrapper.style.display = "block";
                wrapper.style.textAlign = "right";
                buttonLink.style.width = "";
                buttonLink.style.display = "inline-block";
                buttonLink.style.textAlign = "center";
              }

              if (editorRef.current) {
                setTemplateForm(prev => ({
                  ...prev,
                  htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
                }));
              }
            };

            existingAlignToolbar.appendChild(btn);
          });

          wrapper.addEventListener('mouseenter', () => {
            if (resizingButton !== wrapper && draggingButton !== wrapper) {
              existingAlignToolbar.style.opacity = '1';
            }
          });

          wrapper.addEventListener('mouseleave', (e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            if (resizingButton !== wrapper && draggingButton !== wrapper &&
              !relatedTarget?.closest('.button-align-toolbar') &&
              !relatedTarget?.classList.contains('button-resize-handle')) {
              existingAlignToolbar.style.opacity = '0';
            }
          });

          existingAlignToolbar.addEventListener('mouseenter', () => {
            existingAlignToolbar.style.opacity = '1';
          });

          existingAlignToolbar.addEventListener('mouseleave', () => {
            if (resizingButton !== wrapper && draggingButton !== wrapper) {
              existingAlignToolbar.style.opacity = '0';
            }
          });

          wrapper.appendChild(existingAlignToolbar);
        }
      });
    };

    // Ejecutar después de un pequeño delay
    const timeoutId = setTimeout(makeButtonsDraggable, 200);

    // Observar cambios en el editor
    const observer = new MutationObserver(() => {
      makeButtonsDraggable();
    });

    if (editorRef.current) {
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [showTemplateModal, resizingButton, draggingButton]);

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
    setTemplateForm({
      name: "",
      subject: "",
      htmlContent: "",
    });
    setShowTemplateModal(true);
    // Resetear el editor
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }, 100);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
    });
    setShowTemplateModal(true);
    // Cargar contenido en el editor
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = template.htmlContent;
      }
    }, 100);
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
      const htmlContent = editorRef.current?.innerHTML || templateForm.htmlContent;

      if (editingTemplate) {
        // Actualizar template existente
        const updated = await updateEmailTemplate(editingTemplate.id, {
          name: templateForm.name,
          subject: templateForm.subject,
          htmlContent: htmlContent,
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
        });
        setTemplates([...templates, newTemplate]);
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Archivo inválido", "Por favor selecciona un archivo de imagen", "warning");
      return;
    }

    try {
      setUploadingImage(true);
      setShowImageModal(true); // Mostrar modal inmediatamente con el indicador de carga

      // Subir la imagen inmediatamente
      const response = await uploadFile(file, {
        folder: "marketing",
        isPublic: true,
      });

      const imageUrl = response.url;

      // Crear preview con la URL subida
      setImagePreview(imageUrl);
      setImageFile(file);

      // Obtener dimensiones originales
      const img = new Image();
      img.onload = () => {
        // Establecer ancho inicial (máximo 600px o el ancho original si es menor)
        const initialWidth = Math.min(img.width, 600);
        setImageWidth(initialWidth);
      };
      img.src = imageUrl;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      showAlert("Error", "Error al subir la imagen. Por favor, intenta de nuevo.", "danger");
      setShowImageModal(false);
      setImagePreview(null);
      setImageFile(null);
    } finally {
      setUploadingImage(false);
      // Resetear el input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInsertImage = async () => {
    if (!imagePreview || !imageFile) return;

    try {
      // La imagen ya está subida, usar la URL directamente
      // Si el usuario cambió el tamaño, podríamos subir una versión redimensionada
      // Por ahora usamos la URL original que ya está subida
      const finalUrl = imagePreview;

      // Insertar la imagen en el editor
      if (editorRef.current) {
        // Asegurar que el editor tenga foco
        editorRef.current.focus();

        // Intentar obtener la selección, pero si no hay, crear un rango al final
        let range: Range | null = null;
        try {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const tempRange = selection.getRangeAt(0);
            // Verificar que el rango esté dentro del editor
            if (editorRef.current.contains(tempRange.commonAncestorContainer)) {
              range = tempRange;
            }
          }
        } catch (error) {
          // Si hay error, continuar sin rango
          console.log('Error obteniendo selección:', error);
        }

        // Si no hay rango válido, crear uno al final del editor
        if (!range) {
          range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false); // Colapsar al final
        }

        // Crear wrapper para la imagen
        const wrapper = document.createElement("div");
        wrapper.className = "image-wrapper relative inline-block my-2 group";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.maxWidth = "100%";
        wrapper.style.margin = "10px auto";
        wrapper.style.overflow = "visible"; // Asegurar que el handle sea visible

        // Ajustar el wrapper para que coincida con el tamaño de la imagen
        const adjustWrapperSize = () => {
          if (img.offsetWidth > 0 && img.offsetHeight > 0) {
            wrapper.style.width = `${img.offsetWidth}px`;
            wrapper.style.height = `${img.offsetHeight}px`;
          }
        };

        // Obtener el ancho máximo disponible del editor
        const editorWidth = editorRef.current?.offsetWidth || 600;
        const maxEditorWidth = editorWidth - 48; // Restar padding (24px cada lado)
        const finalImageWidth = Math.min(imageWidth, maxEditorWidth);

        const img = document.createElement("img");
        img.src = finalUrl;
        img.style.maxWidth = `${finalImageWidth}px`;
        img.style.width = `${finalImageWidth}px`;
        img.style.height = "auto";
        img.style.display = "block";
        img.style.position = "relative";
        img.style.cursor = "default";
        img.style.userSelect = "none";
        img.style.overflow = "visible"; // Asegurar que el handle sea visible
        img.setAttribute('data-width', finalImageWidth.toString());

        // Crear handle de redimensionamiento - posicionado relativo al wrapper
        const resizeHandle = document.createElement("div");
        resizeHandle.className = "resize-handle";
        resizeHandle.setAttribute('contentEditable', 'false');
        resizeHandle.setAttribute('draggable', 'false');
        resizeHandle.style.position = "absolute";
        resizeHandle.style.width = "20px";
        resizeHandle.style.height = "20px";
        resizeHandle.style.backgroundColor = "#00b2de";
        resizeHandle.style.border = "2px solid white";
        resizeHandle.style.borderRadius = "50%";
        resizeHandle.style.cursor = "nwse-resize";
        resizeHandle.style.opacity = "0";
        resizeHandle.style.transition = "opacity 0.2s";
        resizeHandle.style.zIndex = "1000";
        resizeHandle.style.pointerEvents = "auto";
        resizeHandle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        resizeHandle.style.userSelect = "none";
        resizeHandle.style.webkitUserSelect = "none";
        resizeHandle.title = "Arrastra para redimensionar";
        resizeHandle.style.bottom = "4px";
        resizeHandle.style.right = "4px";

        // Prevenir eventos de texto y teclado en el handle
        resizeHandle.addEventListener('keydown', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('keypress', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('keyup', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('input', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        resizeHandle.addEventListener('paste', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        // Actualizar tamaño del wrapper cuando la imagen carga
        if (img.complete) {
          setTimeout(adjustWrapperSize, 0);
        } else {
          img.onload = adjustWrapperSize;
        }

        // Toolbar de alineación para imágenes
        const alignToolbar = document.createElement("div");
        alignToolbar.className = "image-align-toolbar";
        alignToolbar.style.position = "absolute";
        alignToolbar.style.top = "-40px";
        alignToolbar.style.left = "50%";
        alignToolbar.style.transform = "translateX(-50%)";
        alignToolbar.style.display = "flex";
        alignToolbar.style.gap = "4px";
        alignToolbar.style.backgroundColor = "white";
        alignToolbar.style.padding = "4px";
        alignToolbar.style.borderRadius = "6px";
        alignToolbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
        alignToolbar.style.opacity = "0";
        alignToolbar.style.transition = "opacity 0.2s";
        alignToolbar.style.zIndex = "1001";
        alignToolbar.style.pointerEvents = "auto";

        const alignButtons = [
          { align: "left", icon: "left", title: "Izquierda" },
          { align: "center", icon: "center", title: "Centro" },
          { align: "right", icon: "right", title: "Derecha" },
          { align: "full", icon: "full", title: "Ancho completo" },
        ];

        alignButtons.forEach(({ align, icon, title }) => {
          const btn = document.createElement("button");
          btn.style.cssText = `
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            background: transparent;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
            color: #6b7280;
          `;
          btn.title = title;

          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("width", "16");
          svg.setAttribute("height", "16");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          if (icon === "left") {
            path.setAttribute("d", "M21 10H7m14-4H3m18 8H7m14 4H3");
          } else if (icon === "center") {
            path.setAttribute("d", "M18 10H6m16-4H2m20 8H4m18 4H2");
          } else if (icon === "right") {
            path.setAttribute("d", "M3 10h14m4-4H3m18 8H7m14 4H3");
          } else if (icon === "full") {
            path.setAttribute("d", "M3 3h18m-18 4h18m-18 4h18m-18 4h18m-18 4h18");
          }
          svg.appendChild(path);
          btn.appendChild(svg);

          btn.onmouseenter = () => {
            btn.style.backgroundColor = "#f3f4f6";
            btn.style.color = "#00b2de";
          };
          btn.onmouseleave = () => {
            btn.style.backgroundColor = "transparent";
            btn.style.color = "#6b7280";
          };

          btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Guardar el tamaño actual ANTES de hacer cualquier cambio
            const savedWidth = img.style.width || img.getAttribute('data-width') || '';
            const widthValue = savedWidth ? (savedWidth.includes('px') ? savedWidth : `${savedWidth}px`) : '';

            if (align === "full") {
              // Full width: cambiar a 100%
              wrapper.style.width = "100%";
              wrapper.style.display = "block";
              wrapper.style.textAlign = "";
              img.style.width = "100%";
              img.style.maxWidth = "100%";
              img.style.display = "block";
            } else {
              // Para left, center, right: mantener wrapper en 100% para que textAlign funcione
              wrapper.style.width = "100%";
              wrapper.style.display = "block";
              wrapper.style.textAlign = align;
              img.style.display = "inline-block";

              // Restaurar el tamaño original si existe (NO cambiar a 100%)
              if (widthValue && widthValue !== '100%') {
                img.style.width = widthValue;
                img.style.maxWidth = widthValue;
                if (savedWidth && !savedWidth.includes('px')) {
                  img.setAttribute('data-width', savedWidth);
                }
              } else if (!widthValue) {
                // Si no hay tamaño guardado, mantener el tamaño actual
                const currentWidth = img.offsetWidth;
                if (currentWidth > 0) {
                  img.style.width = `${currentWidth}px`;
                  img.style.maxWidth = `${currentWidth}px`;
                  img.setAttribute('data-width', currentWidth.toString());
                }
              }
            }

            // Actualizar handle después de un pequeño delay
            setTimeout(() => {
              const resizeHandle = wrapper.querySelector('.resize-handle') as HTMLElement;
              if (resizeHandle) {
                if (align === "full") {
                  // Para full, el handle se posiciona relativo al wrapper completo
                  resizeHandle.style.bottom = '4px';
                  resizeHandle.style.right = '4px';
                } else {
                  // Para otras alineaciones, calcular posición basada en la imagen
                  const imgRect = img.getBoundingClientRect();
                  const wrapperRect = wrapper.getBoundingClientRect();
                  if (imgRect.width > 0 && imgRect.height > 0) {
                    const imgRight = imgRect.right - wrapperRect.left;
                    const imgBottom = imgRect.bottom - wrapperRect.top;
                    resizeHandle.style.bottom = `${wrapperRect.height - imgBottom + 4}px`;
                    resizeHandle.style.right = `${wrapperRect.width - imgRight + 4}px`;
                  } else {
                    resizeHandle.style.bottom = '4px';
                    resizeHandle.style.right = '4px';
                  }
                }
              }
            }, 10);

            if (editorRef.current) {
              setTemplateForm(prev => ({
                ...prev,
                htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
              }));
            }
          };

          alignToolbar.appendChild(btn);
        });

        // Mostrar handle al hacer hover
        const showToolbar = () => {
          if (!resizingImage) {
            alignToolbar.style.opacity = '1';
            resizeHandle.style.opacity = '1';
            img.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
          }
        };

        const hideToolbar = (e?: MouseEvent) => {
          const relatedTarget = e?.relatedTarget as HTMLElement;
          if (!resizingImage &&
            !relatedTarget?.closest('.image-align-toolbar') &&
            !relatedTarget?.classList.contains('resize-handle')) {
            alignToolbar.style.opacity = '0';
            resizeHandle.style.opacity = '0';
            img.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseenter', showToolbar);
        wrapper.addEventListener('mouseleave', hideToolbar);
        alignToolbar.addEventListener('mouseenter', showToolbar);
        alignToolbar.addEventListener('mouseleave', hideToolbar);

        // Mantener visible el handle cuando se hace hover sobre él
        resizeHandle.addEventListener('mouseenter', () => {
          resizeHandle.style.opacity = '1';
          img.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
        });

        // Manejar inicio de redimensionamiento
        resizeHandle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setResizingImage(img);
          setResizeStartX(e.clientX);
          const currentWidth = parseInt(img.style.width) || finalImageWidth;
          setResizeStartWidth(currentWidth);
          resizeHandle.style.opacity = '1';
          img.style.outline = '2px solid #00b2de';
        });

        // Manejar inicio de arrastre de la imagen
        let dragStartPos = { x: 0, y: 0 };
        let isDragging = false;
        let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
        let mouseUpHandler: (() => void) | null = null;

        const handleDragMouseDown = (e: MouseEvent) => {
          const target = e.target as HTMLElement;

          // No arrastrar si se hace click en el handle de redimensionamiento, toolbar o si ya se está redimensionando
          if (target.classList.contains('resize-handle') ||
            target.closest('.resize-handle') ||
            target.closest('.image-align-toolbar') ||
            resizingImage === img) {
            return;
          }

          // Guardar posición inicial
          dragStartPos = { x: e.clientX, y: e.clientY };
          isDragging = false;

          const rect = wrapper.getBoundingClientRect();
          const editorRect = editorRef.current?.getBoundingClientRect();

          if (editorRect && editorRef.current) {
            // Asegurar que el editor tenga position relative
            if (getComputedStyle(editorRef.current).position === 'static') {
              editorRef.current.style.position = 'relative';
            }

            // Detectar movimiento para iniciar arrastre
            mouseMoveHandler = (moveEvent: MouseEvent) => {
              const deltaX = Math.abs(moveEvent.clientX - dragStartPos.x);
              const deltaY = Math.abs(moveEvent.clientY - dragStartPos.y);

              // Si el mouse se movió más de 5px, iniciar arrastre
              if ((deltaX > 5 || deltaY > 5) && !isDragging) {
                isDragging = true;

                // Crear placeholder en la posición actual
                const placeholder = document.createElement('div');
                placeholder.className = 'drag-placeholder';
                placeholder.style.height = `${wrapper.offsetHeight}px`;
                placeholder.style.minHeight = '40px';
                placeholder.style.border = '2px dashed #00b2de';
                placeholder.style.borderRadius = '4px';
                placeholder.style.margin = '10px 0';
                placeholder.style.opacity = '0.5';

                // Insertar placeholder donde está la imagen
                if (wrapper.parentNode) {
                  wrapper.parentNode.insertBefore(placeholder, wrapper);
                  setDragPlaceholder(placeholder);
                }

                // Hacer la imagen flotante para arrastrar
                const currentRect = wrapper.getBoundingClientRect();
                wrapper.style.position = 'fixed';
                wrapper.style.left = `${currentRect.left}px`;
                wrapper.style.top = `${currentRect.top}px`;
                wrapper.style.margin = '0';
                wrapper.style.zIndex = '10000';
                wrapper.style.pointerEvents = 'none';

                setDraggingImage(wrapper);
                setDragStartX(moveEvent.clientX);
                setDragStartY(moveEvent.clientY);
                setDragStartLeft(currentRect.left);
                setDragStartTop(currentRect.top);

                wrapper.style.opacity = '0.8';
                img.style.outline = '2px solid #00b2de';
              }
            };

            mouseUpHandler = () => {
              if (mouseMoveHandler) {
                document.removeEventListener('mousemove', mouseMoveHandler);
              }
              if (mouseUpHandler) {
                document.removeEventListener('mouseup', mouseUpHandler);
              }
              mouseMoveHandler = null;
              mouseUpHandler = null;
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
          }
        };

        // Agregar listeners con menor prioridad (sin capture) para que el resize tenga prioridad
        wrapper.addEventListener('mousedown', handleDragMouseDown, false);
        img.addEventListener('mousedown', handleDragMouseDown, false);

        // Limpiar estilos al soltar
        const handleDragEnd = () => {
          if (draggingImage === wrapper) {
            wrapper.style.opacity = '1';
            img.style.outline = 'none';
          }
        };

        wrapper.addEventListener('mouseup', handleDragEnd);

        wrapper.appendChild(img);
        wrapper.appendChild(resizeHandle); // El handle está en el wrapper pero se posiciona relativo a la imagen
        wrapper.appendChild(alignToolbar);

        // Insertar el wrapper en el rango (siempre hay un rango válido ahora)
        range.insertNode(wrapper);

        // Colocar el cursor después de la imagen
        range.setStartAfter(wrapper);
        range.collapse(true);
        const finalSelection = window.getSelection();
        if (finalSelection) {
          finalSelection.removeAllRanges();
          finalSelection.addRange(range);
        }

        // Actualizar contenido
        if (editorRef.current) {
          setTemplateForm({
            ...templateForm,
            htmlContent: editorRef.current.innerHTML,
          });
        }
      }

      // Cerrar modal y resetear
      setShowImageModal(false);
      setImagePreview(null);
      setImageFile(null);
      setImageWidth(600);
    } catch (error) {
      console.error("Error al subir imagen:", error);
      showAlert("Error", "Error al procesar la imagen", "danger");
    } finally {
      setUploadingImage(false);
    }
  };

  const resizeImage = (file: File, maxWidth: number): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          }, file.type, 0.9);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
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

  const insertTextAtCursor = (text: string) => {
    if (!editorRef.current) return;

    // Verificar que el editor tenga el foco o dárselo
    if (document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }

    // Verificar que la selección esté dentro del editor
    const selection = window.getSelection();
    if (!selection) return;

    let range: Range | null = null;
    try {
      if (selection.rangeCount > 0) {
        const tempRange = selection.getRangeAt(0);
        // Verificar que el rango esté dentro del editor
        if (editorRef.current.contains(tempRange.commonAncestorContainer)) {
          range = tempRange;
        }
      }
    } catch (error) {
      // Si hay error, crear un rango al final del editor
    }

    // Si no hay rango válido, crear uno al final del editor
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Colapsar al final
    }

    // Insertar el texto
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    // Actualizar el contenido
    setTemplateForm(prev => ({
      ...prev,
      htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
    }));
  };

  const handleInsertButton = () => {
    if (!buttonConfig.text || !buttonConfig.url) {
      showAlert("Campos requeridos", "El texto y la URL son requeridos", "warning");
      return;
    }

    if (!editorRef.current) return;

    // Asegurar que el editor tenga el foco
    editorRef.current.focus();

    const selection = window.getSelection();
    let range: Range | null = null;

    // Obtener el rango de selección si existe y está dentro del editor
    if (selection && selection.rangeCount > 0) {
      const tempRange = selection.getRangeAt(0);
      // Verificar que el rango esté dentro del editor
      if (editorRef.current.contains(tempRange.commonAncestorContainer)) {
        range = tempRange;
      }
    }

    // Si no hay rango válido, crear uno al final del editor
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Colapsar al final
    }

    // Crear el wrapper del botón con capacidad de arrastre y redimensionamiento
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = "button-wrapper relative inline-block my-2 group";
    buttonWrapper.style.position = "relative";
    buttonWrapper.style.display = "inline-block";
    buttonWrapper.style.textAlign = "center";
    buttonWrapper.style.margin = "15px 0";
    buttonWrapper.style.cursor = "move";

    const link = document.createElement("a");
    link.href = buttonConfig.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "inline-block";
    link.style.position = "relative";
    link.style.padding = "12px 30px";
    link.style.backgroundColor = buttonConfig.color;
    link.style.color = buttonConfig.textColor;
    link.style.textDecoration = "none";
    link.style.borderRadius = "8px";
    link.style.fontWeight = "600";
    link.style.fontSize = "16px";
    link.style.cursor = "pointer";
    link.style.transition = "all 0.3s ease";
    link.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    link.style.minWidth = "120px";
    link.textContent = buttonConfig.text;

    // Desactivar clicks en el link durante la edición
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    // Efecto hover del botón
    link.onmouseenter = () => {
      if (!draggingButton && !resizingButton) {
        const rgb = hexToRgb(buttonConfig.color);
        if (rgb) {
          link.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
        }
        link.style.transform = "translateY(-2px)";
        link.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
      }
    };
    link.onmouseleave = () => {
      if (!draggingButton && !resizingButton) {
        link.style.backgroundColor = buttonConfig.color;
        link.style.transform = "translateY(0)";
        link.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      }
    };

    // Handle de redimensionamiento - posicionado relativo al link
    const resizeHandle = document.createElement("div");
    resizeHandle.className = "button-resize-handle";
    resizeHandle.style.position = "absolute";
    resizeHandle.style.bottom = "-8px";
    resizeHandle.style.right = "-8px";
    resizeHandle.style.width = "20px";
    resizeHandle.style.height = "20px";
    resizeHandle.style.backgroundColor = "#00b2de";
    resizeHandle.style.border = "2px solid white";
    resizeHandle.style.borderRadius = "50%";
    resizeHandle.style.cursor = "nwse-resize";
    resizeHandle.style.opacity = "0";
    resizeHandle.style.transition = "opacity 0.2s";
    resizeHandle.style.zIndex = "1000";
    resizeHandle.style.pointerEvents = "auto";
    resizeHandle.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    resizeHandle.title = "Arrastra para redimensionar";

    // Mostrar handles al hacer hover
    buttonWrapper.addEventListener('mouseenter', () => {
      if (!resizingButton && !draggingButton) {
        resizeHandle.style.opacity = '1';
        link.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
      }
    });

    buttonWrapper.addEventListener('mouseleave', (e) => {
      // No ocultar si el mouse está sobre el handle
      if (!resizingButton && !draggingButton &&
        !(e.relatedTarget as HTMLElement)?.classList.contains('button-resize-handle')) {
        resizeHandle.style.opacity = '0';
        link.style.outline = 'none';
      }
    });

    // Mantener visible el handle cuando se hace hover sobre él
    resizeHandle.addEventListener('mouseenter', () => {
      resizeHandle.style.opacity = '1';
      link.style.outline = '2px solid rgba(0, 178, 222, 0.3)';
    });

    // Toolbar de alineación
    const alignToolbar = document.createElement("div");
    alignToolbar.className = "button-align-toolbar";
    alignToolbar.style.position = "absolute";
    alignToolbar.style.top = "-40px";
    alignToolbar.style.left = "50%";
    alignToolbar.style.transform = "translateX(-50%)";
    alignToolbar.style.display = "flex";
    alignToolbar.style.gap = "4px";
    alignToolbar.style.backgroundColor = "white";
    alignToolbar.style.padding = "4px";
    alignToolbar.style.borderRadius = "6px";
    alignToolbar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    alignToolbar.style.opacity = "0";
    alignToolbar.style.transition = "opacity 0.2s";
    alignToolbar.style.zIndex = "1001";
    alignToolbar.style.pointerEvents = "auto";

    const alignButtons = [
      { align: "left", icon: "left", title: "Izquierda" },
      { align: "center", icon: "center", title: "Centro" },
      { align: "right", icon: "right", title: "Derecha" },
      { align: "full", icon: "full", title: "Ancho completo" },
    ];

    alignButtons.forEach(({ align, icon, title }) => {
      const btn = document.createElement("button");
      btn.style.cssText = `
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        color: #6b7280;
      `;
      btn.title = title;

      // Crear SVG del icono
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      if (icon === "left") {
        path.setAttribute("d", "M21 10H7m14-4H3m18 8H7m14 4H3");
      } else if (icon === "center") {
        path.setAttribute("d", "M18 10H6m16-4H2m20 8H4m18 4H2");
      } else if (icon === "right") {
        path.setAttribute("d", "M3 10h14m4-4H3m18 8H7m14 4H3");
      } else if (icon === "full") {
        path.setAttribute("d", "M3 3h18m-18 4h18m-18 4h18m-18 4h18m-18 4h18");
      }
      svg.appendChild(path);
      btn.appendChild(svg);

      btn.onmouseenter = () => {
        btn.style.backgroundColor = "#f3f4f6";
        btn.style.color = "#00b2de";
      };
      btn.onmouseleave = () => {
        btn.style.backgroundColor = "transparent";
        btn.style.color = "#6b7280";
      };

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (align === "full") {
          buttonWrapper.style.width = "100%";
          buttonWrapper.style.display = "block";
          buttonWrapper.style.textAlign = "center";
          link.style.width = "100%";
          link.style.display = "block";
          link.style.textAlign = "center";
        } else if (align === "center") {
          buttonWrapper.style.width = "100%";
          buttonWrapper.style.display = "block";
          buttonWrapper.style.textAlign = "center";
          link.style.width = "";
          link.style.display = "inline-block";
          link.style.textAlign = "center";
        } else if (align === "left") {
          buttonWrapper.style.width = "100%";
          buttonWrapper.style.display = "block";
          buttonWrapper.style.textAlign = "left";
          link.style.width = "";
          link.style.display = "inline-block";
          link.style.textAlign = "center";
        } else if (align === "right") {
          buttonWrapper.style.width = "100%";
          buttonWrapper.style.display = "block";
          buttonWrapper.style.textAlign = "right";
          link.style.width = "";
          link.style.display = "inline-block";
          link.style.textAlign = "center";
        }

        // Actualizar contenido
        if (editorRef.current) {
          setTemplateForm(prev => ({
            ...prev,
            htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
          }));
        }
      };

      alignToolbar.appendChild(btn);
    });

    // Mostrar/ocultar toolbar
    buttonWrapper.addEventListener('mouseenter', () => {
      if (!resizingButton && !draggingButton) {
        alignToolbar.style.opacity = '1';
      }
    });

    buttonWrapper.addEventListener('mouseleave', (e) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (!resizingButton && !draggingButton &&
        !relatedTarget?.closest('.button-align-toolbar') &&
        !relatedTarget?.classList.contains('button-resize-handle')) {
        alignToolbar.style.opacity = '0';
      }
    });

    alignToolbar.addEventListener('mouseenter', () => {
      alignToolbar.style.opacity = '1';
    });

    alignToolbar.addEventListener('mouseleave', () => {
      if (!resizingButton && !draggingButton) {
        alignToolbar.style.opacity = '0';
      }
    });

    // Manejar inicio de redimensionamiento - debe tener prioridad sobre el arrastre
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Marcar que estamos redimensionando para evitar que se active el arrastre
      (buttonWrapper as any).__isResizing = true;

      setResizingButton(buttonWrapper);
      setResizeStartX(e.clientX);
      const currentWidth = link.offsetWidth || parseInt(link.style.width) || 200;
      setResizeStartWidth(currentWidth);
      resizeHandle.style.opacity = '1';
      link.style.outline = '2px solid #00b2de';

      // Prevenir que el arrastre se active
      return false;
    }, true); // Usar capture phase para tener prioridad

    // Manejar inicio de arrastre - permitir arrastrar desde el link también
    let dragStartPos = { x: 0, y: 0 };
    let isDragging = false;
    let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
    let mouseUpHandler: (() => void) | null = null;

    const handleDragStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // No arrastrar si se hace click en el handle de redimensionamiento, toolbar o si ya se está redimensionando
      if (target.classList.contains('button-resize-handle') ||
        target.closest('.button-resize-handle') ||
        target.closest('.button-align-toolbar') ||
        (buttonWrapper as any).__isResizing) {
        return;
      }

      // Guardar posición inicial
      dragStartPos = { x: e.clientX, y: e.clientY };
      isDragging = false;

      // Si es click en el link, prevenir el comportamiento por defecto temporalmente
      if (target.tagName === 'A') {
        e.preventDefault();
      }

      const rect = buttonWrapper.getBoundingClientRect();
      const editorRect = editorRef.current?.getBoundingClientRect();

      if (editorRect && editorRef.current) {
        // Asegurar que el editor tenga position relative
        if (getComputedStyle(editorRef.current).position === 'static') {
          editorRef.current.style.position = 'relative';
        }

        // Detectar movimiento para iniciar arrastre
        mouseMoveHandler = (moveEvent: MouseEvent) => {
          const deltaX = Math.abs(moveEvent.clientX - dragStartPos.x);
          const deltaY = Math.abs(moveEvent.clientY - dragStartPos.y);

          // Si el mouse se movió más de 5px, iniciar arrastre
          if ((deltaX > 5 || deltaY > 5) && !isDragging) {
            isDragging = true;

            // Crear placeholder en la posición actual
            const placeholder = document.createElement('div');
            placeholder.className = 'drag-placeholder';
            placeholder.style.height = `${buttonWrapper.offsetHeight}px`;
            placeholder.style.minHeight = '40px';
            placeholder.style.border = '2px dashed #00b2de';
            placeholder.style.borderRadius = '4px';
            placeholder.style.margin = '10px 0';
            placeholder.style.opacity = '0.5';

            // Insertar placeholder donde está el botón
            if (buttonWrapper.parentNode) {
              buttonWrapper.parentNode.insertBefore(placeholder, buttonWrapper);
              setDragPlaceholder(placeholder);
            }

            // Hacer el botón flotante para arrastrar
            const currentRect = buttonWrapper.getBoundingClientRect();
            buttonWrapper.style.position = 'fixed';
            buttonWrapper.style.left = `${currentRect.left}px`;
            buttonWrapper.style.top = `${currentRect.top}px`;
            buttonWrapper.style.margin = '0';
            buttonWrapper.style.zIndex = '10000';
            buttonWrapper.style.pointerEvents = 'none';

            setDraggingButton(buttonWrapper);
            setDragStartX(moveEvent.clientX);
            setDragStartY(moveEvent.clientY);
            setDragStartLeft(currentRect.left);
            setDragStartTop(currentRect.top);

            buttonWrapper.style.opacity = '0.8';
            link.style.outline = '2px solid #00b2de';
            link.style.pointerEvents = 'none';
          }
        };

        mouseUpHandler = () => {
          if (mouseMoveHandler) {
            document.removeEventListener('mousemove', mouseMoveHandler);
          }
          if (mouseUpHandler) {
            document.removeEventListener('mouseup', mouseUpHandler);
          }
          mouseMoveHandler = null;
          mouseUpHandler = null;
        };

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
      }
    };

    // Agregar listeners con menor prioridad (sin capture) para que el resize tenga prioridad
    buttonWrapper.addEventListener('mousedown', handleDragStart, false);
    link.addEventListener('mousedown', handleDragStart, false);

    // Limpiar estilos al soltar
    const handleDragEnd = () => {
      if (draggingButton === buttonWrapper) {
        buttonWrapper.style.opacity = '1';
        link.style.outline = 'none';
        link.style.pointerEvents = 'auto'; // Reactivar clicks en el link
      }
    };

    buttonWrapper.addEventListener('mouseup', handleDragEnd);

    buttonWrapper.appendChild(link);
    link.appendChild(resizeHandle); // El handle debe estar dentro del link para posicionarse relativo a él
    buttonWrapper.appendChild(alignToolbar);

    // Insertar el botón
    try {
      // Eliminar cualquier contenido seleccionado
      range.deleteContents();

      // Insertar el botón
      range.insertNode(buttonWrapper);

      // Colocar el cursor después del botón
      range.setStartAfter(buttonWrapper);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Actualizar contenido
      setTemplateForm(prev => ({
        ...prev,
        htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
      }));

      // Cerrar modal y resetear
      setShowButtonModal(false);
      setButtonConfig({
        text: "",
        url: "",
        color: "#00b2de",
        textColor: "#ffffff",
      });
    } catch (error) {
      console.error("Error al insertar botón:", error);
      // Fallback: insertar al final del editor
      editorRef.current.appendChild(buttonWrapper);
      setTemplateForm(prev => ({
        ...prev,
        htmlContent: editorRef.current?.innerHTML || prev.htmlContent,
      }));
      setShowButtonModal(false);
      setButtonConfig({
        text: "",
        url: "",
        color: "#00b2de",
        textColor: "#ffffff",
      });
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
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
                    Marketing por Email
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
                              <h3 className="text-sm font-semibold text-gray-900">
                                {template.name}
                              </h3>
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
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
                    </h2>
                    <p className="text-sm text-gray-600">
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

              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nombre de la plantilla
                      </label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                        placeholder="Ej: Promoción de Verano"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Asunto del correo
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) =>
                          setTemplateForm({ ...templateForm, subject: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                        placeholder="Ej: ¡Oferta especial para ti!"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-gray-900">
                        Contenido del correo
                      </label>
                    </div>

                    {/* Barra de herramientas del editor */}
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("bold", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors"
                          title="Negrita"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("italic", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm italic transition-colors"
                          title="Cursiva"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("underline", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm underline transition-colors"
                          title="Subrayado"
                        >
                          U
                        </button>
                      </div>
                      <div className="w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("justifyLeft", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Alinear a la izquierda"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("justifyCenter", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Centrar texto"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            document.execCommand("justifyRight", false);
                            editorRef.current?.focus();
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Alinear a la derecha"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="w-px bg-gray-200" />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setTextColorPickerOpen(true);
                            setTextColorValue('#000000');
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors flex items-center gap-1.5"
                          title="Color de texto"
                        >
                          <span className="font-bold">A</span>
                          <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: textColorValue }}
                          />
                        </button>

                        {textColorPickerOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setTextColorPickerOpen(false)}
                            />
                            <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 right-0">
                              <div className="space-y-4">
                                {/* Paleta de colores predefinidos */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Colores predefinidos
                                  </label>
                                  <div className="grid grid-cols-8 gap-2">
                                    {[
                                      "#000000", "#ffffff", "#6b7280", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
                                      "#1f2937", "#f3f4f6", "#9ca3af", "#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed",
                                      "#111827", "#e5e7eb", "#b91c1c", "#1e40af", "#047857", "#b45309", "#6d28d9",
                                      "#030712", "#d1d5db", "#4b5563", "#991b1b", "#1e3a8a", "#065f46", "#92400e", "#5b21b6",
                                    ].map((color, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setTextColorValue(color);
                                          document.execCommand("foreColor", false, color);
                                          editorRef.current?.focus();
                                          setTextColorPickerOpen(false);
                                        }}
                                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:scale-110 transition-all cursor-pointer"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                </div>

                                {/* Selector de color personalizado */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Color personalizado
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={textColorValue}
                                      onChange={(e) => {
                                        const color = e.target.value;
                                        setTextColorValue(color);
                                        document.execCommand("foreColor", false, color);
                                        editorRef.current?.focus();
                                      }}
                                      className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                                    />
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={textColorValue}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                            setTextColorValue(value);
                                          }
                                        }}
                                        onBlur={(e) => {
                                          const color = e.target.value;
                                          if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                                            document.execCommand("foreColor", false, color);
                                            editorRef.current?.focus();
                                          }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      document.execCommand("foreColor", false, textColorValue);
                                      editorRef.current?.focus();
                                      setTextColorPickerOpen(false);
                                    }}
                                    className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                  >
                                    Aplicar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTextColorPickerOpen(false)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="w-px bg-gray-200" />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                        title="Insertar imagen"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Imagen
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="w-px bg-gray-200" />
                      <button
                        type="button"
                        onClick={() => setShowButtonModal(true)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                        title="Insertar botón con enlace"
                      >
                        <Link2 className="w-4 h-4" />
                        Botón
                      </button>
                      <div className="w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor("{{nombre}}")}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-mono transition-colors"
                          title="Insertar variable nombre"
                        >
                          {"{{nombre}}"}
                        </button>
                      </div>
                    </div>

                    {/* Editor de contenido */}
                    <div
                      ref={editorRef}
                      contentEditable
                      className="w-full min-h-[400px] px-6 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white transition-all"
                      style={{ outline: "none", position: "relative" }}
                      onInput={(e) => {
                        if (editorRef.current) {
                          setTemplateForm({
                            ...templateForm,
                            htmlContent: editorRef.current.innerHTML,
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        // Detectar Backspace o Delete
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          const selection = window.getSelection();
                          if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

                          const range = selection.getRangeAt(0);

                          // Si hay texto seleccionado, verificar si es una variable completa
                          if (!range.collapsed) {
                            const selectedText = range.toString();
                            const variableMatch = selectedText.match(/^\{\{[^}]+\}\}$/);
                            if (variableMatch) {
                              // Es una variable completa seleccionada, permitir borrado normal
                              return;
                            }
                          }

                          // Obtener todo el texto del editor
                          const editorText = editorRef.current.innerText || editorRef.current.textContent || '';
                          const variableRegex = /\{\{[^}]+\}\}/g;
                          const matches: Array<{ start: number; end: number; text: string }> = [];
                          let match;

                          while ((match = variableRegex.exec(editorText)) !== null) {
                            matches.push({
                              start: match.index,
                              end: match.index + match[0].length,
                              text: match[0]
                            });
                          }

                          // Obtener la posición del cursor en el texto plano
                          const rangeBefore = range.cloneRange();
                          rangeBefore.selectNodeContents(editorRef.current);
                          rangeBefore.setEnd(range.startContainer, range.startOffset);
                          const cursorPosition = rangeBefore.toString().length;

                          // Buscar si el cursor está dentro de alguna variable
                          for (const variable of matches) {
                            if (e.key === 'Backspace' && cursorPosition > variable.start && cursorPosition <= variable.end) {
                              // El cursor está dentro de la variable, borrar toda la variable
                              e.preventDefault();

                              // Encontrar el nodo de texto que contiene la variable
                              const walker = document.createTreeWalker(
                                editorRef.current,
                                NodeFilter.SHOW_TEXT,
                                null
                              );

                              let currentPos = 0;
                              let targetNode: Text | null = null;
                              let nodeStart = 0;

                              while (walker.nextNode()) {
                                const node = walker.currentNode as Text;
                                const nodeText = node.textContent || '';
                                const nodeEnd = currentPos + nodeText.length;

                                if (variable.start >= currentPos && variable.start < nodeEnd) {
                                  targetNode = node;
                                  nodeStart = currentPos;
                                  break;
                                }

                                currentPos = nodeEnd;
                              }

                              if (targetNode && targetNode.textContent) {
                                const nodeText = targetNode.textContent;
                                const varInNodeStart = variable.start - nodeStart;
                                const varInNodeEnd = variable.end - nodeStart;

                                // Crear nuevo texto sin la variable
                                const newText = nodeText.substring(0, varInNodeStart) + nodeText.substring(varInNodeEnd);
                                targetNode.textContent = newText;

                                // Colocar el cursor donde estaba la variable
                                const newRange = document.createRange();
                                newRange.setStart(targetNode, varInNodeStart);
                                newRange.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(newRange);

                                // Actualizar contenido
                                setTemplateForm({
                                  ...templateForm,
                                  htmlContent: editorRef.current.innerHTML,
                                });
                              }
                              return;
                            } else if (e.key === 'Delete' && cursorPosition >= variable.start && cursorPosition < variable.end) {
                              // Similar para Delete
                              e.preventDefault();

                              const walker = document.createTreeWalker(
                                editorRef.current,
                                NodeFilter.SHOW_TEXT,
                                null
                              );

                              let currentPos = 0;
                              let targetNode: Text | null = null;
                              let nodeStart = 0;

                              while (walker.nextNode()) {
                                const node = walker.currentNode as Text;
                                const nodeText = node.textContent || '';
                                const nodeEnd = currentPos + nodeText.length;

                                if (variable.start >= currentPos && variable.start < nodeEnd) {
                                  targetNode = node;
                                  nodeStart = currentPos;
                                  break;
                                }

                                currentPos = nodeEnd;
                              }

                              if (targetNode && targetNode.textContent) {
                                const nodeText = targetNode.textContent;
                                const varInNodeStart = variable.start - nodeStart;
                                const varInNodeEnd = variable.end - nodeStart;

                                const newText = nodeText.substring(0, varInNodeStart) + nodeText.substring(varInNodeEnd);
                                targetNode.textContent = newText;

                                const newRange = document.createRange();
                                newRange.setStart(targetNode, varInNodeStart);
                                newRange.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(newRange);

                                setTemplateForm({
                                  ...templateForm,
                                  htmlContent: editorRef.current.innerHTML,
                                });
                              }
                              return;
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 justify-end">
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

        {/* Modal de Imagen - Compacto */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-gray-900">Ajustar imagen</h3>
                </div>
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview de la imagen - Compacto */}
                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center border border-gray-200 max-h-[200px] overflow-hidden min-h-[180px]">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">Subiendo imagen...</p>
                    </div>
                  ) : imagePreview ? (
                    <img
                      ref={imagePreviewRef}
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: `${Math.min(imageWidth, 400)}px`, width: "100%", height: "auto", maxHeight: "180px", objectFit: "contain" }}
                      className="rounded"
                    />
                  ) : null}
                </div>

                {/* Controles de tamaño - Compactos */}
                {!uploadingImage && imagePreview && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">
                          Ancho
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={imageWidth}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 100;
                              setImageWidth(Math.max(100, Math.min(2000, val)));
                            }}
                            className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center focus:ring-1 focus:ring-primary"
                            min="100"
                            max="2000"
                          />
                          <span className="text-xs text-gray-500">px</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="2000"
                        value={imageWidth}
                        onChange={(e) => setImageWidth(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>100</span>
                        <span>2000</span>
                      </div>
                    </div>

                    {/* Botones de acción rápida - Compactos */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => setImageWidth(300)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${imageWidth === 300
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                      >
                        Pequeña
                      </button>
                      <button
                        onClick={() => setImageWidth(600)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${imageWidth === 600
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                      >
                        Mediana
                      </button>
                      <button
                        onClick={() => setImageWidth(1000)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${imageWidth === 1000
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                      >
                        Grande
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
                {!uploadingImage && (
                  <>
                    <button
                      onClick={() => {
                        setShowImageModal(false);
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleInsertImage}
                      disabled={!imagePreview}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Insertar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Botón */}
        {showButtonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200/50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-gray-900">Insertar botón</h3>
                </div>
                <button
                  onClick={() => {
                    setShowButtonModal(false);
                    setButtonConfig({
                      text: "",
                      url: "",
                      color: "#00b2de",
                      textColor: "#ffffff",
                    });
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview del botón */}
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center border border-gray-200 min-h-[80px]">
                  <a
                    href={buttonConfig.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "12px 30px",
                      backgroundColor: buttonConfig.color,
                      color: buttonConfig.textColor,
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "16px",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {buttonConfig.text || "Texto del botón"}
                  </a>
                </div>

                {/* Campos de configuración */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Texto del botón
                    </label>
                    <input
                      type="text"
                      value={buttonConfig.text}
                      onChange={(e) =>
                        setButtonConfig({ ...buttonConfig, text: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Ej: Ver más"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      URL del enlace
                    </label>
                    <input
                      type="url"
                      value={buttonConfig.url}
                      onChange={(e) =>
                        setButtonConfig({ ...buttonConfig, url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://ejemplo.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Color de fondo
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setColorPickerOpen(colorPickerOpen === 'bg' ? null : 'bg')}
                          className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors flex items-center justify-center shadow-sm relative overflow-hidden"
                          style={{ backgroundColor: buttonConfig.color }}
                        >
                          <div className="w-full h-full" style={{ backgroundColor: buttonConfig.color }} />
                        </button>
                        <input
                          type="text"
                          value={buttonConfig.color}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              setButtonConfig({ ...buttonConfig, color: value });
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="#00b2de"
                        />
                      </div>

                      {colorPickerOpen === 'bg' && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setColorPickerOpen(null)}
                          />
                          <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80">
                            <div className="space-y-4">
                              {/* Paleta de colores predefinidos */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Colores predefinidos
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                  {[
                                    "#00b2de", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
                                    "#6366f1", "#84cc16", "#f97316", "#dc2626", "#9333ea", "#e11d48", "#06b6d4", "#22c55e",
                                    "#2563eb", "#eab308", "#ea580c", "#991b1b", "#7e22ce", "#be185d", "#0891b2", "#16a34a",
                                    "#1d4ed8", "#ca8a04", "#c2410c", "#7f1d1d", "#6b21a8", "#9f1239", "#0e7490", "#15803d",
                                  ].map((color, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setButtonConfig({ ...buttonConfig, color });
                                        setColorPickerOpen(null);
                                      }}
                                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:scale-110 transition-all cursor-pointer"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Selector de color personalizado */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Color personalizado
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={buttonConfig.color}
                                    onChange={(e) =>
                                      setButtonConfig({ ...buttonConfig, color: e.target.value })
                                    }
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={buttonConfig.color}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                          setButtonConfig({ ...buttonConfig, color: value });
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                                      placeholder="#00b2de"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Colores rápidos con texto */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Combinaciones rápidas
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { color: "#00b2de", text: "#ffffff", name: "Primary" },
                                    { color: "#10b981", text: "#ffffff", name: "Verde" },
                                    { color: "#3b82f6", text: "#ffffff", name: "Azul" },
                                    { color: "#f59e0b", text: "#ffffff", name: "Naranja" },
                                    { color: "#ef4444", text: "#ffffff", name: "Rojo" },
                                    { color: "#8b5cf6", text: "#ffffff", name: "Morado" },
                                  ].map((preset, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setButtonConfig({
                                          ...buttonConfig,
                                          color: preset.color,
                                          textColor: preset.text,
                                        });
                                        setColorPickerOpen(null);
                                      }}
                                      className="flex items-center gap-2 p-2 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                                    >
                                      <div
                                        className="w-6 h-6 rounded border border-gray-300"
                                        style={{ backgroundColor: preset.color }}
                                      />
                                      <span className="text-xs font-medium text-gray-700">{preset.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Color del texto
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}
                          className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors flex items-center justify-center shadow-sm relative overflow-hidden"
                          style={{ backgroundColor: buttonConfig.textColor }}
                        >
                          <div className="w-full h-full" style={{ backgroundColor: buttonConfig.textColor }} />
                        </button>
                        <input
                          type="text"
                          value={buttonConfig.textColor}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                              setButtonConfig({ ...buttonConfig, textColor: value });
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="#ffffff"
                        />
                      </div>

                      {colorPickerOpen === 'text' && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setColorPickerOpen(null)}
                          />
                          <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 right-0">
                            <div className="space-y-4">
                              {/* Paleta de colores predefinidos */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Colores predefinidos
                                </label>
                                <div className="grid grid-cols-8 gap-2">
                                  {[
                                    "#ffffff", "#000000", "#6b7280", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
                                    "#f3f4f6", "#1f2937", "#9ca3af", "#dc2626", "#2563eb", "#059669", "#d97706", "#7c3aed",
                                    "#e5e7eb", "#111827", "#b91c1c", "#1e40af", "#047857", "#b45309", "#6d28d9",
                                    "#d1d5db", "#030712", "#4b5563", "#991b1b", "#1e3a8a", "#065f46", "#92400e", "#5b21b6",
                                  ].map((color, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setButtonConfig({ ...buttonConfig, textColor: color });
                                        setColorPickerOpen(null);
                                      }}
                                      className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:scale-110 transition-all cursor-pointer"
                                      style={{ backgroundColor: color }}
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Selector de color personalizado */}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                  Color personalizado
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={buttonConfig.textColor}
                                    onChange={(e) =>
                                      setButtonConfig({ ...buttonConfig, textColor: e.target.value })
                                    }
                                    className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                                  />
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={buttonConfig.textColor}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                                          setButtonConfig({ ...buttonConfig, textColor: value });
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary focus:border-primary"
                                      placeholder="#ffffff"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowButtonModal(false);
                    setButtonConfig({
                      text: "",
                      url: "",
                      color: "#00b2de",
                      textColor: "#ffffff",
                    });
                  }}
                  className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInsertButton}
                  disabled={!buttonConfig.text || !buttonConfig.url}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insertar</span>
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


