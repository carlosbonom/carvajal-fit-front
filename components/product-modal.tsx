"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Package, DollarSign, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
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
  });

  useEffect(() => {
    if (isOpen) {
      loadCreator();
      
      if (product) {
        // Cargar datos del producto para editar
        const clpPrice = product.prices.find(p => p.currency === "CLP");
        const usdPrice = product.prices.find(p => p.currency === "USD");
        
        setFormData({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          productType: product.productType,
          priceCLP: clpPrice ? clpPrice.amount.toString() : "",
          priceUSD: usdPrice ? usdPrice.amount.toString() : "",
          isActive: product.isActive,
          thumbnailUrl: product.thumbnailUrl || "",
          bannerUrl: product.bannerUrl || "",
          fileUrl: product.fileUrl || "",
          productImages: product.metadata?.productImages || [],
        });
        
        setPreviews({
          thumbnail: product.thumbnailUrl || "",
          banner: product.bannerUrl || "",
          productImages: product.metadata?.productImages || [],
        });
        
        if (product.metadata?.productImages) {
          setPreviews(prev => ({
            ...prev,
            productImages: product.metadata.productImages,
          }));
        }
        
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
          thumbnailUrl: "",
          bannerUrl: "",
          fileUrl: "",
          productImages: [],
        });
        setFiles({ thumbnailFile: null, bannerFile: null, productFile: null, productImageFiles: [] });
        setPreviews({ thumbnail: "", banner: "", productImages: [] });
        setError(null);
      }
    }
  }, [isOpen, product, creatorSlug]);

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
      }
      return;
    }

    // Validar tipo de archivo según el campo
    if (field === "productFile") {
      const productType = formData.productType;
      if (isFileProduct(productType)) {
        // Para productos de archivo, validar que no sea imagen
        if (file.type.startsWith("image/")) {
          setError("Este tipo de producto requiere un archivo (PDF, video, etc.), no una imagen. Usa el campo 'Fotos del Producto' para imágenes.");
          return;
        }
      } else if (isImageProduct(productType)) {
        // Para productos de imagen, validar que sea imagen
        if (!file.type.startsWith("image/")) {
          setError("Este tipo de producto requiere imágenes. Usa el campo 'Fotos del Producto' para subir imágenes.");
          return;
        }
      }
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

    // Subir archivo automáticamente
    try {
      const uploadKey = field === "thumbnailFile" ? "thumbnail" : field === "bannerFile" ? "banner" : "product";
      console.log("Starting upload", { field, uploadKey, fileName: file.name, fileType: file.type });
      
      setUploading(prev => ({ ...prev, [uploadKey]: true }));
      setError(null);
      
      let folder = "imagenes";
      if (field === "productFile") {
        folder = getFileFolder(formData.productType);
        console.log("Product file folder:", folder, "Product type:", formData.productType);
      }

      console.log("Calling uploadFile with:", { folder, isPublic: true });
      const uploadResponse = await uploadFile(file, {
        folder,
        isPublic: true,
      });
      
      console.log("Upload response:", uploadResponse);

      // Actualizar la URL correspondiente
      if (field === "thumbnailFile") {
        setFormData(prev => ({ ...prev, thumbnailUrl: uploadResponse.url }));
      } else if (field === "bannerFile") {
        setFormData(prev => ({ ...prev, bannerUrl: uploadResponse.url }));
      } else if (field === "productFile") {
        setFormData(prev => ({ ...prev, fileUrl: uploadResponse.url }));
      }

      // Guardar el archivo en el estado (aunque ya esté subido, puede ser útil para referencia)
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
      setUploading(prev => ({ ...prev, [field === "thumbnailFile" ? "thumbnail" : field === "bannerFile" ? "banner" : "product"]: false }));
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

    if (!formData.priceCLP || parseFloat(formData.priceCLP) <= 0) {
      setError("Debes ingresar un precio CLP válido (mayor a 0)");
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      if (product) {
        // Actualizar producto
        const updateData: UpdateProductDto = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          productType: formData.productType,
          prices,
          isActive: formData.isActive,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          bannerUrl: formData.bannerUrl || undefined,
          fileUrl: formData.fileUrl || undefined,
          metadata,
        };
        
        await updateProduct(product.id, updateData);
      } else {
        // Crear producto
        const createData: CreateProductDto = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          productType: formData.productType,
          ...(selectedCreator.id ? { creatorId: selectedCreator.id } : { creatorSlug: selectedCreator.slug }),
          prices,
          isActive: formData.isActive,
          thumbnailUrl: formData.thumbnailUrl || undefined,
          bannerUrl: formData.bannerUrl || undefined,
          fileUrl: formData.fileUrl || undefined,
          metadata,
        };
        
        await createProduct(createData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error al guardar producto:", error);
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
                Descripción
              </label>
              <textarea
                value={formData.description}
                placeholder="Describe tu producto de manera atractiva..."
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">Opcional: Una buena descripción ayuda a vender más</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Producto <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.productType}
                  onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value as ProductType }))}
                  disabled={loading}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="pdf">PDF</option>
                  <option value="digital_file">Archivo Digital</option>
                  <option value="video">Video</option>
                  <option value="ebook">Ebook</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="template">Template</option>
                  <option value="other">Otro</option>
                </select>
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
                  Precio USD
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="9.99"
                    value={formData.priceUSD}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceUSD: e.target.value }))}
                    disabled={loading}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Opcional: Precio en dólares</p>
              </div>
            </div>
          </div>

          {/* Archivos */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">Archivos</h3>
              <span className="text-sm text-gray-500 font-normal">(Opcional)</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Sube las imágenes y archivos de tu producto. Se subirán automáticamente al seleccionarlos.</p>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isFileProduct(formData.productType) ? "Archivo del Producto" : "Archivo Principal"}
                <span className="text-gray-400 font-normal"> (Opcional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {isFileProduct(formData.productType) 
                  ? "Sube el archivo descargable (PDF, video, etc.)" 
                  : "Sube un archivo principal si es necesario"}
              </p>
              <div className="space-y-2">
                <label 
                  htmlFor="product-file-input"
                  className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading.product ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {uploading.product ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Subiendo archivo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">
                        {files.productFile ? files.productFile.name : isFileProduct(formData.productType) ? "Subir archivo del producto" : "Subir archivo"}
                      </span>
                    </>
                  )}
                </label>
                <input
                  id="product-file-input"
                  type="file"
                  className="hidden"
                  disabled={uploading.product}
                  accept={isFileProduct(formData.productType) ? undefined : "image/*"}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      handleFileChange("productFile", file);
                    }
                    // Resetear el input para permitir subir el mismo archivo de nuevo
                    e.target.value = "";
                  }}
                />
                {formData.fileUrl && !uploading.product && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Archivo subido correctamente: {formData.fileUrl.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            {/* Fotos del Producto */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos del Producto <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Sube múltiples imágenes para mostrar tu producto. Puedes seleccionar varias a la vez.
              </p>
              <label className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Subir fotos del producto</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleProductImagesChange}
                />
              </label>
              
              {previews.productImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.productImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Producto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {formData.productImages.length > 0 && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {formData.productImages.length} {formData.productImages.length === 1 ? "imagen subida" : "imágenes subidas"} correctamente
                </p>
              )}
            </div>
          </div>

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


