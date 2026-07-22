'use client';

import { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import CheckoutModal from './CheckoutModal'; 

export default function CartSidebar() {
  const { cart, cartTotal, updateQuantity, removeFromCart, applyCustomPrice, clearCart, orderNumber } = usePOS();
  
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const handleSavePrice = (itemId: string) => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      applyCustomPrice(itemId, numericValue);
    }
    setEditingPriceId(null);
    setEditValue('');
  };

  const handleConfirmClear = () => {
    clearCart();
    setIsClearConfirmOpen(false);
  };

  return (
    <>
      <div className="flex-[1] min-w-[350px] bg-white border-l border-stone-200 p-6 flex flex-col shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)] h-full z-10">
        
        {/* THE HEADER */}
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-stone-100 shrink-0">
          
          <div className="flex items-baseline gap-3">
            <h2 className="text-xl font-bold text-stone-800">Current Order</h2>
            
            <span className="text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-sm">
              #{orderNumber}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
              {cart.length} Items
            </span>
            {cart.length > 0 && (
              <button 
                onClick={() => setIsClearConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-100"
                title="Cancel Entire Order"
              >
                <span>✕</span> Cancel
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
              <span className="text-6xl mb-4">🛒</span>
              <p>Scan or tap items to add</p>
            </div>
          ) : (
            cart.map((item) => {
              const effectivePrice = item.customPrice !== undefined ? item.customPrice : item.price;
              const isEditing = editingPriceId === item.id;

              return (
                <div key={item.id} className="flex flex-col p-4 bg-stone-50 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden">
                  
                  {item.customPrice !== undefined && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    
                    {/* --- NEW: Inline Layout for Name, Barcode, and Color --- */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-4 flex-1">
                      
                      {/* 1. Name (Left) */}
                      <span className="font-bold text-stone-800 text-sm leading-tight">
                        {item.name}
                      </span>
                      
                      {/* 2. Barcode (Middle) */}
                      <span className="text-xs text-stone-500 font-mono tracking-wider">
                        {item.barcode ? item.barcode : 'No Barcode'}
                      </span>
                      
                      {/* 3. Color Dot & Pill (Right) */}
                      {item.color && (
                        <div className="flex items-center gap-1">
                          {item.hexCode && (
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-sm block"
                              style={{ backgroundColor: item.hexCode }}
                            />
                          )}
                          <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            {item.color}
                          </span>
                        </div>
                      )}

                      {item.customPrice !== undefined && (
                        <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          CUSTOM PRICE
                        </span>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditingPriceId(item.id); setEditValue(''); }} className="w-8 h-8 flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg text-xs font-bold transition-colors" title="Edit Manual Price">Rs</button>
                        
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-1 font-black text-sm" title="Remove item">✕</button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2 bg-white p-2 rounded-lg border border-purple-200 shadow-inner">
                      <span className="text-xs font-bold text-stone-500">New Rs:</span>
                      <input 
                        type="number" 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 w-full bg-stone-50 border border-stone-200 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="e.g. 1200"
                        autoFocus
                      />
                      <button onClick={() => handleSavePrice(item.id)} className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-purple-700">Save</button>
                      <button onClick={() => setEditingPriceId(null)} className="bg-stone-200 text-stone-600 px-2 py-1 rounded text-xs font-bold hover:bg-stone-300">✕</button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 disabled:opacity-50 rounded font-black text-stone-600 transition-colors">−</button>
                        <span className="font-bold text-stone-800 w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded font-black text-stone-600 transition-colors">+</button>
                      </div>

                      <div className="flex flex-col items-end">
                        {item.customPrice !== undefined ? (
                           <span className="text-xs text-stone-400 line-through mb-0.5">@ Rs. {item.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-xs text-stone-400 font-semibold mb-0.5">@ Rs. {item.price.toLocaleString()}</span>
                        )}
                        <span className="font-black text-amber-700 text-lg">
                          Rs. {(effectivePrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4 pt-6 border-t border-stone-200 shrink-0 bg-white">
          <div className="flex justify-between items-end mb-6">
            <span className="text-lg font-bold text-stone-500 uppercase tracking-wider">Subtotal</span>
            <span className="text-4xl font-black text-stone-900">
              Rs. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <button 
            disabled={cart.length === 0} 
            onClick={() => setIsCheckoutOpen(true)} 
            className="w-full py-5 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-white text-2xl font-black rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3"
          >
            CHECKOUT <span className="text-3xl leading-none">→</span>
          </button>
        </div>
      </div>

      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}

      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Cancel Order?</h3>
              <p className="text-stone-500 text-sm">
                Are you sure you want to clear all {cart.length} items from the current transaction? This cannot be undone.
              </p>
            </div>
            
            <div className="flex border-t border-stone-200">
              <button 
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 py-4 font-bold text-stone-600 hover:bg-stone-50 transition-colors border-r border-stone-200"
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmClear}
                className="flex-1 py-4 font-black text-red-600 hover:bg-red-50 transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}