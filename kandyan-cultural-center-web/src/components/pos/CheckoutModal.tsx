'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '../../context/POSContext';
import { supabase } from '../../lib/supabase'; 

interface CheckoutModalProps {
  onClose: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart, orderNumber, processOrder, isOnline, loadProducts } = usePOS();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderTimestamp, setOrderTimestamp] = useState<Date | null>(null);

  // State to ensure the Portal only renders on the client side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const discountValue = parseFloat(discountPercent) || 0;
  const discountAmount = cartTotal * (discountValue / 100);
  const finalTotal = cartTotal - discountAmount;

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const masterOrderId = crypto.randomUUID();

      const orderData = {
        id: masterOrderId,              
        invoice_number: orderNumber,    
        total_amount: finalTotal,        
        discount_percentage: discountValue, 
        payment_method: paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString(), 
        sales_channel: 'in-store',           
      };

      const orderItemsData = cart.map((item) => {
        const sellingPrice = item.customPrice !== undefined ? item.customPrice : item.price;
        
        return {
          id: crypto.randomUUID(),      
          order_id: masterOrderId,      
          variant_id: item.id,
          quantity: item.quantity,
          cost_price_at_sale: item.costPrice || 0, 
          selling_price_at_sale: sellingPrice,
        };
      });

      await processOrder(orderData, orderItemsData, cart);

      setOrderTimestamp(new Date());
      setShowReceipt(true);

    } catch (err: any) {
      console.error("Checkout Error:", err);
      setError("System failure. Please check terminal storage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishTransaction = () => {
    clearCart();
    loadProducts();
    onClose();
  };

  // Wait until mounted on client to render the Portal
  if (!mounted) return null;

  // VIEW 1: THE THERMAL RECEIPT PREVIEW (Wrapped in createPortal)
  if (showReceipt) {
    return createPortal(
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-stone-900/80 backdrop-blur-sm">
        <div className="flex min-h-full items-start justify-center p-4 pt-24 pb-12">
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            
            <div className="bg-white w-80 p-6 shadow-2xl font-mono text-stone-900 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mt-2"></div>
              
              <div className="text-center mb-6 flex flex-col items-center">
                <img 
                  src="/logo.png" 
                  alt="Kandyan Cultural Centre Logo" 
                  className="w-14 h-14 mb-2 object-contain grayscale contrast-125" 
                />
                <h2 className="font-bold text-sm uppercase">Kandyan Cultural Centre</h2>
                <p className="text-[10px] text-stone-500 mt-1">No 72 Sangharaja Mawatha,</p>
                <p className="text-[10px] text-stone-500">Kandy, Sri Lanka</p>
                <p className="text-[10px] text-stone-500 mt-1">+94 81 222 3100</p>
                <p className="text-[10px] text-stone-500">www.kandyanculturalcentre.lk</p>
              </div>

              <div className="border-b-2 border-dashed border-stone-300 pb-3 mb-3 text-[11px] leading-relaxed">
                <div className="flex justify-between">
                  <span>Date: {orderTimestamp?.toLocaleDateString()}</span>
                  <span>{orderTimestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>Cashier 1</span>
                </div>
              </div>

              <table className="w-full text-[11px] mb-4">
                <thead>
                  <tr className="border-b-2 border-dashed border-stone-300 text-left">
                    <th className="pb-2 font-bold w-full">ITEM</th>
                    <th className="pb-2 font-bold px-2 text-right">QTY</th>
                    <th className="pb-2 font-bold text-right">AMT</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {cart.map(item => {
                    const itemPrice = item.customPrice !== undefined ? item.customPrice : item.price;
                    return (
                      <tr key={item.id}>
                        <td className="py-2 pr-2">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-[9px] text-stone-500">Barcode: {item.id.slice(0,8)}</div>
                        </td>
                        <td className="py-2 px-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">{((itemPrice * item.quantity)).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="border-t-2 border-dashed border-stone-300 pt-3 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount ({discountValue}%)</span>
                    <span>- Rs. {discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-2 mt-2 border-t-2 border-dashed border-stone-300">
                  <span>TOTAL</span>
                  <span>Rs. {finalTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500 pt-1">
                  <span className="uppercase">Paid via {paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="text-center mt-8 text-[11px] font-bold pb-2">
                <p>THANK YOU FOR YOUR VISIT</p>
                <p className="font-normal mt-2 text-[9px] text-stone-500 leading-tight">
                  We accept returns within 14 days from the date of purchase. For further details on return and refund policies, please check our website.
                </p>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mb-2 rotate-180"></div>
            </div>

            <div className="flex gap-4 mt-8 w-80 shrink-0">
              <button 
                onClick={() => alert("Printing simulated. In production, this would trigger the thermal printer.")}
                className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Re-Print
              </button>
              <button 
                onClick={handleFinishTransaction}
                className="flex-[2] py-3 bg-amber-700 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center"
              >
                NEXT ORDER
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // VIEW 2: THE STANDARD CHECKOUT MODAL 
  const paymentMethodsConfig = [
    { 
      id: 'cash', 
      label: 'Cash',
      icon: (
        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      id: 'card', 
      label: 'Card',
      icon: (
        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    { 
      id: 'bank_transfer', 
      label: 'Bank',
      icon: (
        <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      )
    }
  ];

  // (Wrapped in createPortal)
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* --- RESPONSIVE HEADER --- */}
        <div className="flex justify-between items-center px-4 md:px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div className="flex items-center flex-wrap gap-2 md:gap-3 pr-2">
            <h2 className="text-xl md:text-2xl font-black text-stone-800 whitespace-nowrap">Checkout</h2>
            <span className="text-xs md:text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-sm whitespace-nowrap">
              #{orderNumber}
            </span>
          </div>
          <button onClick={onClose} className="w-10 h-10 shrink-0 flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* --- RESPONSIVE BODY (STACKS ON MOBILE) --- */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto overflow-x-hidden md:overflow-hidden">
          
          <div className="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-stone-200 overflow-y-visible md:overflow-y-auto bg-white shrink-0 md:shrink">
            <h3 className="font-bold text-stone-500 uppercase tracking-wider text-sm mb-4">Order Details</h3>
            <div className="space-y-3">
              {cart.map(item => {
                const itemPrice = item.customPrice !== undefined ? item.customPrice : item.price;
                return (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-stone-100">
                    <div className="flex gap-2 pr-2">
                      <span className="font-bold text-stone-600">{item.quantity}x</span>
                      <span className="text-stone-800 line-clamp-2">{item.name}</span>
                    </div>
                    <span className="font-medium text-stone-600 whitespace-nowrap">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-1/2 p-4 md:p-6 bg-stone-50 flex flex-col shrink-0 md:shrink">
            
            <div className="mb-6 md:mb-8">
              <label className="block text-sm font-bold text-stone-700 mb-2">Total Bill Discount (%)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-4 py-3 text-lg font-bold bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g. 10"
                />
                <span className="text-stone-500 font-bold text-xl">%</span>
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <label className="block text-sm font-bold text-stone-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethodsConfig.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`py-3 px-1 rounded-xl text-xs md:text-sm font-bold border-2 transition-all flex items-center justify-center ${
                      paymentMethod === method.id 
                        ? 'border-amber-600 bg-amber-50 text-amber-800' 
                        : 'border-stone-200 bg-white text-stone-500 hover:border-amber-300'
                    }`}
                  >
                    {method.icon}
                    <span className="truncate">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-2 mb-6">
              <div className="flex justify-between text-stone-500 font-medium text-sm md:text-base">
                <span>Subtotal:</span>
                <span>Rs. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold text-sm md:text-base">
                  <span>Discount ({discountValue}%):</span>
                  <span>- Rs. {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between items-end">
                <span className="text-base md:text-lg font-bold text-stone-800">Final Total:</span>
                <span className="text-2xl md:text-3xl font-black text-amber-700">
                  Rs. {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-bold mb-4 text-center bg-red-50 p-2 rounded">{error}</div>}

            <button 
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white text-lg md:text-xl font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'PROCESSING...' : 'CONFIRM & COMPLETE'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}