"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Image, Package, Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
      case "ebook":
        return <Image className="w-5 h-5" />;
      case "video":
        return <Play className="w-5 h-5" />;
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
        return "Físico";
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
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00b2de]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md w-full bg-[#0a0e12] border border-red-500/20 p-8 rounded-2xl">
            <p className="text-red-400 mb-6 text-lg">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-[#00b2de] text-white rounded-xl hover:bg-[#00b2de]/90 transition-all font-medium"
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
    <div className="min-h-screen bg-black text-white">
      {/* Banner Hero */}
      {bannerUrl && (
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={bannerUrl}
              alt={`Banner de ${creator?.name || "José"} `}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end justify-center pb-16 md:pb-24">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center px-4 max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00b2de]/10 border border-[#00b2de]/20 mb-6 backdrop-blur-sm">
                <Package className="w-4 h-4 text-[#00b2de]" />
                <span className="text-sm font-medium text-[#00b2de]">
                  Productos Exclusivos
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
                {creator?.name || "Market José"}
              </h1>

              {creator?.bio && (
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {creator.bio}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            Catálogo Disponible
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Herramientas diseñadas específicamente para maximizar tus resultados y acelerar tu transformación.
          </p>
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0e12] rounded-3xl border border-[#00b2de]/10 max-w-2xl mx-auto">
            <Package className="w-20 h-20 mx-auto mb-6 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-500">Vuelve pronto para ver las novedades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
              const price = getPrice(product);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group bg-[#0a0e12] rounded-2xl border border-[#00b2de]/20 overflow-hidden hover:border-[#00b2de]/50 transition-all duration-300 shadow-lg hover:shadow-[#00b2de]/10 flex flex-col h-full"
                >
                  {/* Imagen del producto */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#0e141b]">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#00b2de]/30">
                        {getTypeIcon(product.productType)}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#00b2de] transition-colors">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6 border-t border-gray-800">
                      <div className="flex items-end justify-between gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Precio</p>
                          {price ? (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-white">
                                ${price.amount.toLocaleString("es-CL")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {price.currency}
                              </span>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No disponible</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!price || addingToCart === product.id}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#00b2de] text-white rounded-xl hover:bg-[#00b2de]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold group/btn"
                      >
                        {addingToCart === product.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Agregando...
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300" />
                            Agregar al Carrito
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}


