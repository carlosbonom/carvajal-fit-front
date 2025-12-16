import { apiAxios } from "@/lib/axios-config";
import { uploadFile } from "./files";

export type ProductType = "pdf" | "digital_file" | "video" | "ebook" | "template" | "other" | "merchandise";

export interface ProductPrice {
  id: string;
  currency: string;
  amount: number;
  isActive: boolean;
}

export interface Creator {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productType: ProductType;
  fileUrl?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  creator: Creator;
  prices: ProductPrice[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  productType: ProductType;
  creatorId?: string;
  creatorSlug?: string;
  categoryId?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  thumbnailFile?: File;
  bannerFile?: File;
  productFile?: File;
  prices: {
    currency: string;
    amount: number;
  }[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string;
  productType?: ProductType;
  categoryId?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  thumbnailFile?: File;
  bannerFile?: File;
  productFile?: File;
  prices?: {
    currency: string;
    amount: number;
  }[];
  metadata?: Record<string, any>;
  isActive?: boolean;
}

// GET /products?creatorSlug=jose - Obtener productos por creator
export const getProductsByCreator = async (creatorSlug: string): Promise<Product[]> => {
  const response = await apiAxios.get<Product[]>(`/products`, {
    params: { creatorSlug },
  });
  return response.data;
};

// GET /products/:id - Obtener un producto por ID
export const getProductById = async (productId: string): Promise<Product> => {
  const response = await apiAxios.get<Product>(`/products/${productId}`);
  return response.data;
};

// GET /products/:slug - Obtener un producto por slug
export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await apiAxios.get<Product>(`/products/slug/${slug}`);
  return response.data;
};

// POST /products - Crear producto
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  let thumbnailUrl = data.thumbnailUrl;
  let bannerUrl = data.bannerUrl;
  let fileUrl = data.fileUrl;

  // Subir archivos primero si existen
  if (data.thumbnailFile) {
    try {
      const uploadResponse = await uploadFile(data.thumbnailFile, {
        folder: "imagenes",
        isPublic: true,
      });
      thumbnailUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la miniatura: " + (error as Error).message);
    }
  }

  if (data.bannerFile) {
    try {
      const uploadResponse = await uploadFile(data.bannerFile, {
        folder: "imagenes",
        isPublic: true,
      });
      bannerUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el banner: " + (error as Error).message);
    }
  }

  if (data.productFile) {
    try {
      const folder = data.productType === "pdf" ? "documentos" : 
                     data.productType === "video" ? "videos" : 
                     "documentos";
      const uploadResponse = await uploadFile(data.productFile, {
        folder,
        isPublic: true,
      });
      fileUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el archivo del producto: " + (error as Error).message);
    }
  }

  // Crear el producto con las URLs obtenidas
  const productData: Omit<CreateProductDto, "thumbnailFile" | "bannerFile" | "productFile"> = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    productType: data.productType,
    creatorId: data.creatorId,
    categoryId: data.categoryId,
    fileUrl: fileUrl && fileUrl.trim() !== "" ? fileUrl : undefined,
    thumbnailUrl: thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl : undefined,
    bannerUrl: bannerUrl && bannerUrl.trim() !== "" ? bannerUrl : undefined,
    prices: data.prices,
    metadata: data.metadata,
    isActive: data.isActive ?? true,
  };

  const response = await apiAxios.post<Product>("/products", productData);
  return response.data;
};

// PATCH /products/:id - Actualizar producto
export const updateProduct = async (
  productId: string,
  data: UpdateProductDto
): Promise<Product> => {
  let thumbnailUrl = data.thumbnailUrl;
  let bannerUrl = data.bannerUrl;
  let fileUrl = data.fileUrl;

  // Subir archivos primero si existen
  if (data.thumbnailFile) {
    try {
      const uploadResponse = await uploadFile(data.thumbnailFile, {
        folder: "imagenes",
        isPublic: true,
      });
      thumbnailUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir la miniatura: " + (error as Error).message);
    }
  }

  if (data.bannerFile) {
    try {
      const uploadResponse = await uploadFile(data.bannerFile, {
        folder: "imagenes",
        isPublic: true,
      });
      bannerUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el banner: " + (error as Error).message);
    }
  }

  if (data.productFile) {
    try {
      const folder = data.productType === "pdf" ? "documentos" : 
                     data.productType === "video" ? "videos" : 
                     "documentos";
      const uploadResponse = await uploadFile(data.productFile, {
        folder,
        isPublic: true,
      });
      fileUrl = uploadResponse.url;
    } catch (error) {
      throw new Error("Error al subir el archivo del producto: " + (error as Error).message);
    }
  }

  // Preparar los datos para enviar (sin los archivos)
  const { thumbnailFile, bannerFile, productFile, ...requestData } = data;
  const productData: Omit<UpdateProductDto, "thumbnailFile" | "bannerFile" | "productFile"> = {
    ...requestData,
    fileUrl: fileUrl && fileUrl.trim() !== "" ? fileUrl : undefined,
    thumbnailUrl: thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl : undefined,
    bannerUrl: bannerUrl && bannerUrl.trim() !== "" ? bannerUrl : undefined,
  };

  const response = await apiAxios.patch<Product>(`/products/${productId}`, productData);
  return response.data;
};

// DELETE /products/:id - Eliminar producto
export const deleteProduct = async (productId: string): Promise<void> => {
  await apiAxios.delete(`/products/${productId}`);
};

// GET /creators - Obtener todos los creators
export const getCreators = async (): Promise<Creator[]> => {
  const response = await apiAxios.get<Creator[]>("/creators");
  return response.data;
};

// GET /creators/:slug - Obtener creator por slug
export const getCreatorBySlug = async (slug: string): Promise<Creator> => {
  const response = await apiAxios.get<Creator>(`/creators/slug/${slug}`);
  return response.data;
};


