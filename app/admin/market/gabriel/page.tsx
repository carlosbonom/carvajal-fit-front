"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Edit, Trash2, FileText, Image, Package, DollarSign, Eye, Loader2 } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";
import { ProductModal } from "@/components/product-modal";
import {
  getProductsByCreator,
  deleteProduct,
  type Product,
  type ProductType
} from "@/services/products";

export default function MarketGabrielPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ProductType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProductsByCreator("gabriel");
      setProducts(productsData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const filteredProducts = filterType === "all"
    ? products
    : products.filter(p => p.productType === filterType);

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    totalSales: 0, // TODO: Implementar cuando haya datos de ventas
    totalRevenue: 0, // TODO: Implementar cuando haya datos de ingresos
    byType: {
      pdf: products.filter(p => p.productType === "pdf").length,
      digital_file: products.filter(p => p.productType === "digital_file").length,
      merchandise: products.filter(p => p.productType === "merchandise").length,
      video: products.filter(p => p.productType === "video").length,
      ebook: products.filter(p => p.productType === "ebook").length,
    },
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-blue-100 text-blue-800";
      case "digital_file":
      case "video":
      case "ebook":
        return "bg-purple-100 text-purple-800";
      case "merchandise":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrice = (product: Product) => {
    const price = product.prices.find(p => p.currency === "CLP" && p.isActive) || product.prices[0];
    return price ? { amount: price.amount, currency: price.currency } : null;
  };

  return (
    <>
      <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main
        className={`min-h-screen transition-all duration-300 bg-gray-50 ${isMobile ? "ml-0" : !isMobile && isOpen ? "ml-20" : "ml-64"}`}
      >
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Market Gabriel
                </h1>
              </div>
              <p className="text-gray-600">
                Gestiona los productos de la tienda de Gabriel Carvajal
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.active} activos</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Ventas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalSales}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${stats.totalRevenue.toLocaleString("es-CL")}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Por Tipo</p>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {stats.byType.pdf} PDF
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  {stats.byType.digital_file} Digital
                </span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                  {stats.byType.merchandise} Merch
                </span>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ProductType | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todos los productos</option>
                <option value="pdf">PDFs</option>
                <option value="digital_file">Archivos Digitales</option>
                <option value="video">Videos</option>
                <option value="ebook">Ebooks</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-primary/40">
                        {getTypeIcon(product.productType)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.productType)}`}
                      >
                        {getTypeLabel(product.productType)}
                      </span>
                    </div>
                    {!product.isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium">
                          Inactivo
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {getPrice(product) ? (
                          <p className="text-2xl font-bold text-gray-900">
                            ${getPrice(product)!.amount.toLocaleString("es-CL")}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              {getPrice(product)!.currency}
                            </span>
                          </p>
                        ) : (
                          <p className="text-gray-500">Sin precio</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg mb-2">No hay productos</p>
                  <p className="text-gray-400 text-sm">
                    {filterType !== "all"
                      ? `No hay productos de tipo "${getTypeLabel(filterType as string)}"`
                      : "Crea tu primer producto para comenzar"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ProductModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSuccess={loadProducts}
        product={editingProduct}
        creatorSlug="gabriel"
      />
    </>
  );
}
















