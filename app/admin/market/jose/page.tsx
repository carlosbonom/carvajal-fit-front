"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Edit, Trash2, Upload, FileText, Image, Package, DollarSign, Eye } from "lucide-react";

import { AdminSidebar } from "@/components/admin-sidebar";

type ProductType = "pdf" | "digital" | "merchandise";

interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  currency: "CLP" | "USD";
  imageUrl?: string;
  fileUrl?: string;
  stock?: number; // Solo para merchandise
  isActive: boolean;
  salesCount: number;
  totalRevenue: number;
  createdAt: string;
}

export default function MarketJosePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ProductType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Aquí harías la llamada a la API
      // const response = await getProducts("jose");
      // setProducts(response.products);
      
      // Datos de ejemplo
      setProducts([
        {
          id: "1",
          name: "Guía de Nutrición Avanzada",
          description: "PDF completo con recetas y planes nutricionales",
          type: "pdf",
          price: 9900,
          currency: "CLP",
          isActive: true,
          salesCount: 45,
          totalRevenue: 445500,
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          name: "Rutina de Hipertrofia",
          description: "Programa completo de 12 semanas para ganar masa muscular",
          type: "digital",
          price: 19900,
          currency: "CLP",
          isActive: true,
          salesCount: 32,
          totalRevenue: 636800,
          createdAt: "2024-01-20",
        },
        {
          id: "3",
          name: "Camiseta Carvajal Fit",
          description: "Camiseta oficial de entrenamiento",
          type: "merchandise",
          price: 15900,
          currency: "CLP",
          stock: 25,
          isActive: true,
          salesCount: 18,
          totalRevenue: 286200,
          createdAt: "2024-02-01",
        },
        {
          id: "4",
          name: "Ebook: Mentalidad de Campeón",
          description: "Guía psicológica para alcanzar tus objetivos",
          type: "pdf",
          price: 12900,
          currency: "CLP",
          isActive: true,
          salesCount: 28,
          totalRevenue: 361200,
          createdAt: "2024-02-10",
        },
      ]);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = filterType === "all" 
    ? products 
    : products.filter(p => p.type === filterType);

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    totalSales: products.reduce((sum, p) => sum + p.salesCount, 0),
    totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0),
    byType: {
      pdf: products.filter(p => p.type === "pdf").length,
      digital: products.filter(p => p.type === "digital").length,
      merchandise: products.filter(p => p.type === "merchandise").length,
    },
  };

  const getTypeIcon = (type: ProductType) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5" />;
      case "digital":
        return <Image className="w-5 h-5" />;
      case "merchandise":
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: ProductType) => {
    switch (type) {
      case "pdf":
        return "PDF";
      case "digital":
        return "Contenido Digital";
      case "merchandise":
        return "Merchandise";
    }
  };

  const getTypeColor = (type: ProductType) => {
    switch (type) {
      case "pdf":
        return "bg-blue-100 text-blue-800";
      case "digital":
        return "bg-purple-100 text-purple-800";
      case "merchandise":
        return "bg-orange-100 text-orange-800";
    }
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
                  Market José
                </h1>
              </div>
              <p className="text-gray-600">
                Gestiona los productos de la tienda de José Carvajal
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
                  {stats.byType.digital} Digital
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
                <option value="digital">Contenido Digital</option>
                <option value="merchandise">Merchandise</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando productos...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-primary/40">
                        {getTypeIcon(product.type)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(product.type)}`}
                      >
                        {getTypeLabel(product.type)}
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
                        <p className="text-2xl font-bold text-gray-900">
                          ${product.price.toLocaleString("es-CL")}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            {product.currency}
                          </span>
                        </p>
                      </div>
                      {product.type === "merchandise" && product.stock !== undefined && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Stock</p>
                          <p className={`text-lg font-semibold ${product.stock > 10 ? "text-green-600" : product.stock > 0 ? "text-yellow-600" : "text-red-600"}`}>
                            {product.stock}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{product.salesCount} ventas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${product.totalRevenue.toLocaleString("es-CL")}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
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
                      ? `No hay productos de tipo "${getTypeLabel(filterType as ProductType)}"`
                      : "Crea tu primer producto para comenzar"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}



