'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext'; 
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/lib/supabase';
import Pagination from '@/components/Pagination';

export interface CatalogItem {
  variant_id: string;
  artifact_id: string;
  product_name: string;
  category: string;
  color_name: string;
  price: number;
  discounted_price?: number;
  image_url: string;
  stock: number;
  created_at?: string;
}

interface ArtifactCatalogProps {
  initialArtifacts: CatalogItem[];
}

export default function ArtifactCatalog({ initialArtifacts }: ArtifactCatalogProps) {
  const router = useRouter();
  const { setIsDrawerOpen, addToCart } = useCart(); 
  const { formatPrice } = useCurrency(); 

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const cats = initialArtifacts.map((a) => a.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [initialArtifacts]);

  const processedArtifacts = useMemo(() => {
    // 🚨 Tag with an original index as a bulletproof fallback for sorting
    let result = initialArtifacts.map((item, index) => ({
      ...item,
      _originalIndex: index
    }));

    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.product_name.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery) ||
          a.color_name.toLowerCase().includes(lowerQuery)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    result.sort((a, b) => {
      const priceA = a.discounted_price || a.price;
      const priceB = b.discounted_price || b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.product_name.localeCompare(b.product_name);
      
      // 🚨 FIX: Explicit logic for Newest Arrivals
      if (sortBy === 'newest') {
        // If we have actual timestamps from Supabase, use them
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        // Fallback: The items added last (highest index) are pushed to the top
        return b._originalIndex - a._originalIndex;
      }
      
      return 0; 
    });

    return result;
  }, [initialArtifacts, searchQuery, selectedCategory, sortBy]);

  const totalPages = Math.ceil(processedArtifacts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleArtifacts = processedArtifacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (type: 'category' | 'sort', value: string) => {
    if (type === 'category') setSelectedCategory(value);
    if (type === 'sort') setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  const scrollCategoriesRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      if (catalogTopRef.current) {
        catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50); 
  };

  const handleCardClick = (item: CatalogItem) => {
    router.push(`/shop/${item.artifact_id}?variant=${item.variant_id}`);
  };

  const getCartItem = (item: CatalogItem) => ({
    id: item.variant_id, 
    name: `${item.product_name} - ${item.color_name}`,
    price: item.price,
    discounted_price: item.discounted_price,
    image_url: item.image_url,
    stock: item.stock,
    quantity: 1
  });

  const handleAddToCart = (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation(); 
    if (addToCart) addToCart(getCartItem(item));
    if (setIsDrawerOpen) setIsDrawerOpen(true);
  };

  const handleBuyNow = async (e: React.MouseEvent, item: CatalogItem) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login'); 
      return;
    }

    if (addToCart) addToCart(getCartItem(item));
    router.push('/checkout');
  };

  const getPagination = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div ref={catalogTopRef} className="scroll-mt-32">
      
      {/* --- Controls Bar (Glassmorphism) --- */}
      <div className="flex flex-col gap-6 mb-10">
        
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search artifacts, categories, colors..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white/60 backdrop-blur-md border border-white/80 text-slate-900 text-sm font-medium rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition-all placeholder:text-slate-400"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:block">Sort By:</label>
            
            {/* 🚨 WRAPPED IN RELATIVE CONTAINER FOR THE ARROW */}
            <div className="relative w-full md:w-auto">
              <select 
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="bg-white/60 backdrop-blur-md border border-white/80 text-slate-900 text-sm font-bold rounded-2xl pl-4 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-sm hover:bg-white transition-all w-full md:w-auto appearance-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
              
              {/* 🚨 CUSTOM DOWN ARROW */}
              <svg 
                className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Category Filter Pills (Glassmorphism) */}
        <div className="relative w-full overflow-hidden rounded-2xl">
          <div ref={categoryScrollRef} className="flex overflow-x-auto pb-4 gap-3 w-full snap-x scroll-smooth no-scrollbar pr-16 pt-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border flex-shrink-0 snap-start cursor-pointer shadow-sm ${
                  selectedCategory === category
                    ? 'bg-amber-500 text-white border-amber-400 shadow-[0_4px_14px_rgba(217,119,6,0.3)]'
                    : 'bg-white/50 backdrop-blur-md text-slate-600 border-white/80 hover:bg-white hover:text-amber-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button 
            onClick={scrollCategoriesRight}
            aria-label="Scroll categories right"
            className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent flex items-center justify-end pr-2 hover:from-white/50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center border border-white text-slate-500 hover:text-amber-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </button>
        </div>
      </div>

      {/* --- Product Grid --- */}
      {visibleArtifacts.length === 0 ? (
        <div className="text-center py-24 bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/80 shadow-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <p className="text-slate-900 font-bold text-xl">No artifacts found.</p>
          <p className="text-slate-500 font-medium mt-2 mb-6">Try adjusting your filters or search query.</p>
          <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-600 font-bold rounded-xl shadow-sm border border-amber-200/50 transition-colors">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* GRID: 2 on mobile, 3 on tablet, 4 on desktop, 5 on ultra-wide */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {visibleArtifacts.map((item) => (
              <div 
                key={item.variant_id}
                onClick={() => handleCardClick(item)}
                className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.25rem] sm:rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Image Container (1:1 Ratio) */}
                <div className="aspect-square w-full relative overflow-hidden bg-slate-50">
                  <Image src={item.image_url} alt={item.product_name} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                    {item.stock === 0 ? (
                      <span className="bg-slate-900 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm">Sold Out</span>
                    ) : item.stock == 1 ? (
                      <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm">Only 1 left!</span>
                    ) : null}
                    
                    {item.discounted_price && item.discounted_price < item.price && (
                      <span className="bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm self-start">Sale</span>
                    )}
                  </div>
                </div>
                
                {/* Glassmorphism Bottom Section (Tightened for Mobile) */}
                <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white/20 backdrop-blur-sm border-t border-white/40">
                  <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1 sm:mb-1.5 line-clamp-1">
                    {item.category}
                  </span>
                  <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {item.product_name}
                  </h3>
                  
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500 mb-2 sm:mb-3">
                    Color: <span className="text-slate-700">{item.color_name}</span>
                  </p>
                  
                  {/* Dynamic Pricing */}
                  <div className="mt-auto flex flex-col gap-0.5 sm:gap-1 mb-2 sm:mb-4 border-b border-white/50 pb-2 sm:pb-3">
                    {item.discounted_price && item.discounted_price < item.price ? (
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[11px] font-medium text-slate-400 line-through">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-base sm:text-xl font-black text-slate-900">
                          {formatPrice(item.discounted_price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base sm:text-xl font-black text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTONS (Optimized for Mobile Grid) */}
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex gap-1.5 sm:gap-2">
                      <button 
                        onClick={(e) => handleAddToCart(e, item)}
                        disabled={item.stock === 0}
                        className="p-1.5 sm:px-3 sm:py-2 bg-white/50 backdrop-blur-md border border-white/80 rounded-[0.5rem] sm:rounded-xl hover:border-amber-400 hover:bg-white/80 text-slate-700 hover:text-amber-600 flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed aspect-square sm:aspect-auto"
                        aria-label="Add to cart"
                      >
                        <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        <span className="hidden sm:block text-[11px] font-bold">Cart</span>
                      </button>
                      
                      <button 
                        onClick={(e) => handleBuyNow(e, item)}
                        disabled={item.stock === 0}
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 rounded-[0.5rem] sm:rounded-xl transition-colors shadow-[0_4px_10px_rgba(217,119,6,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* --- Pagination UI --- */}
          <div className="mt-16">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </>
      )}
    </div>
  );
}