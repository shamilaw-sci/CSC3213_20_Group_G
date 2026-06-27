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

  // Populate forms if Editing
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
      // Reset forms
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
        // ADD NEW PARENT
        await supabase.from('artifacts').insert({
          name: artifactForm.name, category: artifactForm.category, description: artifactForm.description, 
          material: artifactForm.material, historical_info: artifactForm.historical_info, 
          gallery_images: artifactForm.gallery_image ? [artifactForm.gallery_image] : []
        }).throwOnError();
      } 
      else if (mode === 'variant') {
        // ADD NEW VARIANT
        await supabase.from('artifact_variants').insert({
          artifact_id: variantForm.artifact_id, artisan_id: variantForm.artisan_id || null, color_name: variantForm.color_name,
          hex_code: variantForm.hex_code, cost_price: parseFloat(variantForm.cost_price), price: parseFloat(variantForm.price),
          stock: parseInt(variantForm.stock), image_url: variantForm.image_url, weight: variantForm.weight, dimensions: variantForm.dimensions
        }).throwOnError();
      } 
      else if (mode === 'edit') {
        // EDIT BOTH AT ONCE
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

      onRefresh(); // Refresh Data
      onClose();   // Close Modal
    } catch (err) {
      alert("Failed to save changes. Check logs.");
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl animate-in slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        
        <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0 sm:rounded-t-3xl rounded-t-3xl">
          <h2 className="text-xl font-black text-slate-900">
            {mode === 'parent' ? 'Add Base Artifact' : mode === 'variant' ? 'Add Variant SKU' : 'Edit Artifact & Variant'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* BASE ARTIFACT DETAILS (Visible on 'parent' or 'edit') */}
          {(mode === 'parent' || mode === 'edit') && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Base Artifact Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                  <input required type="text" value={artifactForm.name} onChange={e => setArtifactForm({...artifactForm, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Category (Type or Select)</label>
                  {/* DATALIST: Allows dropdown selection OR custom typing */}
                  <input required list="categories-list" value={artifactForm.category} onChange={e => setArtifactForm({...artifactForm, category: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. Masks" />
                  <datalist id="categories-list">
                    {distinctCategories.map((cat: string) => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                <textarea required rows={2} value={artifactForm.description} onChange={e => setArtifactForm({...artifactForm, description: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm resize-none"></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Material</label>
                  <input required type="text" value={artifactForm.material} onChange={e => setArtifactForm({...artifactForm, material: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Historical Info</label>
                  <input type="text" value={artifactForm.historical_info} onChange={e => setArtifactForm({...artifactForm, historical_info: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* VARIANT DETAILS (Visible on 'variant' or 'edit') */}
          {(mode === 'variant' || mode === 'edit') && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <h3 className="text-sm font-bold text-amber-600 border-b border-amber-100 pb-2">Variant SKU Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mode === 'variant' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Select Parent Artifact</label>
                    <select required value={variantForm.artifact_id} onChange={e => setVariantForm({...variantForm, artifact_id: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm">
                      <option value="" disabled>-- Select Artifact --</option>
                      {parentArtifacts.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.category})</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Assign Artisan</label>
                  <select value={variantForm.artisan_id} onChange={e => setVariantForm({...variantForm, artisan_id: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm">
                    <option value="">KCC Artists (Default)</option>
                    {artisans.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Color Name</label>
                  <input required type="text" value={variantForm.color_name} onChange={e => setVariantForm({...variantForm, color_name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Hex Code</label>
                  <div className="flex border rounded-xl px-2 py-1.5 items-center">
                    <input type="color" value={variantForm.hex_code} onChange={e => setVariantForm({...variantForm, hex_code: e.target.value})} className="w-6 h-6 border-0 p-0" />
                    <span className="text-xs ml-2 text-slate-500 uppercase">{variantForm.hex_code}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cost (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.cost_price} onChange={e => setVariantForm({...variantForm, cost_price: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Retail (LKR)</label>
                  <input required type="number" step="0.01" value={variantForm.price} onChange={e => setVariantForm({...variantForm, price: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Stock</label>
                  <input required type="number" value={variantForm.stock} onChange={e => setVariantForm({...variantForm, stock: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Weight</label>
                  <input type="text" value={variantForm.weight} onChange={e => setVariantForm({...variantForm, weight: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Dimensions</label>
                  <input type="text" value={variantForm.dimensions} onChange={e => setVariantForm({...variantForm, dimensions: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-amber-600 uppercase">Variant Image (Required)</label>
                <div className="mt-1">
                  <ImageUpload currentImageUrl={variantForm.image_url} onUploadSuccess={(url) => setVariantForm({...variantForm, image_url: url})} />
                </div>
              </div>
            </div>
          )}

          <button disabled={isSubmitting || (mode==='variant' && !variantForm.image_url)} type="submit" className="w-full bg-slate-900 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50">
            {isSubmitting ? 'Saving to Database...' : 'Save Complete Record'}
          </button>
        </form>
      </div>
    </div>
  );
}