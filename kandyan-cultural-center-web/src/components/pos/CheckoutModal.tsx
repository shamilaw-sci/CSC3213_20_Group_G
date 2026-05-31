'use client';

import { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { supabase } from '../../lib/supabase';

interface CheckoutModalProps {
  onClose: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const { cart, cartTotal, clearCart } = usePOS();
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate final numbers
  const discountValue = parseFloat(discountPercent) || 0;
  const discountAmount = cartTotal * (discountValue / 100);
  const finalTotal = cartTotal - discountAmount;

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Prepare the order record for 'orders' table
      const orderData = {
        total_amount: cartTotal,
        discount_percentage: discountValue,
        final_amount: finalTotal,
        payment_method: paymentMethod,
        status: 'completed',
        // cashier_id: 'emp-101', // if the DB requires tracking who made the sale
      };

      // 2. Insert into Supabase (Update 'orders' to match your actual table name)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. (Optional but recommended) Insert the individual items into an 'order_items' table
      /* const itemsData = cart.map(item => ({
        order_id: order.id,
        variant_id: item.id,
        quantity: item.quantity,
        price_at_time: item.customPrice || item.price
      }));
      await supabase.from('order_items').insert(itemsData);
      */

      // 4. Success! Clear the cart and close the modal
      clearCart(); // You will need to add a simple clearCart() function to your POSContext
      onClose();
      alert("Order confirmed and saved to database!");

    } catch (err: any) {
      console.error("Checkout Error:", err);
      setError("Failed to save order to database. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-stone-200 bg-stone-50">
          <h2 className="text-2xl font-black text-stone-800">Checkout</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full font-bold transition-colors"
          >
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
            
            {/* Bill Discount Input */}
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

            {/* Payment Methods */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-stone-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: '💵 Cash' },
                  { id: 'card', label: '💳 Card' },
                  { id: 'bank_transfer', label: '🏦 Bank Transfer' }
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

            {/* Total Breakdown */}
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

            {/* Confirm Button */}
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