'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void; // <-- NEW: Added to interface
  cartCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // <-- NEW: Safety flag

  // --- 1. INITIAL LOAD FROM CACHE ---
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kcc_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from cache:', error);
    } finally {
      setIsLoaded(true); // Mark as loaded whether we found data or not
    }
  }, []); // Empty dependency array means this runs ONCE when the app starts

  // --- 2. SAVE TO CACHE ON CHANGE ---
  useEffect(() => {
    // Only save if the initial load has finished so we don't accidentally save an empty array over the user's data!
    if (isLoaded) {
      localStorage.setItem('kcc_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]); // This runs every time the 'cart' changes

  const addToCart = (newItem: CartItem, openDrawer = true) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem];
    });
    
    if (openDrawer) {
      setIsDrawerOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- 3. CLEAR CART FUNCTION ---
  const clearCart = () => {
    setCart([]);
    // Because 'cart' changed to [], the save useEffect above will automatically update localStorage!
    localStorage.removeItem('kcc_cart'); // Forcefully and immediately wipes the cache!
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, isDrawerOpen, setIsDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};