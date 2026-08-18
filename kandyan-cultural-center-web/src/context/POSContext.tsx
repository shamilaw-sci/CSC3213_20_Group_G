'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { POSItem, CartItem, POSContextType } from '../types/pos.types';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashierId, setCashierId] = useState<string | null>(null);

  const generateOrderNumber = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    
    // Generates a random 4-character hex string without relying on the window object
    const randomPart = Math.random().toString(16).slice(2, 6).toUpperCase().padStart(4, '0');

    return `ST-${yy}${mm}${dd}-${randomPart}`;
  };

  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    setOrderNumber(generateOrderNumber());
  }, []);

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

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedProducts, setCachedProducts] = useState<POSItem[]>([]);

  // 1. NETWORK LISTENER & AUTO-SYNC
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineOrders(); 
      };
      
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // 2. FETCH AND CACHE PRODUCTS
  const loadProducts = async () => {
    if (isOnline) {
      try {
        const { data, error } = await supabase.from('artifact_variants').select('*, artifacts(name, category)');
        if (error) throw error;

        const formattedProducts = data.map((item: any) => ({
          id: item.id.toString(), 
          name: item.artifacts?.name || `Variant #${item.id}`, 
          category: item.artifacts?.category || 'Uncategorized',
          price: item.price || 0,
          stock: item.stock || 0,
          barcode: item.barcode || null,
          type: 'merchandise' as const, 
          color: item.color_name || null, 
          hexCode: item.hex_code || null,
          imageUrl: item.image_url || null,
          costPrice: item.cost_price || 0,
        }));
        
        setCachedProducts(formattedProducts);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('kaa_product_cache', JSON.stringify(formattedProducts));
        }
      } catch (err) {
        console.error("Failed to fetch from Supabase, loading cache...", err);
        loadFromCache();
      }
    } else {
      loadFromCache();
    }
  };

  const loadFromCache = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('kaa_product_cache');
      if (cached) {
        setCachedProducts(JSON.parse(cached));
      }
    }
  };

  // 3. PROCESS ORDER (ONLINE VS OFFLINE)
  const processOrder = async (orderData: any, orderItemsData: any[], currentCart: any[]) => {
    if (isOnline) {
      try {
        const { error: orderError } = await supabase.from('orders').insert(orderData);
        if (orderError) throw orderError;

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsError) throw itemsError;

        console.log("Order and items saved to Supabase successfully!");

      } catch (error) {
        console.error("Supabase dual-insert error, queuing offline instead.", error);
        queueOrderOffline(orderData, orderItemsData, currentCart);
      }
    } else {
      queueOrderOffline(orderData, orderItemsData, currentCart);
    }
  };

  // 4. THE OFFLINE QUEUE
  const queueOrderOffline = (orderData: any, orderItemsData: any[], currentCart: any[]) => {
    if (typeof window === 'undefined') return;

    const existingQueue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    
    const newOrder = {
      orderData,
      orderItemsData,
      queued_at: new Date().toISOString(),
      items: currentCart
    };
    
    existingQueue.push(newOrder);
    localStorage.setItem('kaa_offline_queue', JSON.stringify(existingQueue));
    
    const updatedCache = cachedProducts.map(product => {
      const soldItem = currentCart.find(c => c.id === product.id);
      if (soldItem) {
        return { ...product, stock: (product.stock || 0) - soldItem.quantity };
      }
      return product;
    });
    
    setCachedProducts(updatedCache);
    localStorage.setItem('kaa_product_cache', JSON.stringify(updatedCache));
  };

  // 5. THE SYNC ENGINE
  const syncOfflineOrders = async () => {
    if (typeof window === 'undefined') return;

    const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline orders to Supabase...`);
    const remainingQueue = []; 

    for (let i = 0; i < queue.length; i++) {
      const order = queue[i];
      try {
        const { error: orderError } = await supabase.from('orders').insert(order.orderData);
        if (orderError && orderError.code !== '23505') throw orderError; 

        const { error: itemsError } = await supabase.from('order_items').insert(order.orderItemsData);
        if (itemsError && itemsError.code !== '23505') throw itemsError; 

        console.log(`Successfully synced offline order ${order.orderData.invoice_number}`);
      } catch (err) {
        console.error("Failed to sync order, retaining in queue.", err);
        remainingQueue.push(order); 
      }
    }

    localStorage.setItem('kaa_offline_queue', JSON.stringify(remainingQueue));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return; 
    
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === id) {
          const maxStock = item.stock || 0;
          const safeQuantity = newQuantity > maxStock ? maxStock : newQuantity;
          return { ...item, quantity: safeQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNumber(generateOrderNumber()); 
  };

  const applyDiscount = (id: string, percentage: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        return { ...item, discountPercentage: percentage, customPrice: undefined };
      }
      return item;
    }));
  };

  const applyCustomPrice = (id: string, price: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
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
    <POSContext.Provider value={{ 
      cart,
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      updateQuantity, 
      applyDiscount, 
      applyCustomPrice, 
      orderNumber, 
      isOnline, 
      processOrder, 
      cachedProducts, 
      loadProducts, 
      cashierId,
      setCashierId
    }}>
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