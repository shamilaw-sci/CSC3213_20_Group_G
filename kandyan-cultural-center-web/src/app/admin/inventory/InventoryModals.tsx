'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/lib/supabase';

export default function InventoryModals({ 
  isOpen, 
  mode, 
  editData, 
  onClose, 
  onRefresh, 
  parentArtifacts, 
  artisans, 
  distinctCategories 
}: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms State
  const [artifactForm, setArtifactForm] = useState({ name: '', category: '', description: '', material: '', historical_info: '', gallery_image: '' });
  const [variantForm, setVariantForm] = useState({ artifact_id: '', artisan_id: '', color_name: '', hex_code: '#000000', cost_price: '', price: '', stock: '0', image_url: '', weight: '', dimensions: '' });

  useEffect(() => {
    if (mode === 'edit' && editData) {
      setArtifactForm({
        name: editData.artifacts?.name || '',
        category: editData.artifacts?.category || '',
        description: editData.artifacts?.description || '',
        material: editData.artifacts?.material || '',
        historical_info: editData.artifacts?.historical_info || '',
        gallery_image: editData.artifacts?.gallery_images?.[0] || ''
      });
      setVariantForm({
        artifact_id: editData.artifact_id,
        artisan_id: editData.artisan_id || '',
        color_name: editData.color_name || '',
        hex_code: editData.hex_code || '#000000',
        cost_price: editData.cost_price || '',
        price: editData.price || '',
        stock: editData.stock || '0',
        image_url: editData.image_url || '',
        weight: editData.weight || '',
        dimensions: editData.dimensions || ''
      });
    } else {
      setArtifactForm({ name: '', category: '', description: '', material: '', historical_info: '', gallery_image: '' });
      setVariantForm({ artifact_id: '', artisan_id: '', color_name: '', hex_code: '#000000', cost_price: '', price: '', stock: '0', image_url: '', weight: '', dimensions: '' });
    }
  }, [mode, editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'parent') {
        await supabase.from('artifacts').insert({
          name: artifactForm.name, category: artifactForm.category, description: artifactForm.description, 
          material: artifactForm.material, historical_info: artifactForm.historical_info, 
          gallery_images: artifactForm.gallery_image ? [artifactForm.gallery_image] : []
        }).throwOnError();
      } 
      else if (mode === 'variant') {
        await supabase.from('artifact_variants').insert({
          artifact_id: variantForm.artifact_id, artisan_id: variantForm.artisan_id || null, color_name: variantForm.color_name,
          hex_code: variantForm.hex_code, cost_price: parseFloat(variantForm.cost_price), price: parseFloat(variantForm.price),
          stock: parseInt(variantForm.stock), image_url: variantForm.image_url, weight: variantForm.weight, dimensions: variantForm.dimensions
        }).throwOnError();
      } 
      else if (mode === 'edit') {
        await supabase.from('artifacts').update({
          name: artifactForm.name, category: artifactForm.category, description: artifactForm.description, 
          material: artifactForm.material, historical_info: artifactForm.historical_info
        }).eq('id', editData.artifact_id).throwOnError();

        await supabase.from('artifact_variants').update({
          artisan_id: variantForm.artisan_id || null, color_name: variantForm.color_name, hex_code: variantForm.hex_code, 
          cost_price: parseFloat(variantForm.cost_price), price: parseFloat(variantForm.price), stock: parseInt(variantForm.stock), 
          image_url: variantForm.image_url, weight: variantForm.weight, dimensions: variantForm.dimensions
        }).eq('id', editData.id).throwOnError();
      }

      onRefresh(); 
      onClose(); 
    } catch (err) {
      alert("Failed to save changes. Check logs.");
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-sm placeholder:text-slate-400 font-medium";

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] sm:p-4">
      <div className="bg-white/80 backdrop-blur-3xl border border-white w-full sm:max-w-4xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] animate-in slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        <div className="p-6 sm:p-8 border-b border-white/60 flex justify-between items-center bg-white/40 shrink-0 sm:rounded-t-[2.5rem] rounded-t-[2.5rem]">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'parent' ? 'Add Base Artifact' : mode === 'variant' ? 'Add Variant SKU' : 'Edit Artifact & Variant'}
          </h2>
          <button onClick={onClose} className="p-2.5 bg-white/60 hover:bg-white rounded-full text-slate-500 hover:text-rose-600 transition-colors shadow-sm border border-white/80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 no-scrollbar">
          
          {/* base artifact details */}
          {(mode === 'parent' || mode === 'edit') && (
            <div className="border border-white/80 rounded-[2rem] p-6 sm:p-8 bg-white/50 backdrop-blur-md shadow-sm space-y-5">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-white/60 pb-3">Base Artifact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</label>
                  <input required type="text" value={artifactForm.name} onChange={e => setArtifactForm({...artifactForm, name: e.target.value})} className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                  <input required list="categories-list" value={artifactForm.category} onChange={e => setArtifactForm({...artifactForm, category: e.target.value})} className={glassInputClass} placeholder="e.g. Masks" />
                  <datalist id="categories-list">
                    {distinctCategories.map((cat: string) => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Description</label>
                <textarea required rows={2} value={artifactForm.description} onChange={e => setArtifactForm({...artifactForm, description: e.target.value})} className={`${glassInputClass} resize-none`}></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Material</label>
                  <input required type="text" value={artifactForm.material} onChange={e => setArtifactForm({...artifactForm, material: e.target.value})} className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Historical Info (Optional)</label>
                  <input type="text" value={artifactForm.historical_info} onChange={e => setArtifactForm({...artifactForm, historical_info: e.target.value})} className={glassInputClass} />
                </div>
              </div>
            </div>
          )}

          {/* variant details */}
          {(mode === 'variant' || mode === 'edit') && (
            <div className="border border-white/80 rounded-[2rem] p-6 sm:p-8 bg-white/50 backdrop-blur-md shadow-sm space-y-5">
              <h3 className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest border-b border-amber-200/50 pb-3">Variant SKU Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {mode === 'variant' && (
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Parent Artifact</label>
                    <select required value={variantForm.artifact_id} onChange={e => setVariantForm({...variantForm, artifact_id: e.target.value})} className={`${glassInputClass} appearance-none pr-10 cursor-pointer`}>
                      <option value="" disabled className="bg-white">-- Select Artifact --</option>
                      {parentArtifacts.map((a: any) => <option key={a.id} value={a.id} className="bg-white">{a.name} ({a.category})</option>)}
                    </select>
                    <svg className="absolute right-4 top-[2.1rem] w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                )}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Assign Artisan</label>
                  <select value={variantForm.artisan_id} onChange={e => setVariantForm({...variantForm, artisan_id: e.target.value})} className={`${glassInputClass} appearance-none pr-10 cursor-pointer`}>
                    <option value="" className="bg-white">KCC Artists (Default)</option>
                    {artisans.map((a: any) => <option key={a.id} value={a.id} className="bg-white">{a.name}</option>)}
                  </select>
                  <svg className="absolute right-4 top-[2.1rem] w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Color Name</label>
                  <input required type="text" value={variantForm.color_name} onChange={e => setVariantForm({...variantForm, color_name: e.target.value})} className={glassInputClass} />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Hex Code</label>
                  <div className={`${glassInputClass} flex items-center !p-1.5`}>
                    <input type="color" value={variantForm.hex_code} onChange={e => setVariantForm({...variantForm, hex_code: e.target.value})} className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer" />
                    <span className="text-xs ml-3 font-bold text-slate-600 uppercase">{variantForm.hex_code}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Cost (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.cost_price} onChange={e => setVariantForm({...variantForm, cost_price: e.target.value})} className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Retail (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className={glassInputClass} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Stock</label>
                  <input required type="number" value={variantForm.stock} onChange={e => setVariantForm({...variantForm, stock: e.target.value})} className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Weight</label>
                  <input type="text" value={variantForm.weight} onChange={e => setVariantForm({...variantForm, weight: e.target.value})} className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Dimensions</label>
                  <input type="text" value={variantForm.dimensions} onChange={e => setVariantForm({...variantForm, dimensions: e.target.value})} className={glassInputClass} />
                </div>
              </div>

              <div className="pt-4">
                <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest pl-1 mb-2 block">Variant Image (Required)</label>
                <div className="bg-white/40 p-4 rounded-[1.5rem] border border-white/60 shadow-sm">
                  <ImageUpload currentImageUrl={variantForm.image_url} onUploadSuccess={(url) => setVariantForm({...variantForm, image_url: url})} />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/60">
            <button disabled={isSubmitting || (mode==='variant' && !variantForm.image_url)} type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 sm:py-5 rounded-[1.25rem] transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1 disabled:opacity-50 text-base">
              {isSubmitting ? 'Saving to Database...' : 'Save Complete Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}