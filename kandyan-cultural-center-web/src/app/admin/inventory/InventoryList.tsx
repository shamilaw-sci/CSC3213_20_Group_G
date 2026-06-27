'use client';

import Image from 'next/image';
import Barcode from 'react-barcode';

export default function InventoryList({ variants, setVariants, onSaveRow, onEdit, onDelete, savingId }: any) {
  
  if (variants.length === 0) {
    return <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">No inventory found matching criteria.</div>;
  }

  return (
    <>
      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {variants.map((v: any) => (
          <div key={v.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            
            <div className="flex items-start gap-4 border-b border-slate-100 pb-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-slate-900 text-sm truncate pr-2">{v.artifacts?.name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(v)} className="text-slate-400 hover:text-amber-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
                    <button onClick={() => onDelete(v.id)} className="text-slate-400 hover:text-rose-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: v.hex_code }}></span>
                  <span className="text-[10px] text-slate-500 font-medium truncate">{v.color_name}</span>
                </div>
                {/* BARCODE MOBILE */}
                <div className="mt-2 scale-75 origin-left opacity-70">
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
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Stock</label>
                <input type="number" value={v.stock} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm font-bold ${v.stock <= 5 ? 'border-rose-300 text-rose-700' : 'border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cost (LKR)</label>
                <input type="number" value={v.cost_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Retail (LKR)</label>
                <input type="number" value={v.price} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sale (LKR)</label>
                <input type="number" value={v.discounted_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className="w-full bg-white border border-amber-200/50 rounded-lg px-3 py-2 text-sm text-amber-600 font-bold" />
              </div>
            </div>

            <button onClick={() => onSaveRow(v)} disabled={savingId === v.id} className="w-full bg-slate-100 hover:bg-emerald-500 text-slate-700 hover:text-white py-3 rounded-lg font-bold text-xs transition-all disabled:opacity-50">
              {savingId === v.id ? 'Saving...' : 'Save Quick Edits'}
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Artifact SKU & Barcode</th>
                <th className="px-4 py-4 w-28">Stock</th>
                <th className="px-4 py-4 w-32">Cost (LKR)</th>
                <th className="px-4 py-4 w-32">Retail (LKR)</th>
                <th className="px-4 py-4 w-32">Sale (LKR)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                        {v.image_url && <Image src={v.image_url} alt="Item" fill className="object-cover" />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-slate-900">{v.artifacts?.name} <span className="text-xs font-normal text-slate-400 ml-1">({v.color_name})</span></p>
                        {/* BARCODE DESKTOP */}
                        <div className="scale-75 origin-left -mt-1 opacity-70">
                          {/* Use barcode col, fallback to sliced UUID */}
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
                  <td className="px-4 py-4">
                    <input type="number" value={v.stock} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, stock: e.target.value } : item))} className={`w-full bg-slate-50 border rounded-lg px-2 py-1.5 font-bold focus:ring-1 focus:ring-amber-500 ${v.stock <= 5 ? 'border-rose-300 text-rose-700' : 'border-slate-200'}`} />
                  </td>
                  <td className="px-4 py-4">
                    <input type="number" value={v.cost_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, cost_price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-bold" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="number" value={v.price} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, price: e.target.value } : item))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-bold" />
                  </td>
                  <td className="px-4 py-4">
                    <input type="number" value={v.discounted_price || ''} onChange={(e) => setVariants((prev: any) => prev.map((item: any) => item.id === v.id ? { ...item, discounted_price: e.target.value } : item))} className="w-full bg-white border border-amber-200/50 rounded-lg px-2 py-1.5 text-amber-600 font-bold" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onSaveRow(v)} disabled={savingId === v.id} className="bg-slate-100 hover:bg-emerald-500 text-slate-700 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all">
                        {savingId === v.id ? '...' : 'Save'}
                      </button>
                      <button onClick={() => onEdit(v)} className="bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white p-1.5 rounded-lg transition-all" title="Edit Full Details">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => onDelete(v.id)} className="bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white p-1.5 rounded-lg transition-all" title="Delete Variant">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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