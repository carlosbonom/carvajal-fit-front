"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Image, Package, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartJose } from "@/contexts/cart-jose-context";
import { getProductsByCreator, type Product, type Creator } from "@/services/products";
import { Footer } from "@/components/Footer";

export default function MarketJosePage() {
  const router = useRouter();
  const { addItem } = useCartJose();
  const [products, setProducts] = useState<Product[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar productos (incluyen información del creator)
      const productsData = await getProductsByCreator("jose");
      
      // Filtrar solo productos activos
      const activeProducts = productsData.filter(p => p.isActive);
      setProducts(activeProducts);
      
      // Obtener información del creator desde el primer producto
      if (activeProducts.length > 0 && activeProducts[0].creator) {
        setCreator(activeProducts[0].creator);
      } else {
        // Valores por defecto si no hay productos
        setCreator({
          id: "",
          name: "José Carvajal",
          slug: "jose",
          bio: undefined,
          avatarUrl: undefined,
        });
      }
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(err.message || "Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart(product.id);
      const price = product.prices.find(p => p.currency === "CLP" && p.isActive) || product.prices[0];
      if (!price) {
        throw new Error("No se encontró precio disponible");
      }
      addItem(product, 1, price.currency);
      // Pequeño delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err: any) {
      console.error("Error al agregar al carrito:", err);
      alert(err.message || "Error al agregar al carrito");
    } finally {
      setAddingToCart(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "digital_file":
      case "video":
      case "ebook":
        return <Image className="w-5 h-5" />;
      case "merchandise":
        return <Package className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return "PDF";
      case "digital_file":
        return "Digital";
      case "video":
        return "Video";
      case "ebook":
        return "Ebook";
      case "merchandise":
        return "Merchandise";
      default:
        return "Producto";
    }
  };

  const getPrice = (product: Product) => {
    const price = product.prices.find(p => p.currency === "CLP" && p.isActive) || product.prices[0];
    return price ? { amount: price.amount, currency: price.currency } : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Obtener banner del primer producto o usar uno por defecto
  const bannerUrl = products.find(p => p.bannerUrl)?.bannerUrl || creator?.avatarUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      {bannerUrl && (
        <div className="relative w-full h-64 md:h-96 bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
          <img
            src={bannerUrl}
            alt={`Banner de ${creator?.name || "José"}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                {creator?.name || "Market José"}
              </h1>
              {creator?.bio && (
                <p className="text-lg md:text-xl max-w-2xl px-4">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Productos</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const price = getPrice(product);
              
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Imagen del producto */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40">
                        {getTypeIcon(product.productType)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-800">
                        {getTypeLabel(product.productType)}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      {price ? (
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            ${price.amount.toLocaleString("es-CL")}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {price.currency}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Precio no disponible</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!price || addingToCart === product.id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Agregando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Agregar al carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}


