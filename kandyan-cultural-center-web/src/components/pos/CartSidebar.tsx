'use client';

import { useState } from 'react';
import Image from 'next/image';
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
      <div className="flex-[1] w-full min-w-0 md:min-w-[350px] bg-white md:border-l border-stone-200 p-4 md:p-6 flex flex-col shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)] h-full z-10">
        
        {/* --- RESPONSIVE HEADER --- */}
        <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-2 mb-4 md:mb-6 pb-4 border-b border-stone-100 shrink-0">
          
          <div className="flex items-center flex-wrap gap-2 md:gap-3">
            <h2 className="text-lg md:text-xl font-bold text-stone-800 whitespace-nowrap">Current Order</h2>
            <span className="text-xs md:text-sm font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shadow-sm whitespace-nowrap">
              #{orderNumber}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-semibold text-stone-400 bg-stone-100 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
              {cart.length} Items
            </span>
            {cart.length > 0 && (
              <button 
                onClick={() => setIsClearConfirmOpen(true)}
                className="flex items-center gap-1.5 px-2 md:px-3 py-1 text-xs md:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-100 whitespace-nowrap"
                title="Cancel Entire Order"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 opacity-60">
              <div className="mb-4 text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
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
                    
                    {/* --- Image & Details Layout --- */}
                    <div className="flex items-start gap-3 pr-2 flex-1 min-w-0">
                      
                      {/* 1. Image Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0 relative flex items-center justify-center shadow-sm text-lg">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <span className="opacity-40">📦</span>
                        )}
                      </div>

                      {/* 2. Stacked Text Details */}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0 pt-0.5">
                        <span className="font-bold text-stone-800 text-sm leading-tight truncate">
                          {item.name}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[10px] text-stone-500 font-mono tracking-wider border border-stone-200 px-1.5 py-0.5 rounded bg-white">
                            {item.barcode ? item.barcode : 'No Barcode'}
                          </span>
                          
                          {item.color && (
                            <div className="flex items-center gap-1">
                              {item.hexCode && (
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-stone-300 shadow-inner block shrink-0"
                                  style={{ backgroundColor: item.hexCode }}
                                />
                              )}
                              <span className="text-[10px] font-bold bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                                {item.color}
                              </span>
                            </div>
                          )}

                          {item.customPrice !== undefined && (
                            <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              CUSTOM PRICE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 🚨 RESTORED: Edit Custom Price & Remove Buttons */}
                    {!isEditing && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button 
                          onClick={() => { setEditingPriceId(item.id); setEditValue(''); }} 
                          className="w-8 h-8 flex items-center justify-center bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg transition-colors" 
                          title="Edit Manual Price"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-1" 
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
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
                      <button onClick={() => setEditingPriceId(null)} className="bg-stone-200 text-stone-600 px-2 py-1 rounded hover:bg-stone-300 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-1 bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-stone-200 text-stone-600 hover:bg-amber-100 hover:text-amber-700 disabled:bg-stone-100 disabled:text-stone-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="font-bold text-stone-800 w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className={`w-8 h-8 flex items-center justify-center transition-colors ${
                            item.stock !== undefined && item.quantity >= item.stock 
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                              : 'bg-stone-200 text-stone-600 hover:bg-amber-100 hover:text-amber-700' 
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex flex-col items-end pl-2">
                        {item.customPrice !== undefined ? (
                           <span className="text-[10px] md:text-xs text-stone-400 line-through mb-0.5">@ Rs. {item.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-[10px] md:text-xs text-stone-400 font-semibold mb-0.5">@ Rs. {item.price.toLocaleString()}</span>
                        )}
                        <span className="font-black text-amber-700 text-base md:text-lg">
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
        
        <div className="mt-4 pt-4 md:pt-6 border-t border-stone-200 shrink-0 bg-white">
          <div className="flex justify-between items-end mb-4 md:mb-6">
            <span className="text-sm md:text-lg font-bold text-stone-500 uppercase tracking-wider">Subtotal</span>
            <span className="text-2xl md:text-4xl font-black text-stone-900 truncate pl-2">
              Rs. {cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <button 
            disabled={cart.length === 0} 
            onClick={() => setIsCheckoutOpen(true)} 
            className="w-full py-4 md:py-5 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-white text-xl md:text-2xl font-black rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 md:gap-3"
          >
            CHECKOUT 
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
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
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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