'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'online' | 'in-store'>('online');
  
  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch Orders with their items and artifact details
    const { data: fetchedOrders } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*, artifact_variants (color_name, image_url, artifacts (name)))
      `)
      .order('created_at', { ascending: false });
      
    if (fetchedOrders) setOrders(fetchedOrders);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders based on the active tab
  const filteredOrders = orders.filter(order => order.sales_channel === activeTab);

  // Reusable Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-wider font-bold ${
      status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
      status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
    }`}>
      {status}
    </span>
  );

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Order History</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Review your online shipments and in-store purchase records.</p>
        </div>
        
        {/* Channel Tab Switcher */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('online')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'online' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
            Online Orders
          </button>
          <button 
            onClick={() => setActiveTab('in-store')}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'in-store' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            In-Store
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center text-slate-500 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
          </div>
          <p className="text-sm">No {activeTab} records found.</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          
          {/* ================== MOBILE CARD LAYOUT (< md) ================== */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                
                {/* Mobile Card Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">#{order.id.split('-')[0]}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Mobile Order Items */}
                <div className="space-y-3 mb-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                        {item.artifact_variants?.image_url && <Image src={item.artifact_variants.image_url} alt="Item" fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{item.artifact_variants?.artifacts?.name || 'Unknown Item'}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{item.artifact_variants?.color_name} <span className="font-bold text-slate-400">× {item.quantity}</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Card Footer */}
                <div className="flex justify-between items-center bg-slate-50 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
                  <span className="font-black text-slate-900 text-sm">LKR {order.total_amount?.toLocaleString() || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ================== DESKTOP TABLE LAYOUT (>= md) ================== */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Order ID / Date</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 truncate w-32">{order.id.split('-')[0]}...</div>
                      <div className="text-xs text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                              {item.artifact_variants?.image_url && <Image src={item.artifact_variants.image_url} alt="Item" fill className="object-cover" />}
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-slate-900 line-clamp-1">{item.artifact_variants?.artifacts?.name || 'Unknown Item'}</p>
                              <p className="text-slate-500 mt-0.5">{item.artifact_variants?.color_name} <span className="font-bold text-slate-400">× {item.quantity}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      LKR {order.total_amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}