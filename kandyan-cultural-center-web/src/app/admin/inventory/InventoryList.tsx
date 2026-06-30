'use client';

import Image from 'next/image';
import Barcode from 'react-barcode';

export default function InventoryList({ variants, setVariants, onSaveRow, onEdit, onDelete, savingId }: any) {
  
  if (variants.length === 0) {
    return <div className="text-center py-16 text-slate-500 font-bold bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-sm">No inventory found matching criteria.</div>;
  }

  const glassInputClass = "w-full bg-white/50 backdrop-blur-sm border border-white/80 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all shadow-sm";

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {variants.map((v: any) => (
          <div key={v.id} className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-[0_10px_30px_rgba(31,38,135,0.03)] p-5">
            
            <div className="flex items-start gap-4 border-b border-white/60 pb-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden relative shrink-0 border border-white/80 shadow-sm">
                {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-black text-slate-900 text-base truncate pr-2 leading-tight">{v.artifacts?.name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(v)} className="bg-white/50 p-1.5 rounded-lg text-slate-400 hover:text-amber-600 shadow-sm border border-white/60"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                    <button onClick={() => onDelete(v.id)} className="bg-white/50 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 shadow-sm border border-white/60"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 bg-white/40 w-max px-2 py-1 rounded-md border border-white/60">
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0 shadow-inner" style={{ backgroundColor: v.hex_code }}></span>
                  <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest truncate">{v.color_name}</span>
                </div>
                {/* BARCODE MOBILE */}
                <div className="mt-2 scale-75 origin-left opacity-70 mix-blend-multiply">
                  <Barcode 
                    value={v.barcode || v.id.substring(0,8)} 
                    format="CODE128" 
                    width={1.5} 
                    height={30} 
                    displayValue={true} 
                    fontSize={14} 
                    margin={0} 
                    background="transparent" 
                  />
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Stock</label>
                <input type="number" value={v.stock} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`${glassInputClass} ${v.stock <= 5 ? '!border-rose-400 !text-rose-700 bg-rose-50/50' : 'text-slate-900'}`} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Cost (LKR)</label>
                <input type="number" value={v.cost_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className={glassInputClass} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Retail (LKR)</label>
                <input type="number" value={v.price} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, price: e.target.value } : item))} className={glassInputClass} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest pl-1 mb-1 block">Sale (LKR)</label>
                <input type="number" value={v.discounted_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className={`${glassInputClass} !border-amber-300 !text-amber-600`} />
              </div>
            </div>

            <button onClick={() => onSaveRow(v)} disabled={savingId === v.id} className="w-full bg-white/60 hover:bg-emerald-500 border border-white/80 hover:border-transparent text-slate-700 hover:text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50">
              {savingId === v.id ? 'Saving...' : 'Save Quick Edits'}
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/40 border-b border-white/60 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
              <tr>
                <th className="px-8 py-5">Artifact SKU & Barcode</th>
                <th className="px-4 py-5 w-28 text-center">Stock</th>
                <th className="px-4 py-5 w-32 text-center">Cost (LKR)</th>
                <th className="px-4 py-5 w-32 text-center">Retail (LKR)</th>
                <th className="px-4 py-5 w-32 text-center text-amber-600">Sale (LKR)</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {variants.map((v: any) => (
                <tr key={v.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden relative shrink-0 border border-white/80 shadow-sm">
                        {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="font-black text-slate-900 text-base">{v.artifacts?.name} <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2 bg-white/50 px-2 py-1 rounded-md border border-white/60">{v.color_name}</span></p>
                        {/* BARCODE DESKTOP */}
                        <div className="scale-75 origin-left -mt-1 opacity-70 mix-blend-multiply">
                          <Barcode 
                            value={v.barcode || v.id.substring(0,8)} 
                            format="CODE128" 
                            width={1.5} 
                            height={30} 
                            displayValue={true} 
                            fontSize={14} 
                            margin={0} 
                            background="transparent" 
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <input type="number" value={v.stock} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`${glassInputClass} text-center ${v.stock <= 5 ? '!border-rose-400 !text-rose-700 bg-rose-50/50' : 'text-slate-900'}`} />
                  </td>
                  <td className="px-4 py-5">
                    <input type="number" value={v.cost_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className={`${glassInputClass} text-center`} />
                  </td>
                  <td className="px-4 py-5">
                    <input type="number" value={v.price} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, price: e.target.value } : item))} className={`${glassInputClass} text-center`} />
                  </td>
                  <td className="px-4 py-5">
                    <input type="number" value={v.discounted_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className={`${glassInputClass} text-center !border-amber-300 !text-amber-600`} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => onSaveRow(v)} disabled={savingId === v.id} className="bg-white/60 hover:bg-emerald-500 border border-white/80 hover:border-transparent text-slate-700 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm">
                        {savingId === v.id ? '...' : 'Save'}
                      </button>
                      <button onClick={() => onEdit(v)} className="bg-amber-50/80 hover:bg-amber-500 border border-amber-200/50 hover:border-transparent text-amber-600 hover:text-white p-2.5 rounded-xl transition-all shadow-sm" title="Edit Full Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => onDelete(v.id)} className="bg-rose-50/80 hover:bg-rose-600 border border-rose-200/50 hover:border-transparent text-rose-600 hover:text-white p-2.5 rounded-xl transition-all shadow-sm" title="Delete Variant">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}