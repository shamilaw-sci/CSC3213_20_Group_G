export interface POSItem {
  id: string;
  name: string;
  price: number;
  barcode?: string | null;
  // type can help you differentiate between physical goods and tickets later
  type: 'merchandise' | 'ticket'; 
}

export interface CartItem extends POSItem {
  quantity: number;
}

export interface OfflineOrder {
  orderId: string;
  items: CartItem[];
  total: number;
  timestamp: string;
  isSynced: boolean;
}

// Define what our Context will expose to the UI
export interface POSContextType {
  cart: CartItem[];
  addToCart: (item: POSItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
}