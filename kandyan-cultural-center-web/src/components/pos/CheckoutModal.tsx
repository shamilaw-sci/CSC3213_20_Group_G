'use client';

import { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { supabase } from '../../lib/supabase'; 

interface CheckoutModalProps {
  onClose: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart, orderNumber, processOrder, isOnline } = usePOS();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: State to control showing the thermal receipt
  const [showReceipt, setShowReceipt] = useState(false);
  const [orderTimestamp, setOrderTimestamp] = useState<Date | null>(null);

  const discountValue = parseFloat(discountPercent) || 0;
  const discountAmount = cartTotal * (discountValue / 100);
  const finalTotal = cartTotal - discountAmount;

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Generate the master UUID locally in the browser
      const masterOrderId = crypto.randomUUID();

      // 2. Build the Orders Header payload
      const orderData = {
        id: masterOrderId,              // We pass our own ID instead of letting the DB do it
        invoice_number: orderNumber,    // Custom S26... number
        //user_id: currentCashierId,
        total_amount: finalTotal,        
        discount_percentage: discountValue, //the actual final paid amount
        payment_method: paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString(), // Captures the exact offline time
        sales_channel: 'in-store',           // Uses the enum value
      };

      // 3.Order Items payload array
      const orderItemsData = cart.map((item) => {
        const sellingPrice = item.customPrice !== undefined ? item.customPrice : item.price;
        
        return {
          id: crypto.randomUUID(),      // Unique ID for this specific row
          order_id: masterOrderId,      // This perfectly links the item to the parent order
          variant_id: item.id,
          quantity: item.quantity,
          cost_price_at_sale: item.costPrice || 0, // Fallback just in case
          selling_price_at_sale: sellingPrice,
        };
      });

      // 4. Send BOTH payloads to the offline-capable Context engine
      await processOrder(orderData, orderItemsData, cart);

      // 5. Set the timestamp and show the receipt
      setOrderTimestamp(new Date());
      setShowReceipt(true);

    } catch (err: any) {
      console.error("Checkout Error:", err);
      setError("System failure. Please check terminal storage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // When the cashier finishes viewing/printing the receipt
  const handleFinishTransaction = () => {
    clearCart();
    onClose();
  };


  // VIEW 1: THE THERMAL RECEIPT PREVIEW (Shows after successful payment)

  if (showReceipt) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4">
        <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          {/* Virtual Thermal Paper */}
          <div className="bg-white w-80 p-6 shadow-2xl font-mono text-stone-900 relative">
            {/* Paper jagged top edge effect */}
            <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mt-2"></div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-black mb-1">KAA</div>
              <h2 className="font-bold text-sm uppercase">The Kandyan Art Association</h2>
              <p className="text-[10px] text-stone-500">Central Province, Sri Lanka</p>
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
                        <div className="text-[9px] text-stone-500">ID: {item.id.slice(0,8)}</div>
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
              <p className="font-normal mt-1 text-[9px] text-stone-500">Please keep this receipt for your records</p>
            </div>
            
            {/* Paper jagged bottom edge effect */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mb-2 rotate-180"></div>
          </div>

          {/* Action Buttons underneath the paper */}
          <div className="flex gap-4 mt-8 w-80">
            <button 
              onClick={() => alert("Printing simulated. In production, this would trigger the thermal printer.")}
              className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl shadow-lg transition-colors"
            >
              🖨️ Re-Print
            </button>
            <button 
              onClick={handleFinishTransaction}
              className="flex-[2] py-3 bg-amber-700 hover:bg-amber-600 text-white font-black rounded-xl shadow-lg transition-colors"
            >
              NEXT ORDER ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  // VIEW 2: THE STANDARD CHECKOUT MODAL (Shows before payment)
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-stone-800">Checkout</h2>
            <span className="text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-sm">
              #{orderNumber}
            </span>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Content (Two Columns) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column: Order Summary */}
          <div className="w-1/2 p-6 border-r border-stone-200 overflow-y-auto bg-white">
            <h3 className="font-bold text-stone-500 uppercase tracking-wider text-sm mb-4">Order Details</h3>
            <div className="space-y-3">
              {cart.map(item => {
                const itemPrice = item.customPrice !== undefined ? item.customPrice : item.price;
                return (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-stone-100">
                    <div className="flex gap-2">
                      <span className="font-bold text-stone-600">{item.quantity}x</span>
                      <span className="text-stone-800 line-clamp-1">{item.name}</span>
                    </div>
                    <span className="font-medium text-stone-600">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Payment & Discount */}
          <div className="w-1/2 p-6 bg-stone-50 flex flex-col">
            
            <div className="mb-8">
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

            <div className="mb-8">
              <label className="block text-sm font-bold text-stone-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: '💵 Cash' },
                  { id: 'card', label: '💳 Card' },
                  { id: 'bank_transfer', label: '🏦 Bank' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      paymentMethod === method.id 
                        ? 'border-amber-600 bg-amber-50 text-amber-800' 
                        : 'border-stone-200 bg-white text-stone-500 hover:border-amber-300'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-2 mb-6">
              <div className="flex justify-between text-stone-500 font-medium">
                <span>Subtotal:</span>
                <span>Rs. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({discountValue}%):</span>
                  <span>- Rs. {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-stone-200 flex justify-between items-end">
                <span className="text-lg font-bold text-stone-800">Final Total:</span>
                <span className="text-3xl font-black text-amber-700">
                  Rs. {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-bold mb-4 text-center bg-red-50 p-2 rounded">{error}</div>}

            <button 
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white text-xl font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'PROCESSING...' : 'CONFIRM & COMPLETE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}