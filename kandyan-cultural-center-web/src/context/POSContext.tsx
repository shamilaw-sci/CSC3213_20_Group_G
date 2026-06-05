import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedProducts, setCachedProducts] = useState<POSItem[]>([]);

  // 1. NETWORK LISTENER & AUTO-SYNC
  useEffect(() => {
    // Check initial status (only runs in browser, checking for window prevents Next.js SSR errors)
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineOrders(); // Trigger sync immediately when connection returns
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
        const { data, error } = await supabase.from('artifact_variants').select('*, artifacts(name)');
        if (error) throw error;

        const formattedProducts = data.map((item: any) => ({
          id: item.id.toString(), 
          name: item.artifacts?.name || `Variant #${item.id}`, 
          price: item.price || 0,
          stock: item.stock || 0,
          
          // Add these missing properties back!
          barcode: item.barcode || null,
          type: 'merchandise' as const, // Assuming all are merchandise for error solving; adjust as needed
          color: item.color_name || null, 
          hexCode: item.hex_code || null,
          imageUrl: item.image_url || null,
        }));
        
        setCachedProducts(formattedProducts);
        // Save backup to local storage
        localStorage.setItem('kaa_product_cache', JSON.stringify(formattedProducts));
      } catch (err) {
        console.error("Failed to fetch from Supabase, loading cache...", err);
        loadFromCache();
      }
    } else {
      loadFromCache();
    }
  };

  const loadFromCache = () => {
    const cached = localStorage.getItem('kaa_product_cache');
    if (cached) {
      setCachedProducts(JSON.parse(cached));
    }
  };

  // 3. PROCESS ORDER (ONLINE VS OFFLINE)
  const processOrder = async (orderData: any, currentCart: any[]) => {
    if (isOnline) {
      try {
        // Try to save directly to Supabase
        const { error } = await supabase.from('orders').insert(orderData);
        if (error) throw error;

        //For a complete system, also loop through currentCart here 
        // and run an UPDATE on artifact_variants to deduct stock in Supabase.
      } catch (error) {
        console.error("Supabase error, queuing order offline instead.", error);
        queueOrderOffline(orderData, currentCart);
      }
    } else {
      // We are offline, send straight to the queue
      queueOrderOffline(orderData, currentCart);
    }
  };

  // 4. THE OFFLINE QUEUE
  const queueOrderOffline = (orderData: any, currentCart: any[]) => {
    const existingQueue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    const newOrder = {
      ...orderData,
      id: crypto.randomUUID(), // Assign a temporary local ID
      queued_at: new Date().toISOString(),
      items: currentCart // Save the items to deduct later
    };
    
    existingQueue.push(newOrder);
    localStorage.setItem('kaa_offline_queue', JSON.stringify(existingQueue));
    
    // Optimistically deduct stock from the LOCAL cache so the UI updates immediately
    const updatedCache = cachedProducts.map(product => {
      const soldItem = currentCart.find(c => c.id === product.id);
      if (soldItem) {
        return { ...product, stock: (product.stock || 0) - (soldItem.quantity || 0) };
      }
      return product;
    });
    setCachedProducts(updatedCache);
    localStorage.setItem('kaa_product_cache', JSON.stringify(updatedCache));
  };

  // 5. THE SYNC ENGINE
  const syncOfflineOrders = async () => {
    const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline orders to Supabase...`);

    // Loop through the queue and push each one
    for (let i = queue.length - 1; i >= 0; i--) {
      const order = queue[i];
      try {
        // Strip out the temporary local fields before sending to DB
        const { id, queued_at, items, ...cleanOrderData } = order;
        
        const { error } = await supabase.from('orders').insert(cleanOrderData);
        if (error) throw error;

        // If successful, remove it from the queue array
        queue.splice(i, 1);
      } catch (err) {
        console.error("Failed to sync order", order.invoice_number);
        // It remains in the array to try again next time
      }
    }

    // Save the remaining (or empty) queue back to local storage
    localStorage.setItem('kaa_offline_queue', JSON.stringify(queue));
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
    <POSContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, updateQuantity, applyDiscount, applyCustomPrice, orderNumber, isOnline, processOrder, cachedProducts, loadProducts}}>
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