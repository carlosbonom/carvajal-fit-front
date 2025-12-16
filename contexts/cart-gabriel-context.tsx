"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/services/products";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPrice: {
    currency: string;
    amount: number;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, currency?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: (currency?: string) => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cart_gabriel";

export function CartGabrielProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cargar carrito del localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number = 1, currency: string = "CLP") => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // Si ya existe, actualizar cantidad
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        const price = product.prices.find((p) => p.currency === currency && p.isActive);
        if (!price) {
          throw new Error(`No se encontró precio para la moneda ${currency}`);
        }
        
        return [
          ...prevItems,
          {
            product,
            quantity,
            selectedPrice: {
              currency: price.currency,
              amount: price.amount,
            },
          },
        ];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotal = (currency: string = "CLP") => {
    return items.reduce((total, item) => {
      if (item.selectedPrice.currency === currency) {
        return total + item.selectedPrice.amount * item.quantity;
      }
      return total;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartGabriel() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartGabriel debe ser usado dentro de CartGabrielProvider");
  }
  return context;
}


