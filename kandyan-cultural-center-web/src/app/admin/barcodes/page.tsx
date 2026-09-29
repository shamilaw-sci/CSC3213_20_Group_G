'use client';

import { useState, useEffect, useMemo } from 'react';
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
  
  // Selection State: Map of Variant ID -> Number of Copies to Print
  const [selectedToPrint, setSelectedToPrint] = useState<Map<string, number>>(new Map());

  // FILTER & SORT STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [filterPrice, setFilterPrice] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const fetchVariants = async () => {
    setLoading(true);
    // Fetch all variants (up to a safe cap) to allow instant client-side filtering
    const { data, error } = await supabase
      .from('artifact_variants')
      .select(`
        id, barcode, color_name, stock, price, discounted_price, created_at,
        artifacts!inner(name, category)
      `)
      .not('barcode', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5000); 

    if (error) console.error('Error fetching variants:', error);
    else setVariants(data as any);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  // Reset to Page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterStock, filterPrice, sortBy]);

  // Extract distinct categories for the dropdown
  const distinctCategories = useMemo(() => {
    const cats = variants.map(v => v.artifacts?.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [variants]);

  // 🚨 MASTER FILTER ENGINE WITH "STICKY SELECTION"
  const processedVariants = useMemo(() => {
    // 1. Separate the "Sticky" selected items from the rest
    const selectedItems = variants.filter(v => selectedToPrint.has(v.id));
    let unselectedItems = variants.filter(v => !selectedToPrint.has(v.id));

    // 2. Apply Filters ONLY to the unselected items
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      unselectedItems = unselectedItems.filter(v => 
        v.artifacts?.name?.toLowerCase().includes(q) || 
        v.color_name?.toLowerCase().includes(q) ||
        v.barcode?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') {
      unselectedItems = unselectedItems.filter(v => v.artifacts?.category === filterCategory);
    }
    if (filterStock === 'Low') {
      unselectedItems = unselectedItems.filter(v => v.stock > 0 && v.stock <= 5);
    } else if (filterStock === 'Out') {
      unselectedItems = unselectedItems.filter(v => v.stock === 0);
    }
    if (filterPrice !== 'All') {
      if (filterPrice === '<5000') unselectedItems = unselectedItems.filter(v => v.price < 5000);
      if (filterPrice === '5000-15000') unselectedItems = unselectedItems.filter(v => v.price >= 5000 && v.price <= 15000);
      if (filterPrice === '>15000') unselectedItems = unselectedItems.filter(v => v.price > 15000);
    }

    // 3. Apply Sorting
    const sortLogic = (a: VariantWithArtifact, b: VariantWithArtifact) => {
      switch (sortBy) {
        case 'Newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'Oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'Name: A-Z': return (a.artifacts?.name || '').localeCompare(b.artifacts?.name || '');
        case 'Name: Z-A': return (b.artifacts?.name || '').localeCompare(a.artifacts?.name || '');
        case 'Price: Low to High': return (a.discounted_price || a.price) - (b.discounted_price || b.price);
        case 'Price: High to Low': return (b.discounted_price || b.price) - (a.discounted_price || a.price);
        case 'Stock: Low to High': return a.stock - b.stock;
        case 'Stock: High to Low': return b.stock - a.stock;
        default: return 0;
      }
    };

    unselectedItems.sort(sortLogic);
    selectedItems.sort(sortLogic); // Keep sticky items organized too

    // 4. Merge them back together! Sticky items ALWAYS stay at the top.
    return [...selectedItems, ...unselectedItems];
  }, [variants, searchQuery, filterCategory, filterStock, filterPrice, sortBy, selectedToPrint]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(processedVariants.length / ITEMS_PER_PAGE));
  const paginatedVariants = processedVariants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle Checkbox Selection
  const toggleSelection = (variant: VariantWithArtifact) => {
    const newMap = new Map(selectedToPrint);
    if (newMap.has(variant.id)) {
      newMap.delete(variant.id);
    } else {
      newMap.set(variant.id, Math.max(1, variant.stock || 1));
    }
    setSelectedToPrint(newMap);
  };

  const updatePrintQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const newMap = new Map(selectedToPrint);
    newMap.set(id, qty);
    setSelectedToPrint(newMap);
  };

  const selectAllFiltered = () => {
    const newMap = new Map(selectedToPrint);
    processedVariants.forEach(v => {
      if (!newMap.has(v.id)) newMap.set(v.id, Math.max(1, v.stock || 1));
    });
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

  const printQueue: VariantWithArtifact[] = [];
  selectedToPrint.forEach((quantity, id) => {
    const variant = variants.find(v => v.id === id);
    if (variant) {
      for (let i = 0; i < quantity; i++) printQueue.push(variant);
    }
  });

  const dropdownClass = "bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm appearance-none pr-10 cursor-pointer relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[position:right_12px_center] bg-no-repeat transition-all";

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900 relative">
      
      <div className="max-w-7xl mx-auto space-y-6 print:hidden">
        
        {/* Header */}
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

        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
          
          {/* Search */}
          <div className="relative flex-grow min-w-[200px] md:min-w-[250px]">
            <input 
              type="text" 
              placeholder="Search Name or Barcode..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder:text-slate-400" 
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          {/* Filters */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={dropdownClass}>
            <option value="All">All Categories</option>
            {distinctCategories.map((c) => <option key={c as string} value={c as string}>{c as string}</option>)}
          </select>

          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className={dropdownClass}>
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock (≤ 5)</option>
            <option value="Out">Out of Stock</option>
          </select>

          <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className={dropdownClass}>
            <option value="All">All Prices</option>
            <option value="<5000">Under LKR 5,000</option>
            <option value="5000-15000">LKR 5k - 15k</option>
            <option value=">15000">Over LKR 15,000</option>
          </select>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block"></div>
          
          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${dropdownClass} !bg-amber-50 !border-amber-200 !text-amber-700`}>
            <option value="Newest">Sort: Newest</option>
            <option value="Oldest">Sort: Oldest</option>
            <option value="Name: A-Z">Name: A to Z</option>
            <option value="Name: Z-A">Name: Z to A</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>

          <div className="flex gap-2 ml-auto">
            <button onClick={selectAllFiltered} className="text-xs font-bold px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Select Filtered</button>
            <button onClick={deselectAll} className="text-xs font-bold px-3 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors">Clear All</button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
          {loading ? (
            <div className="p-16 flex justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
          ) : processedVariants.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">No artifacts found matching filters.</div>
          ) : (
            <div className="overflow-x-auto">
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
                  {paginatedVariants.map((v) => {
                    const isSelected = selectedToPrint.has(v.id);
                    const activePrice = v.discounted_price || v.price;

                    return (
                      <tr key={v.id} className={`transition-colors ${isSelected ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(v)}
                            className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 flex items-center gap-2">
                            {v.artifacts.name}
                            {isSelected && <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">Selected</span>}
                          </div>
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
                                className="w-16 text-center border border-amber-300 rounded-lg px-2 py-1 font-bold text-amber-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
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

              {/* Pagination Controls */}
              {processedVariants.length > ITEMS_PER_PAGE && (
                <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRINT UI (Visible ONLY when printing, calibrated for 50x25mm thermal)  */}
      {/* ========================================================================= */}
      <div className="hidden print:block print-container">
        {printQueue.map((item, index) => {
          const activePrice = item.discounted_price || item.price;
          return (
            <div key={`${item.id}-${index}`} className="thermal-label">
              <div className="store-name">THE KANDYAN ART ASSOCIATION</div>
              <div className="item-name">{item.artifacts.name}</div>
              
              <div className="barcode-wrapper">
                <Barcode 
                  value={item.barcode} 
                  width={1.3}        /* Thicker bars */
                  height={28}        /* Taller barcode */
                  fontSize={12}      /* Larger text under barcode */
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

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* 1. PAPER SIZE */
          @page { 
            margin: 0; 
            size: 50mm 25mm; 
          }

          /* 2. HIDE ALL ADMIN UI */
          .print\\:hidden, header, nav, aside, footer { 
            display: none !important; 
          }

          /* 3. NUCLEAR DOM RESET */
          html, body, div, main, section, article {
            display: block !important;
            position: static !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            transform: none !important;
            background: white !important;
          }

          /* 4. SETUP PRINT CONTAINER */
          .print-container {
            display: block !important;
            width: 50mm !important;
            margin: 0 auto !important;
          }
          
          /* 5. INDIVIDUAL LABEL STRICT BOUNDARIES */
          .thermal-label {
            width: 50mm !important;
            height: 25mm !important; 
            box-sizing: border-box !important;
            margin: 0 !important;
            
            /* 🚨 HARDWARE OFFSET CORRECTION: Push content 2.5mm left */
            padding-top: 1mm !important;
            padding-bottom: 1mm !important;
            padding-left: 0!important;
            padding-right: 5mm !important; 
            
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            
            color: #000 !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
            
            page-break-inside: avoid !important;
            page-break-after: always !important; 
            break-after: page !important;
            
            overflow: hidden !important; 
          }

          .thermal-label:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          
          /* 🚨 UPSCALED TYPOGRAPHY */
          .store-name { 
            font-size: 8px !important; 
            font-weight: 900 !important; 
            text-transform: uppercase !important; 
            margin-bottom: 1px !important; 
            line-height: 1 !important; 
          }
          
          .item-name { 
            font-size: 10px !important; 
            font-weight: bold !important; 
            line-height: 1.1 !important; 
            width: 100% !important; 
            white-space: nowrap !important; 
            overflow: hidden !important; 
            text-overflow: ellipsis !important; 
            margin-bottom: 2px !important; 
          }
          
          .barcode-wrapper { 
            margin: 1px 0 !important; 
            display: flex !important; 
            justify-content: center !important; 
            align-items: center !important; 
            height: 12mm !important; /* Increased to allow taller barcode */
            width: 100% !important; 
          }
          
          .barcode-wrapper svg { 
            height: 100% !important; 
            width: auto !important; 
            max-width: 45mm !important; 
          }
          
          .price-tag { 
            font-size: 13px !important; 
            font-weight: 900 !important; 
            line-height: 1 !important; 
            margin-top: 2px !important; 
          }
        }
      `}} />

    </main>
  );
}