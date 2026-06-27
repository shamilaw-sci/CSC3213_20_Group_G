'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import InventoryList from './InventoryList';
import InventoryModals from './InventoryModals';

export default function InventoryPage() {
  // Data States
  const [variants, setVariants] = useState<any[]>([]);
  const [parentArtifacts, setParentArtifacts] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  // UI States
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal Controller States
  const [modalMode, setModalMode] = useState<'closed' | 'parent' | 'variant' | 'edit'>('closed');
  const [editData, setEditData] = useState<any>(null);

  // Derived unique categories for the Datalist
  const distinctCategories = useMemo(() => {
    const cats = parentArtifacts.map(a => a.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [parentArtifacts]);

  // Fetch Data
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

    return result;
  }, [variants, searchQuery, filterCategory, filterStock]);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Actions passed to List
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
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto w-full relative">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Inventory Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Manage artifacts, variants, and barcodes.</p>
        </div>
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => setModalMode('variant')} className="bg-white border border-slate-200 hover:text-amber-600 px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
            + Add Variant SKU
          </button>
          <button onClick={() => setModalMode('parent')} className="bg-slate-900 text-white hover:bg-amber-600 px-6 py-3 rounded-xl font-bold transition-all shadow-md">
            + Add Base Artifact
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Search by Name, Color, or Barcode..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 md:w-48">
          <option value="All">All Categories</option>
          {distinctCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 md:w-48">
          <option value="All">All Stock Levels</option>
          <option value="Low">Low Stock (≤ 5)</option>
          <option value="Out">Out of Stock</option>
        </select>
      </div>

      {/* Floating Alert */}
      {message.text && (
        <div className={`fixed top-8 right-8 p-4 rounded-xl shadow-2xl z-[80] text-sm font-bold text-white animate-in slide-in-from-right-8 duration-300 ${message.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>
          {message.text}
        </div>
      )}

      {/* List Component */}
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

      {/* Modals Component */}
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