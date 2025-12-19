import { CartJoseProvider } from "@/contexts/cart-jose-context";

export default function MarketJoseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartJoseProvider>
      {children}
    </CartJoseProvider>
  );
}




