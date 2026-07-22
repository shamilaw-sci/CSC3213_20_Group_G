'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discounted_price?: number; 
  image_url: string;
  quantity: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void; // Added this function
  cartCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('kcc_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from local storage', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kcc_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      // Determine the maximum allowed stock (fallback to Infinity if stock is undefined)
      const maxStock = item.stock !== undefined ? item.stock : Infinity;

      if (existingItem) {
        return prevCart.map((cartItem) => {
          if (cartItem.id === item.id) {
            // Calculate the new requested quantity
            const requestedQuantity = cartItem.quantity + (item.quantity || 1);
            // Lock it to the maxStock ceiling
            return { ...cartItem, quantity: Math.min(requestedQuantity, maxStock) };
          }
          return cartItem;
        });
      }
      
      // For brand new items, ensure the initial amount doesn't exceed stock
      const initialQuantity = Math.min(item.quantity || 1, maxStock);
      return [...prevCart, { ...item, quantity: initialQuantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const maxStock = item.stock !== undefined ? item.stock : Infinity;
          // Math.max ensures it never drops below 1
          // Math.min ensures it never goes above the available stock
          const boundedQuantity = Math.min(Math.max(1, quantity), maxStock);
          return { ...item, quantity: boundedQuantity };
        }
        return item;
      })
    );
  };

  // New function to wipe the cart after successful payment
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('kcc_cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartCount, 
        isDrawerOpen, 
        setIsDrawerOpen 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}