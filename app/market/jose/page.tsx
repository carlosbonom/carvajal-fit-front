"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, FileText, Image, Package, Loader2, Play, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useCartJose } from "@/contexts/cart-jose-context";
import { getProductsByCreator, type Product, type Creator } from "@/services/products";
import { getPlans, type Plan, type Price } from "@/services/subscriptions";
import { Footer } from "@/components/Footer";
import { ProductModal } from "@/components/market/product-modal";

export default function MarketJosePage() {
  const router = useRouter();
  const { addItem } = useCartJose();
  const [products, setProducts] = useState<Product[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar productos y planes en paralelo
      const [productsData, plansData] = await Promise.all([
        getProductsByCreator("jose"),
        getPlans()
      ]);

      // Filtrar solo productos activos
      const activeProducts = productsData.filter(p => p.isActive);
      setProducts(activeProducts);

      // Cargar planes
      setPlans(plansData.plans || []);

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
      // Close modal if open
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error al agregar al carrito:", err);
      alert(err.message || "Error al agregar al carrito");
    } finally {
      setAddingToCart(null);
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300); // Clear after animation
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

  const getPrice = (product: Product, currency = "CLP") => {
    const price = product.prices.find(p => p.currency === currency && p.isActive);
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
              alt={`Banner de ${creator?.name || "José"}`}
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

      {/* Hero Section - Planes con Parallax */}
      {plans.length > 0 && (
        <div ref={heroRef} className="relative min-h-[60vh] overflow-hidden bg-gradient-to-b from-black via-[#0a0e12] to-black">
          {/* Parallax Background */}
          <motion.div
            style={{ y }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-16 flex items-center min-h-[60vh]">
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00b2de] via-white to-[#00b2de]">
                  Planes de José
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Transforma tu cuerpo y mente con programas diseñados por José Carvajal
                </p>
              </motion.div>

            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="container mx-auto px-4 py-24">

        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0e12] rounded-3xl border border-[#00b2de]/10 max-w-2xl mx-auto">
            <Package className="w-20 h-20 mx-auto mb-6 text-gray-700" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-500">Vuelve pronto para ver las novedades</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((product, index) => {
              const clpPrice = getPrice(product, "CLP");
              const usdPrice = getPrice(product, "USD");

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group bg-[#0a0e12] rounded-3xl border border-[#00b2de]/20 overflow-hidden hover:border-[#00b2de]/50 transition-all duration-300 shadow-2xl hover:shadow-[#00b2de]/10 flex flex-col h-full"
                >
                  {/* Imagen del producto */}
                  <div className="relative aspect-video overflow-hidden bg-[#0e141b]">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#00b2de]/30">
                        {getTypeIcon(product.productType)}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6 md:p-8 flex flex-col flex-grow bg-gradient-to-b from-[#0a0e12] to-black">
                    <div className="flex-grow">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight group-hover:text-[#00b2de] transition-colors">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 space-y-6">
                      <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                          {clpPrice ? (
                            <>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">
                                  ${clpPrice.amount.toLocaleString("es-CL")}
                                </span>
                                <span className="text-xs font-bold text-[#00b2de]">
                                  {clpPrice.currency}
                                </span>
                              </div>
                              {usdPrice && (
                                <span className="text-sm font-bold text-gray-500">
                                  ${usdPrice.amount.toLocaleString("en-US")} USD
                                </span>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 italic">No disponible</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!clpPrice || addingToCart === product.id}
                          className="flex-[2] bg-[#00b2de] hover:bg-[#00b2de]/80 text-black font-black py-4 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95 shadow-[0_0_20px_rgba(0,178,222,0.3)] hover:shadow-[0_0_30px_rgba(0,178,222,0.5)]"
                        >
                          {addingToCart === product.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              Agregar al Carrito
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openModal(product)}
                          className="flex-1 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center"
                        >
                          Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
        isAddingToCart={!!addingToCart}
      />
    </div>
  );
}
