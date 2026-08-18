'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Barcode from 'react-barcode';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

type VariantWithArtifact = {
  id: string;
  barcode: string;
  color_name: string;
  stock: number;
  price: number;
  discounted_price: number | null;
  created_at: string;
  artifacts: {
    name: string;
    category: string;
  };
};

export default function BarcodesPage() {
  const { formatPrice } = useCurrency();
  const [variants, setVariants] = useState<VariantWithArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Commercial Filters
  const [limit, setLimit] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection State: Map of Variant ID -> Number of Copies to Print
  const [selectedToPrint, setSelectedToPrint] = useState<Map<string, number>>(new Map());

  const fetchVariants = async () => {
    setLoading(true);
    let query = supabase
      .from('artifact_variants')
      .select(`
        id, barcode, color_name, stock, price, discounted_price, created_at,
        artifacts!inner(name, category)
      `)
      .not('barcode', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (searchTerm) {
      query = query.ilike('artifacts.name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching variants:', error);
    } else {
      setVariants(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Debounce search
    const delay = setTimeout(() => {
      fetchVariants();
    }, 300);
    return () => clearTimeout(delay);
  }, [limit, searchTerm]);

  // Handle Checkbox Selection
  const toggleSelection = (variant: VariantWithArtifact) => {
    const newMap = new Map(selectedToPrint);
    if (newMap.has(variant.id)) {
      newMap.delete(variant.id);
    } else {
      // Default to printing exactly the number of items in stock (or 1 if stock is 0)
      newMap.set(variant.id, Math.max(1, variant.stock || 1));
    }
    setSelectedToPrint(newMap);
  };

  // Handle Quantity Change for a selected sticker
  const updatePrintQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const newMap = new Map(selectedToPrint);
    newMap.set(id, qty);
    setSelectedToPrint(newMap);
  };

  // Select All visible
  const selectAll = () => {
    const newMap = new Map();
    variants.forEach(v => newMap.set(v.id, Math.max(1, v.stock || 1)));
    setSelectedToPrint(newMap);
  };

  const deselectAll = () => setSelectedToPrint(new Map());

  const handlePrint = () => {
    if (selectedToPrint.size === 0) {
      alert("Please select at least one item to print.");
      return;
    }
    window.print();
  };

  // Flatten the selected map into an array of items to print (duplicating them based on quantity)
  const printQueue: VariantWithArtifact[] = [];
  selectedToPrint.forEach((quantity, id) => {
    const variant = variants.find(v => v.id === id);
    if (variant) {
      for (let i = 0; i < quantity; i++) {
        printQueue.push(variant);
      }
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900 relative">
      
      {/* ========================================================================= */}
      {/* 1. ADMIN UI (Hidden during printing) */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Barcode & Label Generator</h1>
            <p className="text-sm text-slate-500 mt-1">Select items to print standard 80mm thermal barcode stickers.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              disabled={selectedToPrint.size === 0}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Print {printQueue.length} Labels
            </button>
            <Link href="/admin/inventory" className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center">
              ← Inventory
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search artifact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-amber-500 text-sm font-medium"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Show Last:</span>
              <select 
                value={limit} 
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer"
              >
                <option value={10}>10 Items</option>
                <option value={50}>50 Items</option>
                <option value={100}>100 Items</option>
                <option value={500}>500 Items</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={selectAll} className="text-xs font-bold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Select All</button>
            <button onClick={deselectAll} className="text-xs font-bold px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">Clear</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
          ) : variants.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No artifacts found.</div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-4 px-6 w-12 text-center">Print</th>
                  <th className="py-4 px-6">Artifact Name & Variant</th>
                  <th className="py-4 px-6">Barcode</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-center">Copies to Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {variants.map((v) => {
                  const isSelected = selectedToPrint.has(v.id);
                  const activePrice = v.discounted_price || v.price;

                  return (
                    <tr key={v.id} className={`transition-colors ${isSelected ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(v)}
                          className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900">{v.artifacts.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{v.color_name} • Stock: {v.stock}</div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-600">
                        {v.barcode}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-800">
                        {formatPrice(activePrice)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {isSelected ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={selectedToPrint.get(v.id)}
                              onChange={(e) => updatePrintQuantity(v.id, Number(e.target.value))}
                              className="w-16 text-center border border-amber-300 rounded-lg px-2 py-1 font-bold text-amber-700 bg-amber-50 focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Labels</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRINT UI (Visible ONLY when printing, calibrated for 80mm thermal)   */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-container">
        {printQueue.map((item, index) => {
          const activePrice = item.discounted_price || item.price;
          return (
            <div key={`${item.id}-${index}`} className="thermal-label">
              <div className="store-name">Kandyan Cultural Centre</div>
              <div className="item-name">{item.artifacts.name}</div>
              <div className="item-variant">{item.color_name}</div>
              
              <div className="barcode-wrapper">
                <Barcode 
                  value={item.barcode} 
                  width={1.6} 
                  height={40} 
                  fontSize={14} 
                  margin={0} 
                  displayValue={true} 
                  background="transparent"
                />
              </div>

              <div className="price-tag">LKR {activePrice.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. THERMAL PRINTER CSS INJECTIONS                                         */}
      {/* ========================================================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Force page margins to 0 and set width to 80mm receipt roll */
          @page {
            margin: 0;
            size: 80mm auto; 
          }

          /* Hide everything except the print container */
          body * {
            visibility: hidden;
          }
          
          .print-container, .print-container * {
            visibility: visible;
          }
          
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            background: white;
          }

          /* Each sticker layout */
          .thermal-label {
            width: 76mm; /* Slight inner margin to prevent cutoff */
            margin: 0 auto;
            padding: 4mm 2mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #000;
            page-break-after: always; /* Forces printer to cut/advance to next sticker */
            border-bottom: 1px dashed #ccc; /* Visual cut guide if continuous paper */
          }

          .store-name {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 2px;
          }

          .item-name {
            font-size: 13px;
            font-weight: bold;
            line-height: 1.2;
            max-width: 95%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-variant {
            font-size: 10px;
            color: #444;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .barcode-wrapper {
            margin: 4px 0;
          }

          .price-tag {
            font-size: 16px;
            font-weight: 900;
            margin-top: 4px;
          }
        }
      `}} />

    </main>
  );
}