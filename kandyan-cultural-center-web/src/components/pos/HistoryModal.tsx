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
  
  const [reprintOrder, setReprintOrder] = useState<any | null>(null);

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

  // FOOTER CALCULATIONS 
  const totalCheckouts = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const totalItemsSold = orders.reduce((sum, order) => {
    const itemsCount = order.order_items?.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0) || 0;
    return sum + itemsCount;
  }, 0);

  // THERMAL REPRINT OVERLAY
  if (reprintOrder) {
    const orderTimestamp = new Date(reprintOrder.created_at);
    const finalTotal = reprintOrder.total_amount || 0;
    const subtotal = reprintOrder.order_items?.reduce((sum: number, item: any) => sum + (item.selling_price_at_sale * item.quantity), 0) || finalTotal;
    const discountAmount = subtotal - finalTotal;
    const paymentMethod = reprintOrder.payment_method || 'CASH';

    return (
      <div className="fixed inset-0 z-[80] overflow-y-auto bg-stone-900/80 backdrop-blur-sm">
        <div className="flex min-h-full items-start justify-center p-4 pt-24 pb-12">
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            
            <div className="bg-white w-80 p-6 shadow-2xl font-mono text-stone-900 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mt-2"></div>
              
              <div className="text-center mb-4 flex flex-col items-center">
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

              <div className="border-y-2 border-dashed border-stone-800 py-1.5 mb-4 text-center">
                <span className="font-black text-sm tracking-widest uppercase">*** DUPLICATE / REPRINT ***</span>
              </div>

              <div className="border-b-2 border-dashed border-stone-300 pb-3 mb-3 text-[11px] leading-relaxed">
                <div className="flex justify-between">
                  <span>Orig. Date: {orderTimestamp.toLocaleDateString()}</span>
                  <span>{orderTimestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{reprintOrder.invoice_number || reprintOrder.id.substring(0,8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>Admin Reprint</span>
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
                  {reprintOrder.order_items?.map((item: any) => {
                    const itemName = item.artifact_variants?.artifacts?.name || `Variant ${item.variant_id?.substring(0,5)}`;
                    const itemBarcode = item.artifact_variants?.barcode || item.variant_id?.substring(0,8);
                    
                    return (
                      <tr key={item.id}>
                        <td className="py-2 pr-2">
                          <div className="font-bold">{itemName}</div>
                          <div className="text-[9px] text-stone-500">Barcode: {itemBarcode}</div>
                        </td>
                        <td className="py-2 px-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">{(item.selling_price_at_sale * item.quantity).toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="border-t-2 border-dashed border-stone-300 pt-3 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                {reprintOrder.discount_percentage > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount ({reprintOrder.discount_percentage}%)</span>
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
                onClick={() => setReprintOrder(null)}
                className="flex-[1] py-3 bg-stone-300 hover:bg-stone-400 text-stone-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => alert("Printing simulated. This would trigger the hardware thermal printer.")}
                className="flex-[2] py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Send to Printer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HISTORY LIST
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-emerald-800 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 text-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">Today's Transactions</h2>
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">End of Day Reconciliation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-stone-50 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
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
                  <div key={order.id} className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden transition-all">
                    
                    <div onClick={() => toggleExpand(order.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors">
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Order No.</span>
                        <span className="font-mono font-bold text-emerald-800">{order.invoice_number || order.id.substring(0,8)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Time</span>
                        <span className="font-semibold text-stone-600">{orderTime}</span>
                      </div>

                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Payment</span>
                        <span className="font-bold text-stone-600 uppercase text-sm">
                          {order.payment_method || order.payment_type || 'CASH'}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-right w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Paid Amount</span>
                        <span className="font-black text-stone-800 text-lg">Rs. {(order.total_amount || 0).toLocaleString()}</span>
                        {order.discount_percentage > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold tracking-wide">
                            {order.discount_percentage}% OFF APPLIED
                          </span>
                        )}
                      </div>

                      <div className="ml-4 text-stone-400">
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-emerald-50/50 border-t border-emerald-100 p-5 px-6 animate-in slide-in-from-top-2 flex flex-col">
                        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Receipt Breakdown</h4>
                        
                        <div className="space-y-2 mb-4 flex-1">
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

                        {/* Totals & Actions Block */}
                        <div className="flex justify-between items-end pt-2">
                          
                          <button 
                            onClick={() => setReprintOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-emerald-400 hover:text-emerald-700 text-stone-700 font-bold rounded-lg transition-colors text-sm shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Receipt
                          </button>

                          {/* Calculation Box */}
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
                                    <div className="flex justify-between text-sm mb-2 text-emerald-600">
                                      <span className="font-semibold">Discount ({order.discount_percentage}%)</span>
                                      <span className="font-mono">- Rs. {discountAmount.toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-base border-t border-stone-200 pt-2">
                                    <span className="font-black text-stone-800">Final Total</span>
                                    <span className="font-black font-mono text-emerald-700">Rs. {finalTotal.toLocaleString()}</span>
                                  </div>
                                  
                                  {/* Commission (for Admins) */}
                                  {order.commission > 0 && (
                                    <div className="flex justify-between text-sm mt-3 pt-2 border-t border-dashed border-stone-200 text-blue-600">
                                      <span className="font-bold">Guide Commission Paid</span>
                                      <span className="font-mono font-bold">Rs. {(order.commission || 0).toLocaleString()}</span>
                                    </div>
                                  )}
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

        {/* DASHBOARD FOOTER */}
        <div className="bg-white border-t border-stone-200 p-5 shrink-0 flex justify-between items-center z-10 relative">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Checkouts</span>
              <span className="text-xl font-black text-stone-800">{totalCheckouts}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Items Sold</span>
              <span className="text-xl font-black text-stone-800">{totalItemsSold}</span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Daily Revenue</span>
            <span className="text-2xl font-black text-emerald-600">Rs. {totalRevenue.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </div>
  );
}