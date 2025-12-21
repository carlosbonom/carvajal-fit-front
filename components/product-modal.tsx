"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Package, DollarSign, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, File as FileIcon, Video, Music } from "lucide-react";
import { Switch } from "@heroui/switch";
import {
  createProduct,
  updateProduct,
  getProductsByCreator,
  type Product,
  type ProductType,
  type CreateProductDto,
  type UpdateProductDto,
  type Creator
} from "@/services/products";
import { uploadFile } from "@/services/files";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  creatorSlug: "jose" | "gabriel";
}

export function ProductModal({ isOpen, onClose, onSuccess, product, creatorSlug }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState({
    thumbnail: false,
    banner: false,
    product: false,
  });
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    productType: "pdf" as ProductType,
    priceCLP: "",
    priceUSD: "",
    isActive: true,
    isPhysicalProduct: false,
    thumbnailUrl: "",
    bannerUrl: "",
    fileUrl: "",
    productImages: [] as string[], // URLs de imágenes del producto
  });

  const [files, setFiles] = useState({
    thumbnailFile: null as File | null,
    bannerFile: null as File | null,
    productFile: null as File | null,
    productImageFiles: [] as File[], // Múltiples imágenes del producto
  });

  const [previews, setPreviews] = useState({
    thumbnail: "",
    banner: "",
    productImages: [] as string[], // Previews de imágenes del producto
    productFile: null as string | null, // Preview del archivo del producto
  });

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const productFilePreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCreator();

      if (product) {
        // Cargar datos del producto para editar
        const clpPrice = product.prices.find(p => p.currency === "CLP");
        const usdPrice = product.prices.find(p => p.currency === "USD");

        // Determinar si es producto físico basado en el tipo
        const isPhysical = product.productType === "merchandise";

        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          productType: product.productType,
          priceCLP: clpPrice ? clpPrice.amount.toString() : "",
          priceUSD: usdPrice ? usdPrice.amount.toString() : "",
          isActive: product.isActive,
          isPhysicalProduct: isPhysical,
          thumbnailUrl: product.thumbnailUrl || "",
          bannerUrl: product.bannerUrl || "",
          fileUrl: product.fileUrl || "",
          productImages: product.metadata?.productImages || [],
        });

        setPreviews({
          thumbnail: product.thumbnailUrl || "",
          banner: product.bannerUrl || "",
          productImages: product.metadata?.productImages || [],
          productFile: null,
        });

        // Usar el creator del producto si existe
        if (product.creator) {
          setSelectedCreator(product.creator);
        }
      } else {
        // Resetear formulario para nuevo producto
        setFormData({
          name: "",
          slug: "",
          description: "",
          productType: "pdf",
          priceCLP: "",
          priceUSD: "",
          isActive: true,
          isPhysicalProduct: false,
          thumbnailUrl: "",
          bannerUrl: "",
          fileUrl: "",
          productImages: [],
        });
        setFiles({ thumbnailFile: null, bannerFile: null, productFile: null, productImageFiles: [] });
        setPreviews({ thumbnail: "", banner: "", productImages: [], productFile: null });
        if (productFilePreviewUrlRef.current) {
          URL.revokeObjectURL(productFilePreviewUrlRef.current);
          productFilePreviewUrlRef.current = null;
        }
        if (productFileInputRef.current) {
          productFileInputRef.current.value = "";
        }
        setError(null);
      }
    }
  }, [isOpen, product, creatorSlug]);

  // Limpiar URLs blob cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (productFilePreviewUrlRef.current) {
        URL.revokeObjectURL(productFilePreviewUrlRef.current);
      }
    };
  }, []);

  const loadCreator = async () => {
    try {
      // Obtener productos del creator para obtener su información
      const products = await getProductsByCreator(creatorSlug);
      if (products.length > 0 && products[0].creator) {
        setSelectedCreator(products[0].creator);
      } else {
        // Si no hay productos, crear un creator temporal (esto requerirá que el backend acepte slug)
        const tempCreator: Creator = {
          id: "", // El backend deberá buscar por slug si el ID está vacío
          name: creatorSlug === "jose" ? "José Carvajal" : "Gabriel Carvajal",
          slug: creatorSlug,
          bio: undefined,
          avatarUrl: undefined,
        };
        setSelectedCreator(tempCreator);
      }
    } catch (error) {
      console.error("Error al cargar creator:", error);
      // En caso de error, usar creator temporal
      const tempCreator: Creator = {
        id: "",
        name: creatorSlug === "jose" ? "José Carvajal" : "Gabriel Carvajal",
        slug: creatorSlug,
        bio: undefined,
        avatarUrl: undefined,
      };
      setSelectedCreator(tempCreator);
    }
  };

  // Determinar si un tipo de producto requiere archivo o imágenes
  const isImageProduct = (productType: ProductType): boolean => {
    return productType === "merchandise" || productType === "template" || productType === "other";
  };

  const isFileProduct = (productType: ProductType): boolean => {
    return productType === "pdf" || productType === "ebook" || productType === "digital_file" || productType === "video";
  };

  const getFileFolder = (productType: ProductType): string => {
    if (productType === "video") {
      return "videos";
    } else if (productType === "pdf" || productType === "ebook" || productType === "digital_file") {
      return "documentos";
    }
    return "documentos";
  };

  // Detectar tipo de producto según el archivo
  const detectProductTypeFromFile = (file: File): ProductType => {
    const fileType = file.type;

    if (fileType.startsWith("image/")) {
      return "merchandise"; // Por defecto merchandise para imágenes
    } else if (fileType === "application/pdf") {
      return "pdf";
    } else if (fileType.startsWith("video/")) {
      return "video";
    } else if (fileType.includes("epub") || fileType.includes("mobi")) {
      return "ebook";
    } else {
      return "digital_file";
    }
  };

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = (file: File | null) => {
    if (!file) return FileIcon;
    const fileType = file.type;
    if (fileType.startsWith("video/")) return Video;
    if (fileType.startsWith("image/")) return ImageIcon;
    if (fileType.startsWith("audio/")) return Music;
    if (fileType === "application/pdf" || fileType.includes("document") || fileType.includes("word") || fileType.includes("text")) return FileText;
    return FileIcon;
  };

  const handleFileChange = async (field: "thumbnailFile" | "bannerFile" | "productFile", file: File | null) => {
    console.log("handleFileChange called", { field, file: file?.name, fileType: file?.type });

    if (!file) {
      setFiles(prev => ({ ...prev, [field]: null }));
      if (field === "thumbnailFile") {
        setPreviews(prev => ({ ...prev, thumbnail: "" }));
        setFormData(prev => ({ ...prev, thumbnailUrl: "" }));
      } else if (field === "bannerFile") {
        setPreviews(prev => ({ ...prev, banner: "" }));
        setFormData(prev => ({ ...prev, bannerUrl: "" }));
      } else if (field === "productFile") {
        setFormData(prev => ({ ...prev, fileUrl: "" }));
        setPreviews(prev => ({ ...prev, productFile: null }));
        if (productFilePreviewUrlRef.current) {
          URL.revokeObjectURL(productFilePreviewUrlRef.current);
          productFilePreviewUrlRef.current = null;
        }
      }
      return;
    }

    // Si es producto físico, no validar tipo de archivo
    // Si no es físico, detectar tipo según archivo
    if (field === "productFile" && !formData.isPhysicalProduct) {
      // Detectar tipo de producto según el archivo
      const detectedType = detectProductTypeFromFile(file);
      setFormData(prev => ({ ...prev, productType: detectedType }));
    }

    // Validar tamaño máximo (2GB) para todos los archivos
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setError("El archivo no puede ser mayor a 2GB");
      return;
    }

    // Si es producto físico, guardar archivo pero no subir automáticamente
    if (field === "productFile" && formData.isPhysicalProduct) {
      // Limpiar preview anterior si existe
      if (productFilePreviewUrlRef.current) {
        URL.revokeObjectURL(productFilePreviewUrlRef.current);
        productFilePreviewUrlRef.current = null;
      }

      setFiles(prev => ({ ...prev, [field]: file }));
      setError(null);

      // Crear preview usando createObjectURL para archivos grandes (más eficiente)
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const objectUrl = URL.createObjectURL(file);
        productFilePreviewUrlRef.current = objectUrl;
        setPreviews(prev => ({ ...prev, productFile: objectUrl }));
      } else {
        setPreviews(prev => ({ ...prev, productFile: null }));
      }
      return; // No subir automáticamente para productos físicos
    }

    // Si no es producto físico, subir automáticamente
    if (field === "productFile" && !formData.isPhysicalProduct) {
      // Limpiar preview anterior si existe
      if (productFilePreviewUrlRef.current) {
        URL.revokeObjectURL(productFilePreviewUrlRef.current);
        productFilePreviewUrlRef.current = null;
      }

      // Crear preview usando createObjectURL
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const objectUrl = URL.createObjectURL(file);
        productFilePreviewUrlRef.current = objectUrl;
        setPreviews(prev => ({ ...prev, productFile: objectUrl }));
      } else {
        setPreviews(prev => ({ ...prev, productFile: null }));
      }

      // Subir archivo automáticamente
      try {
        setUploading(prev => ({ ...prev, product: true }));
        setError(null);

        // Determinar la carpeta según el tipo de archivo
        let folder = "documentos";
        if (file.type.startsWith("image/")) {
          folder = "imagenes";
        } else if (file.type.startsWith("video/")) {
          folder = "videos";
        } else if (file.type.startsWith("audio/")) {
          folder = "audio";
        } else if (file.type === "application/pdf" || file.type.includes("document") || file.type.includes("word") || file.type.includes("text")) {
          folder = "documentos";
        }

        const uploadResponse = await uploadFile(file, {
          folder,
          isPublic: true,
        });

        setFormData(prev => ({ ...prev, fileUrl: uploadResponse.url }));
        setFiles(prev => ({ ...prev, [field]: file }));
      } catch (error: any) {
        console.error(`Error al subir ${field}:`, error);
        setError(`Error al subir el archivo: ${error.message || "Error desconocido"}`);
        setPreviews(prev => ({ ...prev, productFile: null }));
        if (productFilePreviewUrlRef.current) {
          URL.revokeObjectURL(productFilePreviewUrlRef.current);
          productFilePreviewUrlRef.current = null;
        }
      } finally {
        setUploading(prev => ({ ...prev, product: false }));
      }
      return;
    }

    // Mostrar preview para imágenes
    if (field === "thumbnailFile" || field === "bannerFile") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [field === "thumbnailFile" ? "thumbnail" : "banner"]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }

    // Subir archivo automáticamente (solo para thumbnail y banner)
    if (field === "thumbnailFile" || field === "bannerFile") {
      try {
        const uploadKey = field === "thumbnailFile" ? "thumbnail" : "banner";
        console.log("Starting upload", { field, uploadKey, fileName: file.name, fileType: file.type });

        setUploading(prev => ({ ...prev, [uploadKey]: true }));
        setError(null);

        const uploadResponse = await uploadFile(file, {
          folder: "imagenes",
          isPublic: true,
        });

        console.log("Upload response:", uploadResponse);

        // Actualizar la URL correspondiente
        if (field === "thumbnailFile") {
          setFormData(prev => ({ ...prev, thumbnailUrl: uploadResponse.url }));
        } else if (field === "bannerFile") {
          setFormData(prev => ({ ...prev, bannerUrl: uploadResponse.url }));
        }

        // Guardar el archivo en el estado
        setFiles(prev => ({ ...prev, [field]: file }));
      } catch (error: any) {
        console.error(`Error al subir ${field}:`, error);
        setError(`Error al subir el archivo: ${error.message || "Error desconocido"}`);
        // Limpiar preview si falla
        if (field === "thumbnailFile") {
          setPreviews(prev => ({ ...prev, thumbnail: "" }));
        } else if (field === "bannerFile") {
          setPreviews(prev => ({ ...prev, banner: "" }));
        }
      } finally {
        setUploading(prev => ({ ...prev, [field === "thumbnailFile" ? "thumbnail" : "banner"]: false }));
      }
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileChange("productFile", file);
    }
  };

  const handleProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validar que todos sean imágenes
    const invalidFiles = selectedFiles.filter(file => !file.type.startsWith("image/"));
    if (invalidFiles.length > 0) {
      setError("Todos los archivos deben ser imágenes");
      return;
    }

    setError(null);
    const newPreviews: string[] = [];
    const newFiles: File[] = [];
    const newUrls: string[] = [];

    // Crear previews
    for (const file of selectedFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === selectedFiles.length) {
          setPreviews(prev => ({ ...prev, productImages: [...prev.productImages, ...newPreviews] }));
        }
      };
      reader.readAsDataURL(file);
    }

    // Subir archivos
    try {
      for (const file of selectedFiles) {
        const uploadResponse = await uploadFile(file, {
          folder: "imagenes",
          isPublic: true,
        });
        newUrls.push(uploadResponse.url);
        newFiles.push(file);
      }

      setFormData(prev => ({
        ...prev,
        productImages: [...prev.productImages, ...newUrls],
      }));
      setFiles(prev => ({
        ...prev,
        productImageFiles: [...prev.productImageFiles, ...newFiles],
      }));
    } catch (error: any) {
      console.error("Error al subir imágenes del producto:", error);
      setError(`Error al subir las imágenes: ${error.message || "Error desconocido"}`);
    }
  };

  const removeProductImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
    setFiles(prev => ({
      ...prev,
      productImageFiles: prev.productImageFiles.filter((_, i) => i !== index),
    }));
    setPreviews(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    const newSlug = name ? generateSlug(name) : "";
    setFormData(prev => ({
      ...prev,
      name,
      slug: newSlug, // Siempre generar slug automáticamente desde el nombre
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ProductModal] Submit triggered. Current state:", {
      loading,
      uploading,
      formData,
      files,
      creator: selectedCreator
    });

    setError(null);

    if (!selectedCreator) {
      setError("Error: No se pudo cargar la información del creator. Por favor, recarga la página.");
      return;
    }

    if (!selectedCreator.id && !selectedCreator.slug) {
      setError("Error: El creator no tiene un ID o slug válido. Por favor, verifica que existan productos del creator.");
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      setError("El nombre del producto es requerido");
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      setError("Error: No se pudo generar el slug. Por favor, verifica el nombre del producto.");
      return;
    }

    if (!formData.description || !formData.description.trim()) {
      setError("La descripción del producto es requerida");
      return;
    }

    if (!formData.priceCLP || parseFloat(formData.priceCLP) <= 0) {
      setError("Debes ingresar un precio CLP válido (mayor a 0)");
      return;
    }

    if (!formData.priceUSD || parseFloat(formData.priceUSD) <= 0) {
      setError("Debes ingresar un precio USD válido (mayor a 0)");
      return;
    }

    if (!formData.thumbnailUrl || !formData.thumbnailUrl.trim()) {
      setError("Debes subir una foto del producto");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Determinar el tipo de producto
      let finalProductType: ProductType = formData.productType;
      if (formData.isPhysicalProduct) {
        finalProductType = "merchandise"; // o "producto" si existe ese tipo
      } else if (files.productFile) {
        // Si hay archivo, usar el tipo detectado
        finalProductType = formData.productType;
      }

      // Subir archivo del producto si hay archivo seleccionado
      let productFileUrl = formData.fileUrl;

      // SOLO subir si hay un archivo NUEVO seleccionado Y (es físico O no tenemos URL previa)
      // La lógica anterior subía el archivo de nuevo incluso si ya se subió en el handleFileChange
      if (files.productFile) {
        // Verificar si este archivo especifico ya fue subido exitosamente en handleFileChange
        // Si ya tenemos un fileUrl y NO es un producto físico (que no se sube auto), asumimos que es el del handleFileChange
        const needsUpload = formData.isPhysicalProduct || !formData.fileUrl;

        console.log("[ProductModal] File upload check:", {
          hasFile: !!files.productFile,
          isPhysical: formData.isPhysicalProduct,
          currentFileUrl: formData.fileUrl,
          needsUpload
        });

        if (needsUpload) {
          try {
            console.log("[ProductModal] Starting final file upload...");
            // Determinar la carpeta según el tipo de archivo
            let folder = "documentos";
            if (files.productFile.type.startsWith("image/")) {
              folder = "imagenes";
            } else if (files.productFile.type.startsWith("video/")) {
              folder = "videos";
            } else if (files.productFile.type.startsWith("audio/")) {
              folder = "audio";
            }

            const uploadResponse = await uploadFile(files.productFile, {
              folder,
              isPublic: true,
            });
            productFileUrl = uploadResponse.url;
            console.log("[ProductModal] Final upload complete:", productFileUrl);
          } catch (error: any) {
            console.error("[ProductModal] Final upload failed:", error);
            throw new Error("Error al subir el archivo del producto: " + error.message);
          }
        } else {
          console.log("[ProductModal] Skipping final upload - file already has URL or not needed");
        }
      }

      const prices = [];
      if (formData.priceCLP && parseFloat(formData.priceCLP) > 0) {
        prices.push({ currency: "CLP", amount: parseFloat(formData.priceCLP) });
      }
      if (formData.priceUSD && parseFloat(formData.priceUSD) > 0) {
        prices.push({ currency: "USD", amount: parseFloat(formData.priceUSD) });
      }

      const metadata = formData.productImages.length > 0
        ? { productImages: formData.productImages }
        : undefined;

      const payloadCommon = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        productType: finalProductType,
        prices,
        isActive: formData.isActive,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
        fileUrl: productFileUrl || undefined,
        metadata,
      };

      console.log("[ProductModal] Submitting payload:", payloadCommon);

      if (product) {
        console.log("[ProductModal] Updating existing product:", product.id);
        // Actualizar producto
        const updateData: UpdateProductDto = { ...payloadCommon };

        await updateProduct(product.id, updateData);
      } else {
        console.log("[ProductModal] Creating new product");
        // Crear producto
        const createData: CreateProductDto = {
          ...payloadCommon,
          ...(selectedCreator.id ? { creatorId: selectedCreator.id } : { creatorSlug: selectedCreator.slug }),
        };

        await createProduct(createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("[ProductModal] Error al guardar producto:", error);
      setError(error.response?.data?.message || error.message || "Error al guardar el producto. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Editar Producto" : "Nuevo Producto"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mensaje de error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Plan de Entrenamiento Avanzado"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {formData.slug && (
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <span>URL generada:</span>
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{formData.slug}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                placeholder="Describe tu producto de manera atractiva..."
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">Una buena descripción ayuda a vender más</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto Físico
                </label>
                <div className="flex items-center gap-3">
                  <Switch
                    isSelected={formData.isPhysicalProduct}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        isPhysicalProduct: value,
                        productType: value ? "merchandise" : prev.productType
                      }));
                    }}
                    isDisabled={loading}
                    size="md"
                    color="primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formData.isPhysicalProduct ? "Sí" : "No"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formData.isPhysicalProduct ? "Requiere envío físico" : "Producto digital"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <div className="flex items-center gap-3">
                  <Switch
                    isSelected={formData.isActive}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                    isDisabled={loading}
                    size="md"
                    color="primary"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formData.isActive ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formData.isActive ? "Visible en la tienda" : "Oculto"}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Precios */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Precios</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio CLP <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="9900"
                    value={formData.priceCLP}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceCLP: e.target.value }))}
                    disabled={loading}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Precio en pesos chilenos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio USD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="9.99"
                    value={formData.priceUSD}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceUSD: e.target.value }))}
                    disabled={loading}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Precio en dólares</p>
              </div>
            </div>
          </div>

          {/* Foto del Producto */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Foto del Producto</h3>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto del Producto <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Sube la imagen principal del producto
              </p>
              <div className="space-y-2">
                <label
                  htmlFor="thumbnail-file-input"
                  className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading.thumbnail ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {uploading.thumbnail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Subiendo imagen...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">
                        {files.thumbnailFile ? files.thumbnailFile.name : "Subir foto del producto"}
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="thumbnail-file-input"
                  type="file"
                  accept="image/*"
                  required
                  className="hidden"
                  disabled={uploading.thumbnail}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      handleFileChange("thumbnailFile", file);
                    }
                    e.target.value = "";
                  }}
                />
                {formData.thumbnailUrl && !uploading.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Foto subida correctamente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Archivo del Producto */}
          {!formData.isPhysicalProduct && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Archivo del Producto</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {formData.isPhysicalProduct
                  ? "Sube el archivo del producto físico."
                  : "Sube el archivo del producto (imagen, video, PDF, etc.)."}
              </p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo del Producto
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}`}>
                  {previews.productFile ? (
                    <div className="relative w-full h-full">
                      {files.productFile?.type.startsWith("image/") ? (
                        <img
                          src={previews.productFile}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : files.productFile?.type.startsWith("video/") ? (
                        <video
                          src={previews.productFile}
                          className="w-full h-full object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          {(() => {
                            const Icon = getFileIcon(files.productFile);
                            return <Icon className="w-12 h-12 text-gray-400 mb-2" />;
                          })()}
                          <p className="text-sm text-gray-600 font-medium">{files.productFile?.name}</p>
                          <p className="text-xs text-gray-500">
                            {(files.productFile ? files.productFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (loading) return;
                          // Limpiar URL blob
                          if (productFilePreviewUrlRef.current) {
                            URL.revokeObjectURL(productFilePreviewUrlRef.current);
                            productFilePreviewUrlRef.current = null;
                          }
                          setFiles(prev => ({ ...prev, productFile: null }));
                          setPreviews(prev => ({ ...prev, productFile: null }));
                          setFormData(prev => ({ ...prev, fileUrl: "" }));
                          if (productFileInputRef.current) {
                            productFileInputRef.current.value = "";
                          }
                        }}
                        disabled={loading}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">
                        Video, Imagen, PDF, Documento, Audio (máx. 2GB)
                      </p>
                    </div>
                  )}
                  <input
                    ref={productFileInputRef}
                    type="file"
                    className="hidden"
                    accept="video/*,image/*,application/pdf,.doc,.docx,audio/*"
                    onChange={handleProductFileChange}
                    disabled={loading || uploading.product}
                  />
                </label>
                {files.productFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <span className="font-medium">Archivo seleccionado:</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      {files.productFile.name} ({(files.productFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    {!formData.isPhysicalProduct && formData.fileUrl && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Subido correctamente
                      </span>
                    )}
                  </div>
                )}
                {uploading.product && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo archivo...</span>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Botones */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading.thumbnail || uploading.banner || uploading.product}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {product ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>
                  {product ? "Actualizar Producto" : "Crear Producto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


