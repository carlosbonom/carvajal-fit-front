"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useCartGabriel } from "@/contexts/cart-gabriel-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";

export default function CheckoutGabrielPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartGabriel();
  const [processing, setProcessing] = useState(false);

  const total = getTotal("CLP");

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      setProcessing(true);
      // Aquí iría la lógica de checkout
      // Por ahora solo simulamos
      alert("Checkout en desarrollo. Total: $" + total.toLocaleString("es-CL"));
      // clearCart();
      // router.push("/market/gabriel/checkout/success");
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error al procesar el pago");
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => router.push("/market/gabriel")}
            className="flex items-center gap-2 text-primary mb-6 hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la tienda
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
            <button
              onClick={() => router.push("/market/gabriel")}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Ver productos
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <button
          onClick={() => router.push("/market/gabriel")}
          className="flex items-center gap-2 text-primary mb-6 hover:text-primary/80"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la tienda
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout - Market Gabriel</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Productos en el carrito</h2>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {item.product.thumbnailUrl && (
                        <img
                          src={item.product.thumbnailUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          ${item.selectedPrice.amount.toLocaleString("es-CL")} {item.selectedPrice.currency}
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          ${(item.selectedPrice.amount * item.quantity).toLocaleString("es-CL")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${total.toLocaleString("es-CL")} CLP</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Proceder al pago"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


