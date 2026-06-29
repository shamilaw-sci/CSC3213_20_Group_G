'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import InventoryList from './InventoryList';
import InventoryModals from './InventoryModals';

export default function InventoryPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [parentArtifacts, setParentArtifacts] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW STACKED FILTERS
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');

  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [modalMode, setModalMode] = useState<'closed' | 'parent' | 'variant' | 'edit'>('closed');
  const [editData, setEditData] = useState<any>(null);

  const distinctCategories = useMemo(() => {
    const cats = parentArtifacts.map(a => a.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [parentArtifacts]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: vData } = await supabase.from('artifact_variants').select('*, artifacts (*), artisans (name)').order('created_at', { ascending: false });
    if (vData) setVariants(vData);

    const { data: aData } = await supabase.from('artifacts').select('*').order('name');
    if (aData) setParentArtifacts(aData);

    const { data: artData } = await supabase.from('artisans').select('id, name').order('name');
    if (artData) setArtisans(artData);

    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Filter Engine
  const processedVariants = useMemo(() => {
    let result = [...variants];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.artifacts?.name?.toLowerCase().includes(q) || 
        v.color_name?.toLowerCase().includes(q) ||
        v.barcode?.toLowerCase().includes(q)
      );
    }
    
    if (filterCategory !== 'All') {
      result = result.filter(v => v.artifacts?.category === filterCategory);
    }
    
    if (filterStock === 'Low') {
      result = result.filter(v => v.stock > 0 && v.stock <= 5);
    } else if (filterStock === 'Out') {
      result = result.filter(v => v.stock === 0);
    }

    if (filterPrice !== 'All') {
      if (filterPrice === '<5000') result = result.filter(v => v.price < 5000);
      if (filterPrice === '5000-15000') result = result.filter(v => v.price >= 5000 && v.price <= 15000);
      if (filterPrice === '>15000') result = result.filter(v => v.price > 15000);
    }

    return result;
  }, [variants, searchQuery, filterCategory, filterStock, filterPrice]);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSaveRow = async (variant: any) => {
    setSavingId(variant.id);
    const { error } = await supabase.from('artifact_variants').update({
      stock: parseInt(variant.stock), cost_price: parseFloat(variant.cost_price),
      price: parseFloat(variant.price), discounted_price: variant.discounted_price ? parseFloat(variant.discounted_price) : null
    }).eq('id', variant.id);

    if (error) showMessage('error', 'Failed to update quick stats.');
    else showMessage('success', 'Stats updated successfully.');
    setSavingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this variant?")) return;
    const { error } = await supabase.from('artifact_variants').delete().eq('id', id);
    if (error) showMessage('error', 'Delete failed: ' + error.message);
    else {
      showMessage('success', 'Variant deleted successfully.');
      fetchData();
    }
  };

  const openEditModal = (variantData: any) => {
    setEditData(variantData);
    setModalMode('edit');
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto w-full relative z-10">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Inventory Setup</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">Manage artifacts, variants, and barcodes.</p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => setModalMode('variant')} className="bg-white/60 hover:bg-white backdrop-blur-md border border-white/80 text-slate-700 hover:text-amber-600 px-6 py-3.5 rounded-[1.25rem] font-bold transition-all shadow-sm">
            + Add Variant SKU
          </button>
          <button onClick={() => setModalMode('parent')} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3.5 rounded-[1.25rem] font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-0.5">
            + Add Base Artifact
          </button>
        </div>
      </div>

      {/* FILTER BAR UPGRADED TO GLASSMORPHISM */}
      <div className="bg-white/40 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-sm mb-8 flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="relative flex-grow min-w-[250px]">
          <input 
            type="text" 
            placeholder="Search Name or Barcode..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-white/60 border border-white/80 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm placeholder:text-slate-400" 
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white/60 border border-white/80 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-auto shadow-sm appearance-none pr-10 cursor-pointer relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat">
          <option value="All" className="bg-white">All Categories</option>
          {distinctCategories.map((c) => <option key={c} value={c} className="bg-white">{c}</option>)}
        </select>

        <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="bg-white/60 border border-white/80 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-auto shadow-sm appearance-none pr-10 cursor-pointer relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat">
          <option value="All" className="bg-white">All Stock Levels</option>
          <option value="Low" className="bg-white">Low Stock (≤ 5)</option>
          <option value="Out" className="bg-white">Out of Stock</option>
        </select>

        <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="bg-white/60 border border-white/80 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-auto shadow-sm appearance-none pr-10 cursor-pointer relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat">
          <option value="All" className="bg-white">All Prices</option>
          <option value="<5000" className="bg-white">Under LKR 5,000</option>
          <option value="5000-15000" className="bg-white">LKR 5k - 15k</option>
          <option value=">15000" className="bg-white">Over LKR 15,000</option>
        </select>
      </div>

      {message.text && (
        <div className={`fixed top-8 right-8 p-4 rounded-xl shadow-2xl z-[80] text-sm font-bold text-white animate-in slide-in-from-right-8 duration-300 ${message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : (
        <InventoryList 
          variants={processedVariants} 
          setVariants={setVariants} 
          onSaveRow={handleSaveRow} 
          onEdit={openEditModal} 
          onDelete={handleDelete}
          savingId={savingId}
        />
      )}

      <InventoryModals 
        isOpen={modalMode !== 'closed'} 
        mode={modalMode} 
        editData={editData}
        onClose={() => setModalMode('closed')} 
        onRefresh={fetchData} 
        parentArtifacts={parentArtifacts} 
        artisans={artisans}
        distinctCategories={distinctCategories}
      />
    </div>
  );
}