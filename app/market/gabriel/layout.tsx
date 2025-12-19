import { CartGabrielProvider } from "@/contexts/cart-gabriel-context";

export default function MarketGabrielLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartGabrielProvider>
      {children}
    </CartGabrielProvider>
  );
}




