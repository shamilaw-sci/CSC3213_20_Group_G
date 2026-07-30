'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface HistoryModalProps {
  onClose: () => void;
}

export default function HistoryModal({ onClose }: HistoryModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayHistory = async () => {
      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const isoStartOfToday = startOfToday.toISOString();

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              artifact_variants (
                id,
                barcode,
                artifacts ( name )
              )
            )
          `)
          .eq('sales_channel', 'in-store')   
          .gte('created_at', isoStartOfToday) 
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // --- NEW: FOOTER CALCULATIONS ---
  const totalCheckouts = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalItemsSold = orders.reduce((sum, order) => {
    const itemsCount = order.order_items?.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0) || 0;
    return sum + itemsCount;
  }, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-stone-800 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-700 text-stone-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">Today's Transactions</h2>
              <p className="text-stone-400 text-xs font-semibold uppercase tracking-wider">End of Day Reconciliation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body / List */}
        <div className="p-6 overflow-y-auto bg-stone-50 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-stone-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              <p className="font-semibold text-lg text-stone-600">No transactions yet today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const orderTime = new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div key={order.id} className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden transition-all">
                    
                    <div onClick={() => toggleExpand(order.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors">
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Order No.</span>
                        <span className="font-mono font-bold text-stone-800">{order.invoice_number || order.id.substring(0,8)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Time</span>
                        <span className="font-semibold text-stone-600">{orderTime}</span>
                      </div>

                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Payment</span>
                        <span className="font-bold text-emerald-600 uppercase text-sm">
                          {order.payment_method || order.payment_type || 'CASH'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-right w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Paid Amount</span>
                        <span className="font-black text-amber-700 text-lg">Rs. {(order.total_amount || 0).toLocaleString()}</span>
                        {order.discount_percentage > 0 && (
                          <span className="text-[10px] text-purple-600 font-bold tracking-wide">
                            {order.discount_percentage}% OFF APPLIED
                          </span>
                        )}
                      </div>

                      <div className="ml-4 text-stone-400">
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-stone-50 border-t border-stone-200 p-5 px-6 animate-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Receipt Breakdown</h4>
                        
                        <div className="space-y-2 mb-4">
                          {order.order_items && order.order_items.length > 0 ? (
                            order.order_items.map((item: any) => {
                              const itemName = item.artifact_variants?.artifacts?.name || `Variant ${item.variant_id?.substring(0,5)}`;
                              const itemBarcode = item.artifact_variants?.barcode || item.variant_id?.substring(0,8);
                              
                              return (
                                <div key={item.id} className="flex justify-between items-center text-sm border-b border-stone-200/60 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-800">{item.quantity}x</span>
                                    <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono border border-stone-200">
                                      {itemBarcode}
                                    </span>
                                    <span className="text-stone-600">{itemName}</span>
                                  </div>
                                  <span className="font-mono text-stone-500 font-medium">
                                    Rs. {(item.selling_price_at_sale * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-sm text-stone-400 italic">No item details found.</div>
                          )}
                        </div>

                        <div className="flex justify-end pt-2">
                          <div className="w-1/2 bg-white border border-stone-200 p-3 rounded-lg shadow-inner">
                            {(() => {
                              const finalTotal = order.total_amount || 0;
                              const subtotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.selling_price_at_sale * item.quantity), 0) || finalTotal;
                              const discountAmount = subtotal - finalTotal;

                              return (
                                <>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-stone-500 font-semibold">Subtotal</span>
                                    <span className="font-mono text-stone-700">Rs. {subtotal.toLocaleString()}</span>
                                  </div>
                                  {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm mb-2 text-purple-600">
                                      <span className="font-semibold">Discount ({order.discount_percentage}%)</span>
                                      <span className="font-mono">- Rs. {discountAmount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-base border-t border-stone-200 pt-2">
                                    <span className="font-black text-stone-800">Final Total</span>
                                    <span className="font-black font-mono text-amber-700">Rs. {finalTotal.toLocaleString()}</span>
                                  </div>
                                </>
                              );
                            })()}
                          </div> 
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- NEW: DASHBOARD FOOTER --- */}
        <div className="bg-stone-800 p-5 shrink-0 flex justify-between items-center z-10 relative">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Checkouts</span>
              <span className="text-xl font-black text-white">{totalCheckouts}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Items Sold</span>
              <span className="text-xl font-black text-white">{totalItemsSold}</span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Daily Revenue</span>
            <span className="text-2xl font-black text-amber-500">Rs. {totalRevenue.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}