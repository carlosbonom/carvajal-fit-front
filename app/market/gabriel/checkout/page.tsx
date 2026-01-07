"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartGabriel } from "@/contexts/cart-gabriel-context";
import { MarketCheckoutView } from "@/components/market-checkout-view";
import { Footer } from "@/components/Footer";
import { marketPaymentService } from "@/services/market-payments";

import { register, login } from "@/services/auth";
import { saveTokens } from "@/lib/auth-utils";
import { GuestData } from "@/components/market-checkout-view";

export default function CheckoutGabrielPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal } = useCartGabriel();
  const [processing, setProcessing] = useState(false);

  const total = getTotal("CLP");

  const handleCheckout = async (method: string, guestData: GuestData) => {
    if (items.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    try {
      setProcessing(true);

      // Si eligió registrarse
      if (guestData.shouldRegister && guestData.password && guestData.phone) {
        try {
          await register({
            email: guestData.email,
            password: guestData.password,
            name: guestData.name,
            phone: guestData.phone
          });

          const loginRes = await login({
            email: guestData.email,
            password: guestData.password
          });

          saveTokens(loginRes.accessToken, loginRes.refreshToken);
        } catch (regError) {
          console.error("Error en registro:", regError);
          alert("Error al registrar usuario. Se intentará continuar como invitado.");
        }
      }

      const dataItems = items.map(item => ({ productId: item.product.id, quantity: item.quantity }));
      const guestDetails = { name: guestData.name, email: guestData.email };

      if (method === 'webpay') {
        // Si hay token guardado (por login reciente o anterior), axios lo enviará.
        // Si no, enviamos guestDetails.
        const { url, token } = await marketPaymentService.createWebpayTransaction('gabriel', dataItems, guestDetails);
        const form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        const tokenInput = document.createElement("input");
        tokenInput.type = "hidden";
        tokenInput.name = "token_ws";
        tokenInput.value = token;
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
      } else if (method === 'mercadopago') {
        const { initPoint } = await marketPaymentService.createMercadoPagoCheckout('gabriel', dataItems);
        window.location.href = initPoint;
      } else if (method === 'paypal') {
        const { approveUrl } = await marketPaymentService.createPayPalOrder('gabriel', dataItems);
        window.location.href = approveUrl;
      }

    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error al procesar el pago");
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-400 mb-8">Agrega productos para continuar</p>
          <button
            onClick={() => router.push("/market/gabriel")}
            className="px-6 py-3 bg-[#00b2de] text-white rounded-xl hover:bg-[#00b2de]/90 transition-all font-medium"
          >
            Volver a la tienda
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <MarketCheckoutView
      items={items}
      total={total}
      removeItem={removeItem}
      updateQuantity={updateQuantity}
      onCheckout={handleCheckout}
      processing={processing}
      creatorName="Market Gabriel"
      backUrl="/market/gabriel"
    />
  );
}


