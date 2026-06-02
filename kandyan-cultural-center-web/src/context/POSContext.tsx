import React, { createContext, useContext, useState, useMemo } from 'react';
import { POSItem, CartItem, POSContextType } from '../types/pos.types';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const generateOrderNumber = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  
  // Generates a random 4-digit number between 1000 and 9999
  const xxxx = Math.floor(1000 + Math.random() * 9000); 
  
  return `S${yy}${mm}${dd}${xxxx}`;
};

const [orderNumber, setOrderNumber] = useState<string>(generateOrderNumber());

  const addToCart = (item: POSItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
  if (newQuantity < 1) return; // Prevent going below 1 via this function
  
  setCart(prevCart => 
    prevCart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
  );
};

  const removeFromCart = (id: string) => {
  setCart(prevCart => prevCart.filter(item => item.id !== id));
};

  const clearCart = () => {
  setCart([]);
  setOrderNumber(generateOrderNumber()); // Generate a new order number for the next transaction
};


  // Apply a percentage discount
const applyDiscount = (id: string, percentage: number) => {
  setCart(prevCart => prevCart.map(item => {
    if (item.id === id) {
      // We clear customPrice if they apply a discount, so they don't conflict
      return { ...item, discountPercentage: percentage, customPrice: undefined };
    }
    return item;
  }));
};

// Apply a manual flat price
const applyCustomPrice = (id: string, price: number) => {
  setCart(prevCart => prevCart.map(item => {
    if (item.id === id) {
      // We clear discount if they apply a custom price
      return { ...item, customPrice: price, discountPercentage: undefined };
    }
    return item;
  }));
};

  const cartTotal = cart.reduce((total, item) => {
  let effectivePrice = item.price;
  
  if (item.customPrice !== undefined) {
    effectivePrice = item.customPrice;
  } else if (item.discountPercentage) {
    effectivePrice = item.price - (item.price * (item.discountPercentage / 100));
  }
  
  return total + (effectivePrice * item.quantity);
}, 0);

  

  return (
    <POSContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, updateQuantity, applyDiscount, applyCustomPrice, orderNumber }}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};