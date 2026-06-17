'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

export default function InventoryPage() {
  // Main Data States
  const [variants, setVariants] = useState<any[]>([]);
  const [parentArtifacts, setParentArtifacts] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal States
  const [isArtifactModalOpen, setIsArtifactModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [editingArtifactId, setEditingArtifactId] = useState<string | null>(null);

  // Form States
  const defaultArtifactForm = { name: '', category: 'Masks', description: '', material: '', historical_info: '', gallery_image: '' };
  const [artifactForm, setArtifactForm] = useState(defaultArtifactForm);
  
  const defaultVariantForm = { artifact_id: '', artisan_id: '', color_name: '', hex_code: '#000000', cost_price: '', price: '', stock: '0', image_url: '', weight: '', dimensions: '' };
  const [variantForm, setVariantForm] = useState(defaultVariantForm);

  // Fetch all necessary data
  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: variantData } = await supabase
      .from('artifact_variants')
      .select('*, artifacts (id, name, category, description, historical_info, material, gallery_images), artisans (name)')
      .order('created_at', { ascending: false });
    if (variantData) setVariants(variantData);

    const { data: artifactData } = await supabase.from('artifacts').select('*').order('name');
    if (artifactData) setParentArtifacts(artifactData);

    const { data: artisanData } = await supabase.from('artisans').select('id, name').order('name');
    if (artisanData) setArtisans(artisanData);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Inline Row Save (Variant Data)
  const handleSaveRow = async (variant: any) => {
    setSavingId(variant.id);
    const { error } = await supabase
      .from('artifact_variants')
      .update({
        stock: parseInt(variant.stock),
        cost_price: parseFloat(variant.cost_price),
        price: parseFloat(variant.price),
        discounted_price: variant.discounted_price ? parseFloat(variant.discounted_price) : null
      })
      .eq('id', variant.id);

    if (error) showMessage('error', 'Failed to update variant.');
    else showMessage('success', `Updated ${variant.artifacts.name} (${variant.color_name}).`);
    setSavingId(null);
  };

  // Open Edit Artifact Modal
  const openEditArtifact = (artifact: any) => {
    setEditingArtifactId(artifact.id);
    setArtifactForm({
      name: artifact.name,
      category: artifact.category,
      description: artifact.description || '',
      material: artifact.material || '',
      historical_info: artifact.historical_info || '',
      gallery_image: artifact.gallery_images?.[0] || ''
    });
    setIsArtifactModalOpen(true);
  };

  // Handle Add/Edit Parent Artifact
  const handleSaveArtifact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingModal(true);
    
    const payload = {
      name: artifactForm.name,
      category: artifactForm.category,
      description: artifactForm.description,
      material: artifactForm.material,
      historical_info: artifactForm.historical_info,
      gallery_images: artifactForm.gallery_image ? [artifactForm.gallery_image] : []
    };

    let error;
    if (editingArtifactId) {
      const { error: updateError } = await supabase.from('artifacts').update(payload).eq('id', editingArtifactId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('artifacts').insert(payload);
      error = insertError;
    }

    setIsSubmittingModal(false);
    if (error) {
      showMessage('error', error.message);
    } else {
      showMessage('success', `Parent Artifact ${editingArtifactId ? 'updated' : 'created'} successfully!`);
      setIsArtifactModalOpen(false);
      setEditingArtifactId(null);
      setArtifactForm(defaultArtifactForm);
      fetchData(); 
    }
  };

  // Handle Add Variant
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.image_url) return showMessage('error', 'An image is required for a variant.');
    setIsSubmittingModal(true);

    const { error } = await supabase.from('artifact_variants').insert({
      artifact_id: variantForm.artifact_id,
      artisan_id: variantForm.artisan_id || null, 
      color_name: variantForm.color_name,
      hex_code: variantForm.hex_code,
      cost_price: parseFloat(variantForm.cost_price),
      price: parseFloat(variantForm.price),
      stock: parseInt(variantForm.stock),
      image_url: variantForm.image_url,
      weight: variantForm.weight,
      dimensions: variantForm.dimensions
    });

    setIsSubmittingModal(false);
    if (error) {
      showMessage('error', error.message);
    } else {
      showMessage('success', 'Variant SKU added successfully!');
      setIsVariantModalOpen(false);
      setVariantForm(defaultVariantForm);
      fetchData();
    }
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto relative w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Inventory Management</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Manage stock, edit parent details, and adjust pricing.</p>
        </div>
        
        <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={() => setIsVariantModalOpen(true)} className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-200 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Variant
          </button>
          <button onClick={() => { setEditingArtifactId(null); setArtifactForm(defaultArtifactForm); setIsArtifactModalOpen(true); }} className="w-full sm:w-auto bg-slate-900 hover:bg-amber-600 text-white px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm sm:text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Parent Artifact
          </button>
        </div>
      </div>

      {/* Floating Alert */}
      {message.text && (
        <div className={`fixed top-4 sm:top-8 right-4 sm:right-8 p-4 rounded-xl shadow-2xl z-[60] text-xs sm:text-sm font-bold flex items-center gap-3 animate-in slide-in-from-right-8 duration-300 ${message.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : (
        <div className="animate-in fade-in duration-300">
          
          {/* ================== MOBILE CARD LAYOUT (< md) ================== */}
          <div className="md:hidden space-y-4">
            {variants.map((v) => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                
                {/* Product Info */}
                <div className="flex items-start gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                    {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 text-sm truncate pr-2">{v.artifacts?.name}</p>
                      <button onClick={() => openEditArtifact(v.artifacts)} className="text-slate-400 hover:text-amber-500 shrink-0" title="Edit Parent Artifact Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {v.hex_code && <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: v.hex_code }}></span>}
                      <span className="text-[10px] text-slate-500 font-medium truncate">{v.color_name} • {v.artisans?.name || 'KCC'}</span>
                    </div>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Stock</label>
                    <input type="number" value={v.stock} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 ${v.stock <= 5 ? 'border-rose-300 text-rose-700' : 'border-slate-200'}`} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cost (LKR)</label>
                    <input type="number" step="0.01" value={v.cost_price || ''} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Retail (LKR)</label>
                    <input type="number" step="0.01" value={v.price} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Sale (LKR)</label>
                    <input type="number" step="0.01" value={v.discounted_price || ''} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className="w-full bg-white border border-amber-200/50 rounded-lg px-3 py-2 text-sm text-amber-600 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-300" placeholder="None" />
                  </div>
                </div>

                <button onClick={() => handleSaveRow(v)} disabled={savingId === v.id} className="w-full bg-slate-100 hover:bg-emerald-500 text-slate-700 hover:text-white py-3 rounded-lg font-bold text-xs transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                  {savingId === v.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ))}
            {variants.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">No inventory found.</div>
            )}
          </div>

          {/* ================== DESKTOP TABLE LAYOUT (>= md) ================== */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Artifact (Variant)</th>
                    <th className="px-4 py-4 w-32">Stock</th>
                    <th className="px-4 py-4 w-36">Cost (LKR)</th>
                    <th className="px-4 py-4 w-36">Retail (LKR)</th>
                    <th className="px-4 py-4 w-36">Sale (LKR)</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No inventory found.</td></tr>
                  ) : (
                    variants.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                              {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 group/edit">
                                <p className="font-bold text-slate-900">{v.artifacts?.name}</p>
                                <button onClick={() => openEditArtifact(v.artifacts)} className="opacity-0 group-hover/edit:opacity-100 text-slate-400 hover:text-amber-500 transition-all p-1" title="Edit Parent Artifact Details">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {v.hex_code && <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: v.hex_code }}></span>}
                                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{v.color_name} • {v.artisans?.name || 'KCC'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" value={v.stock} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 ${v.stock <= 5 ? 'border-rose-300 text-rose-700' : 'border-slate-200'}`} />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" step="0.01" value={v.cost_price || ''} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="0.00" />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" step="0.01" value={v.price} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" />
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" step="0.01" value={v.discounted_price || ''} onChange={(e) => setVariants(prev => prev.map(item => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className="w-full bg-white border border-amber-200/50 rounded-lg px-3 py-2 text-amber-600 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-slate-300" placeholder="No Sale" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleSaveRow(v)} disabled={savingId === v.id} className="bg-slate-100 hover:bg-emerald-500 text-slate-700 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50 ml-auto">
                            {savingId === v.id ? 'Saving...' : 'Update'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL 1: ADD/EDIT PARENT ARTIFACT ===================== */}
      {isArtifactModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] sm:p-4">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sm:rounded-t-3xl rounded-t-3xl">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">{editingArtifactId ? 'Edit Base Artifact' : 'Add Base Artifact'}</h2>
              <button onClick={() => { setIsArtifactModalOpen(false); setEditingArtifactId(null); }} className="text-slate-400 hover:text-rose-500 p-2 -mr-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <form onSubmit={handleSaveArtifact} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                  <input required type="text" value={artifactForm.name} onChange={e => setArtifactForm({...artifactForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. Gurulu Raksha" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select required value={artifactForm.category} onChange={e => setArtifactForm({...artifactForm, category: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white">
                    <option value="Masks">Masks</option>
                    <option value="Weaving">Weaving</option>
                    <option value="Brassware">Brassware</option>
                    <option value="Wood Carving">Wood Carving</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Material</label>
                <input required type="text" value={artifactForm.material} onChange={e => setArtifactForm({...artifactForm, material: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. Kaduru Wood" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea required rows={3} value={artifactForm.description} onChange={e => setArtifactForm({...artifactForm, description: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" placeholder="General description..."></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Historical Info (Optional)</label>
                <textarea rows={3} value={artifactForm.historical_info} onChange={e => setArtifactForm({...artifactForm, historical_info: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none" placeholder="Cultural significance..."></textarea>
              </div>

              <div className="space-y-1.5 border border-slate-200 p-4 rounded-2xl bg-slate-50/50">
                <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Base Gallery Image (Optional)</label>
                <ImageUpload 
                  currentImageUrl={artifactForm.gallery_image} 
                  onUploadSuccess={(url) => setArtifactForm({...artifactForm, gallery_image: url})} 
                />
              </div>
              
              <div className="pt-2 sm:pt-4 pb-6 sm:pb-0">
                <button disabled={isSubmittingModal} className="w-full bg-slate-900 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50">
                  {isSubmittingModal ? 'Saving...' : editingArtifactId ? 'Save Changes' : 'Create Base Artifact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: ADD NEW VARIANT ===================== */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] sm:p-4">
          <div className="bg-white w-full sm:max-w-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sm:rounded-t-3xl rounded-t-3xl">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Add Variant SKU</h2>
              <button onClick={() => setIsVariantModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-2 -mr-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <form onSubmit={handleAddVariant} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
              
              {/* Image Uploader */}
              <div className="space-y-1.5 border border-amber-200/50 p-4 rounded-2xl bg-amber-50/30">
                <label className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-widest block mb-3">Variant Image (Required) *</label>
                <ImageUpload 
                  onUploadSuccess={(url) => setVariantForm({...variantForm, image_url: url})} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Select Parent Artifact</label>
                  <select required value={variantForm.artifact_id} onChange={e => setVariantForm({...variantForm, artifact_id: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white">
                    <option value="" disabled>-- Select Artifact --</option>
                    {parentArtifacts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.category})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Assign Artisan</label>
                  <select value={variantForm.artisan_id} onChange={e => setVariantForm({...variantForm, artisan_id: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white">
                    <option value="">KCC Artists (Default)</option>
                    {artisans.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Color Name</label>
                  <input required type="text" value={variantForm.color_name} onChange={e => setVariantForm({...variantForm, color_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. Crimson Red" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Color Picker (Hex)</label>
                  <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-2.5 bg-white">
                    <input type="color" value={variantForm.hex_code} onChange={e => setVariantForm({...variantForm, hex_code: e.target.value})} className="w-8 h-8 sm:w-9 sm:h-9 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" />
                    <span className="font-mono text-xs sm:text-sm text-slate-500 uppercase">{variantForm.hex_code}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Cost (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.cost_price} onChange={e => setVariantForm({...variantForm, cost_price: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Retail (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Init Stock</label>
                  <input required type="number" value={variantForm.stock} onChange={e => setVariantForm({...variantForm, stock: e.target.value})} className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Dimensions</label>
                  <input type="text" value={variantForm.dimensions} onChange={e => setVariantForm({...variantForm, dimensions: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. 18 x 12 in" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">Weight</label>
                  <input type="text" value={variantForm.weight} onChange={e => setVariantForm({...variantForm, weight: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="e.g. 1.2 kg" />
                </div>
              </div>
              
              <div className="pt-2 sm:pt-4 pb-6 sm:pb-0">
                <button disabled={isSubmittingModal || !variantForm.image_url} className="w-full bg-slate-900 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50">
                  {isSubmittingModal ? 'Saving...' : 'Add Variant SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}