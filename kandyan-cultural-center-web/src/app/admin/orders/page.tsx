'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'online' | 'in-store'>('online');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert(`Failed to update status: ${error.message}`);
      fetchData(); 
    }
    
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter(order => (order.sales_channel || 'online') === activeTab);

  const statusOptions = [
    { value: 'pending', label: 'Pending Payment', color: 'bg-white/60 text-slate-700 border-white/80' },
    { value: 'processing', label: 'Processing', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'completed', label: 'Paid / Preparing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'handed to courier', label: 'Handed to Courier', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  ];

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    const config = statusOptions.find(opt => opt.value === s);
    return config ? config.color : 'bg-white/60 text-slate-700 border-white/80';
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full relative z-10">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">Review orders and update delivery tracking states.</p>
        </div>
        
        <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-[1.25rem] border border-white/80 w-full sm:w-auto overflow-x-auto no-scrollbar shadow-sm">
          <button 
            onClick={() => setActiveTab('online')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'online' ? 'bg-white text-amber-600 shadow-[0_4px_10px_rgba(217,119,6,0.1)]' : 'text-slate-600 hover:text-amber-600 hover:bg-white/50'
            }`}
          >
            Online Deliveries
          </button>
          <button 
            onClick={() => setActiveTab('in-store')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'in-store' ? 'bg-white text-amber-600 shadow-[0_4px_10px_rgba(217,119,6,0.1)]' : 'text-slate-600 hover:text-amber-600 hover:bg-white/50'
            }`}
          >
            In-Store POS
          </button>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-sm p-16 text-center text-slate-500 animate-in fade-in duration-300">
          <p className="text-lg font-bold">No {activeTab} records found.</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 border-b border-white/60 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
                <tr>
                  <th className="px-6 py-5 pl-8">Order ID / Details</th>
                  <th className="px-6 py-5">Purchased Items</th>
                  <th className="px-6 py-5">Total Amount</th>
                  <th className="px-6 py-5 w-64 pr-8">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-5 pl-8 align-top">
                      <div className="font-black text-slate-900 truncate w-32 text-base">#{order.id.split('-')[0]}</div>
                      <div className="text-xs font-bold text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-600 mt-3 max-w-[150px] leading-relaxed font-medium bg-white/40 p-2 rounded-lg border border-white/60">
                        {order.shipping_address || 'No address provided'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-3">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white/40 p-2 rounded-2xl border border-white/60 shadow-sm w-max pr-6">
                            <div className="w-12 h-12 rounded-[0.8rem] bg-slate-50 overflow-hidden relative shrink-0 border border-white">
                              {item.artifact_variants?.image_url && <Image src={item.artifact_variants.image_url} alt="Item" fill className="object-cover" />}
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-slate-900 line-clamp-1">{item.artifact_variants?.artifacts?.name || 'Unknown Item'}</p>
                              <p className="text-slate-600 mt-0.5 font-medium">{item.artifact_variants?.color_name} <span className="font-bold text-amber-600 ml-1">× {item.quantity}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-900 align-top text-base">
                      LKR {order.total_amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-5 pr-8 align-top">
                      {/* DYNAMIC STATUS SELECTOR */}
                      <div className="relative">
                        <select
                          value={order.status.toLowerCase()}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`appearance-none w-full border backdrop-blur-md px-4 py-3 pr-8 rounded-xl text-xs font-black uppercase tracking-wider outline-none cursor-pointer transition-colors shadow-sm ${getStatusColor(order.status)} ${updatingId === order.id ? 'opacity-50' : 'hover:brightness-95 focus:ring-2 focus:ring-amber-400 focus:border-amber-400'}`}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-white text-slate-900 normal-case tracking-normal font-bold">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current opacity-60">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
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