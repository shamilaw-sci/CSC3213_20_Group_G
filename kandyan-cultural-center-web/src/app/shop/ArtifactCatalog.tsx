'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Artifact } from './page';
import { useCart } from '@/context/CartContext'; // NEW: Imported Cart Context
import { supabase } from '@/lib/supabase';

interface ArtifactCatalogProps {
  initialArtifacts: Artifact[];
}

export default function ArtifactCatalog({ initialArtifacts }: ArtifactCatalogProps) {
  const router = useRouter();
  
  // NEW: Pulling in your cart logic. 
  // *Note: Make sure your CartContext actually exports a function called 'addToCart' or 'addItem'!
  const { setIsDrawerOpen, addToCart } = useCart(); 

  // --- State ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 12;

  // --- Refs for Scrolling ---
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // --- Logic: Extract Categories ---
  const categories = useMemo(() => {
    const cats = initialArtifacts.map((a) => a.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [initialArtifacts]);

  // --- Logic: Filter, Search & Sort ---
  const processedArtifacts = useMemo(() => {
    let result = [...initialArtifacts];

    // 1. Search Filter
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(lowerQuery) ||
          a.category.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // 3. Sort
    result.sort((a, b) => {
      const priceA = a.discounted_price || a.price;
      const priceB = b.discounted_price || b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default
    });

    return result;
  }, [initialArtifacts, searchQuery, selectedCategory, sortBy]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(processedArtifacts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleArtifacts = processedArtifacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- Handlers ---
  const handleFilterChange = (type: 'category' | 'sort', value: string) => {
    if (type === 'category') setSelectedCategory(value);
    if (type === 'sort') setSortBy(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 while typing
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

  // --- ACTION HANDLERS FOR THE CARD ---
  const handleCardClick = (id: string) => {
    router.push(`/shop/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent, artifact: Artifact) => {
    e.stopPropagation(); // Prevents the card click from triggering
    
    // Add item to global cart state (assuming your context needs the item and a quantity)
    if (addToCart) {
      addToCart({ ...artifact, quantity: 1 });
    }
    
    // Open the drawer to give the user visual feedback
    if (setIsDrawerOpen) {
      setIsDrawerOpen(true);
    }
  };

  const handleBuyNow = async (e: React.MouseEvent, artifact: any) => {
  e.stopPropagation();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login, but keep the intention
    router.push('/login'); 
    return;
  }

  // If logged in, go to delivery details
  addToCart({ ...artifact, quantity: 1 });
  router.push('/checkout');
  };

  return (
    <div ref={catalogTopRef} className="scroll-mt-28">
      
      {/* --- Controls Bar --- */}
      <div className="flex flex-col gap-6 mb-10">
        
        {/* Search Bar & Sort Row */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search artifacts, categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-medium rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-kandyan-gold focus:border-transparent shadow-sm transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Sort By:</label>
            <select 
              value={sortBy}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-kandyan-gold focus:border-transparent outline-none cursor-pointer shadow-sm hover:border-slate-300 transition-all w-full md:w-auto"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
        
        {/* Category Filter Pills (Interactive Chip Slider) */}
        <div className="relative w-full overflow-hidden rounded-xl">
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto pb-2 gap-3 w-full snap-x scroll-smooth no-scrollbar pr-16"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border flex-shrink-0 snap-start cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-kandyan-gold hover:text-kandyan-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <button 
            onClick={scrollCategoriesRight}
            aria-label="Scroll categories right"
            className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-kandyan-bg via-kandyan-bg/90 to-transparent flex items-center justify-end hover:from-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6 text-slate-600 mr-1 hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* --- Product Grid --- */}
      {visibleArtifacts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-300 shadow-sm">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <p className="text-slate-500 font-medium text-lg">No artifacts found matching your search.</p>
          <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="mt-4 text-kandyan-gold font-bold hover:underline">Clear all filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {visibleArtifacts.map((artifact) => (
              <div 
                key={artifact.id}
                onClick={() => handleCardClick(artifact.id)}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col cursor-pointer"
              >
                {/* Image Container & Badges */}
                <div className="aspect-square sm:aspect-[4/5] w-full relative overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artifact.image_url}
                    alt={artifact.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2">
                    {/* Stock Badges */}
                    {artifact.stock === 0 ? (
                      <span className="bg-slate-900 text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md uppercase tracking-widest shadow-sm">
                        Sold Out
                      </span>
                    ) : artifact.stock < 5 ? (
                      <span className="bg-kandyan-gold text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md uppercase tracking-widest shadow-sm">
                        Low Stock
                      </span>
                    ) : null}
                    
                    {/* Sale Badge */}
                    {artifact.discounted_price && artifact.discounted_price < artifact.price && (
                      <span className="bg-kandyan-maroon text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-md uppercase tracking-widest shadow-sm self-start">
                        Sale
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-3 sm:p-6 flex flex-col flex-grow">
                  <span className="text-[9px] sm:text-[10px] font-bold text-kandyan-maroon uppercase tracking-widest mb-1 sm:mb-2 line-clamp-1">
                    {artifact.category}
                  </span>
                  <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 mb-2 sm:mb-4 line-clamp-1 group-hover:text-kandyan-gold transition-colors">
                    {artifact.name}
                  </h3>
                  
                  {/* Pricing */}
                  <div className="mt-auto flex flex-col gap-1 mb-3 sm:mb-4 border-b border-slate-50 pb-3">
                    {artifact.discounted_price && artifact.discounted_price < artifact.price ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-sm font-medium text-slate-400 line-through">
                          Rs. {artifact.price.toLocaleString()}
                        </span>
                        <span className="text-base sm:text-xl font-black text-slate-900">
                          Rs. {artifact.discounted_price.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base sm:text-xl font-black text-slate-900">
                        Rs. {artifact.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleAddToCart(e, artifact)}
                        className="p-2 sm:px-4 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-kandyan-gold hover:bg-amber-50 text-slate-600 hover:text-kandyan-gold flex items-center justify-center transition-all shadow-sm"
                        aria-label="Add to cart"
                      >
                        <svg className="w-4 h-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        <span className="hidden sm:block text-xs font-bold">Cart</span>
                      </button>
                      
                      <button 
                        onClick={(e) => handleBuyNow(e, artifact)}
                        className="flex-1 bg-slate-900 hover:bg-kandyan-gold text-white text-xs sm:text-sm font-bold py-2 rounded-xl transition-colors shadow-sm"
                      >
                        Buy Now
                      </button>
                    </div>

                    {/* More Details */}
                    <div className="mt-1 text-center">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 group-hover:text-kandyan-maroon transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
                        More Details 
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* --- Numbered Pagination UI --- */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm text-sm"
              >
                &laquo; Prev
              </button>

              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm text-sm ${
                        currentPage === pageNum
                          ? 'border-kandyan-gold text-white font-bold bg-kandyan-gold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium bg-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <span className="sm:hidden text-slate-500 font-medium px-4 text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm text-sm"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}