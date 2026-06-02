export interface POSItem {
  id: string;
  name: string;
  price: number;
  barcode?: string | null;
  type: 'merchandise' | 'ticket'; 
  color?: string;
  hexCode?: string;
  imageUrl?: string;
  stock?: number;
}

export interface CartItem extends POSItem {
  quantity: number;
  discountPercentage?: number;
  customPrice?: number;
  orderNumber: string;

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
  orderNumber: string;
  cart: CartItem[];
  addToCart: (item: POSItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  updateQuantity: (id: string, quantity: number) => void;
  applyDiscount: (id: string, percentage: number) => void;
  applyCustomPrice: (id: string, price: number) => void;
}