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
        const { data, error } = await supabase.from('artifact_variants').select('*, artifacts(name, category)');
        if (error) throw error;

        const formattedProducts = data.map((item: any) => ({
          id: item.id.toString(), 
          name: item.artifacts?.name || `Variant #${item.id}`, 
          category: item.artifacts?.category || 'Uncategorized',
          price: item.price || 0,
          stock: item.stock || 0,
          barcode: item.barcode || null,
          type: 'merchandise' as const, // Assuming all are merchandise for error solving; adjust as needed
          color: item.color_name || null, 
          hexCode: item.hex_code || null,
          imageUrl: item.image_url || null,
          costPrice: item.cost_price || 0,
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
  const processOrder = async (orderData: any, orderItemsData: any[], currentCart: any[]) => {
    if (isOnline) {
      try {
        // First, insert the parent order header
        const { error: orderError } = await supabase.from('orders').insert(orderData);
        if (orderError) throw orderError;

        // Second, insert the child items array
        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsError) throw itemsError;

        console.log("Order and items saved to Supabase successfully!");

      } catch (error) {
        console.error("Supabase dual-insert error, queuing offline instead.", error);
        queueOrderOffline(orderData, orderItemsData, currentCart);
      }
    } else {
      // Offline mode: queue it all
      queueOrderOffline(orderData, orderItemsData, currentCart);
    }
  };

  // 4. THE OFFLINE QUEUE
  const queueOrderOffline = (orderData: any, orderItemsData: any[], currentCart: any[]) => {
    const existingQueue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    
    // Package everything together in one neat offline envelope
    const newOrder = {
      orderData,
      orderItemsData,
      queued_at: new Date().toISOString(),
      items: currentCart
    };
    
    existingQueue.push(newOrder);
    localStorage.setItem('kaa_offline_queue', JSON.stringify(existingQueue));
    
    // Optimistically deduct stock from the LOCAL cache so the UI updates immediately
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
    const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline orders to Supabase...`);
    const remainingQueue = []; // Holds orders that fail to sync

    // Loop through the queue and push each one
    for (let i = 0; i < queue.length; i++) {
      const order = queue[i];
      try {
        // Push Header
        const { error: orderError } = await supabase.from('orders').insert(order.orderData);
        if (orderError) throw orderError;

        // Push Items
        const { error: itemsError } = await supabase.from('order_items').insert(order.orderItemsData);
        if (itemsError) throw itemsError;

        console.log(`Successfully synced offline order ${order.orderData.invoice_number}`);
        // If successful, it does NOT get added to the remainingQueue
      } catch (err) {
        console.error("Failed to sync order, retaining in queue.", err);
        remainingQueue.push(order); 
      }
    }

    // Overwrite the local storage with whatever is left (empty if 100% successful)
    localStorage.setItem('kaa_offline_queue', JSON.stringify(remainingQueue));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent going below 1 via this function
    
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === id) {
          // Prevent the cart quantity from exceeding the actual physical stock
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
    <POSContext.Provider value={{ 
      cart,
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      updateQuantity, 
      applyDiscount, 
      applyCustomPrice, 
      orderNumber, isOnline, 
      processOrder, 
      cachedProducts, 
      loadProducts, 
      cashierId,
      setCashierId}}>
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