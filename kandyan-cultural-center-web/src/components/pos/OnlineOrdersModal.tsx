'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';



interface OnlineOrdersModalProps {
  onClose: () => void;
  onOrderProcessed: () => void; // NEW: Callback prop
}


export default function OnlineOrdersModal({ onClose, onOrderProcessed }: OnlineOrdersModalProps) {
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<any | null>(null);

  useEffect(() => {
    const fetchPendingOnlineOrders = async () => {
      try {
        // STEP 1: Fetch the orders (without the profiles join)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              artifact_variants (
                id,
                barcode,
                color_name,
                image_url,
                artifacts ( name )
              )
            )
          `)
          .eq('sales_channel', 'online')
          .eq('status', 'order placed')
          .order('created_at', { ascending: true }); 

        if (ordersError) throw ordersError;

        if (!ordersData || ordersData.length === 0) {
          setOnlineOrders([]);
          setLoading(false);
          return;
        }

        // STEP 2: Extract all unique user_ids from those orders
        const userIds = [...new Set(ordersData
          .map(order => order.user_id)
          .filter(id => id !== null)
        )];

        // STEP 3: Fetch the matching profiles
        let profilesMap: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

          if (!profilesError && profilesData) {
            // Create a quick lookup dictionary: { "uuid-123": "John Doe" }
            profilesMap = profilesData.reduce((acc, profile) => {
              acc[profile.id] = profile.full_name;
              return acc;
            }, {} as Record<string, string>);
          }
        }

        // STEP 4: Attach the names manually to the orders
        const ordersWithNames = ordersData.map(order => ({
          ...order,
          // We attach the name here so your receipt code can easily read it!
          customer_name: order.user_id ? profilesMap[order.user_id] : null
        }));

        setOnlineOrders(ordersWithNames);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOnlineOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const handlePrintAll = () => {
    alert(`Simulating printing all ${onlineOrders.length} online orders. CSS page-breaks will trigger the auto-cutter between each receipt.`);
  };

  const handleMarkAsPrinted = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'reviewed' })
        .eq('id', orderId);

      if (error) throw error;

      // NEW: Tell the parent page to instantly decrement the badge!
      onOrderProcessed();

      setOnlineOrders(prev => prev.filter(o => o.id !== orderId));
      setPrintingOrder(null);
      
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please check your connection.");
    }
  };

  // VIEW 1: THE THERMAL RECEIPT OVERLAY (SINGLE PRINT)
  if (printingOrder) {
    const orderTimestamp = new Date(printingOrder.created_at);
    const finalTotal = printingOrder.total_amount || 0;
    const shippingAmount = Number(printingOrder.shipping_cost) || 0;
    
    const subtotal = printingOrder.order_items?.reduce((sum: number, item: any) => sum + (Number(item.selling_price_at_sale) * Number(item.quantity)), 0) || 0;
    const discountAmount = subtotal * ((Number(printingOrder.discount_percentage) || 0) / 100);

    // DYNAMIC BUYER NAME
    const buyerName = printingOrder.customer_name || printingOrder.profiles?.full_name || 'Online Buyer';

    return (
      <div className="fixed inset-0 z-[80] overflow-y-auto bg-stone-900/80 backdrop-blur-sm">
        <div className="flex min-h-full items-start justify-center p-4 pt-24 pb-12">
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            
            <div className="bg-white w-80 p-6 shadow-2xl font-mono text-stone-900 relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mt-2"></div>
              
              <div className="text-center mb-4 flex flex-col items-center">
                <img src="/logo.png" alt="Kandyan Cultural Centre Logo" className="w-14 h-14 mb-2 object-contain grayscale contrast-125" />
                <h2 className="font-bold text-sm uppercase">Kandyan Cultural Centre</h2>
                <p className="text-[10px] text-stone-500 mt-1">No 72 Sangharaja Mawatha,</p>
                <p className="text-[10px] text-stone-500">Kandy, Sri Lanka</p>
                <p className="text-[10px] text-stone-500 mt-1">+94 81 222 3100</p>
                <p className="text-[10px] text-stone-500">www.kandyanculturalcentre.lk</p>
              </div>

              <div className="border-y-2 border-dashed border-stone-800 py-1.5 mb-4 text-center bg-stone-100">
                <span className="font-black text-sm tracking-widest uppercase">*** ONLINE ORDER ***</span>
              </div>

              <div className="border-b-2 border-dashed border-stone-300 pb-3 mb-3 text-[11px] leading-relaxed">
                <div className="flex justify-between">
                  <span>Ordered: {orderTimestamp.toLocaleDateString()}</span>
                  <span>{orderTimestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">#{printingOrder.invoice_number || printingOrder.id.substring(0,8)}</span>
                </div>
                
                {/* UPDATED: Customer Name and Shipping Details */}
                <div className="mt-3 bg-stone-50 p-2 border border-stone-200 rounded">
                  <span className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Ship To:</span>
                  <span className="block font-black text-stone-900 text-[13px] mb-0.5 tracking-tight uppercase">
                    {buyerName}
                  </span>
                  {printingOrder.shipping_address ? (
                    <p className="whitespace-pre-wrap font-semibold text-stone-800 leading-tight">
                      {printingOrder.shipping_address}
                    </p>
                  ) : (
                    <p className="italic text-stone-500">No address provided</p>
                  )}
                  <p className="font-semibold text-stone-800 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {printingOrder.customer_phone || 'N/A'}
                  </p>
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
                  {printingOrder.order_items?.map((item: any) => {
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

                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>Rs. {shippingAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>

                {Number(printingOrder.discount_percentage) > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Discount</span>
                    <span>- Rs. {discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-black text-sm pt-2 mt-2 border-t-2 border-dashed border-stone-300">
                  <span>TOTAL PAID</span>
                  <span>Rs. {(finalTotal + shippingAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
              
              <div className="text-center mt-8 text-[11px] font-bold pb-2">
                <p>THANK YOU FOR YOUR ORDER</p>
                <p className="font-normal mt-2 text-[9px] text-stone-500 leading-tight">
                  We accept returns within 14 days from the date of purchase. For further details on return and refund policies, please check our website.
                </p>
              </div>

              <div className="absolute bottom-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDQsOCA4LDAiIGZpbGw9IiNlN2U1ZTQiLz48L3N2Zz4=')] -mb-2 rotate-180"></div>
            </div>

            <div className="flex gap-4 mt-8 w-80 shrink-0">
              <button onClick={() => setPrintingOrder(null)} className="flex-[1] py-3 bg-stone-300 hover:bg-stone-400 text-stone-700 font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => handleMarkAsPrinted(printingOrder.id)} className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print & Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: THE QUEUE LIST
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        
        <div className="bg-sky-800 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-700 text-sky-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">Pending Online Orders</h2>
              <p className="text-sky-200 text-xs font-semibold uppercase tracking-wider">Requires Physical Fulfillment</p>
            </div>
          </div>
          <button onClick={onClose} className="text-sky-300 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-stone-50 flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
            </div>
          ) : onlineOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-stone-400">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-semibold text-lg text-stone-600">You're all caught up!</p>
              <p className="text-sm">No pending online orders require fulfillment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {onlineOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const orderDate = new Date(order.created_at);
                
                return (
                  <div key={order.id} className="bg-white border border-sky-200 rounded-xl shadow-sm overflow-hidden transition-all">
                    
                    <div onClick={() => toggleExpand(order.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-sky-50 transition-colors">
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Bill No</span>
                        <span className="font-mono font-bold text-sky-800">{order.invoice_number || order.id.substring(0,8)}</span>
                      </div>
                      
                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Ordered At</span>
                        <span className="font-semibold text-stone-600">
                          {orderDate.toLocaleDateString()} <span className="text-stone-400 text-sm ml-1">{orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Items</span>
                        <span className="font-bold text-stone-700 uppercase text-sm">
                          {order.order_items?.length || 0} Unique Items
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-right w-1/4">
                        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Paid Amount</span>
                        <span className="font-black text-stone-800 text-lg">Rs. {(order.total_amount || 0).toLocaleString()}</span>
                      </div>

                      <div className="ml-4 text-stone-400">
                        <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-sky-50/50 border-t border-sky-100 p-5 px-6 animate-in slide-in-from-top-2 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Fulfillment Checklist</h4>
                          <button 
                            onClick={() => setPrintingOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:border-sky-400 hover:text-sky-700 text-stone-700 font-bold rounded-lg transition-colors text-sm shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Receipt & Mark Done
                          </button>
                        </div>
                        
                        <div className="bg-white border border-stone-200 rounded-lg p-3">
                          {order.order_items?.map((item: any) => {
                            const itemName = item.artifact_variants?.artifacts?.name || `Variant ${item.variant_id?.substring(0,5)}`;
                            const itemBarcode = item.artifact_variants?.barcode || item.variant_id?.substring(0,8);
                            const itemImageUrl = item.artifact_variants?.image_url;
                            const itemColorName = item.artifact_variants?.color_name;
                            
                            return (
                              <div key={item.id} className="flex justify-between items-center text-sm border-b border-stone-100 last:border-0 py-3">
                                <div className="flex items-center gap-4">
                                  
                                  {itemImageUrl ? (
                                    <img 
                                      src={itemImageUrl} 
                                      alt={itemName} 
                                      className="w-12 h-12 object-cover rounded-md border border-stone-200 shadow-sm shrink-0" 
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-stone-100 border border-stone-200 rounded-md flex items-center justify-center text-stone-400 shrink-0">
                                      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                  )}

                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-black text-stone-800 bg-stone-100 px-2 py-0.5 rounded">{item.quantity}x</span>
                                      <span className="text-stone-800 font-bold">{itemName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-stone-400 text-[10px]">{itemBarcode}</span>
                                      {itemColorName && (
                                        <span className="text-[10px] text-stone-500 font-semibold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                                          Color: {itemColorName}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {onlineOrders.length > 0 && (
          <div className="bg-white border-t border-stone-200 p-5 shrink-0 flex justify-between items-center z-10 relative">
            <span className="text-sm font-bold text-stone-600">
              {onlineOrders.length} orders waiting for processing
            </span>
            <button 
              onClick={handlePrintAll}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-xl shadow-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              Print ALL Receipts
            </button>
          </div>
        )}

      </div>
    </div>
  );
}