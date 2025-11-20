import { PaymentCheckout } from "@/components/PaymentCheckout"
import { Suspense } from "react"

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <PaymentCheckout />
    </Suspense>
  )
}






