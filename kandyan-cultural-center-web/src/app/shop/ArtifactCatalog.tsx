'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Artifact } from './page';

interface ArtifactCatalogProps {
  initialArtifacts: Artifact[];
}

export default function ArtifactCatalog({ initialArtifacts }: ArtifactCatalogProps) {
  // --- State ---
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

  // --- Logic: Filter & Sort ---
  const processedArtifacts = useMemo(() => {
    let result = [...initialArtifacts];

    // 1. Filter
    if (selectedCategory !== 'All') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // 2. Sort
    result.sort((a, b) => {
      // Using discounted_price if available for sorting
      const priceA = a.discounted_price || a.price;
      const priceB = b.discounted_price || b.price;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default: newest/database order
    });

    return result;
  }, [initialArtifacts, selectedCategory, sortBy]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(processedArtifacts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleArtifacts = processedArtifacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- Handlers ---
  const handleFilterChange = (type: 'category' | 'sort', value: string) => {
    if (type === 'category') setSelectedCategory(value);
    if (type === 'sort') setSortBy(value);
    setCurrentPage(1); // Always reset to page 1 on filter/sort change
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
        catalogTopRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 50); 
  };

  return (
    <div ref={catalogTopRef} className="scroll-mt-28">
      {/* --- Controls Bar --- */}
      <div className="flex flex-col gap-6 mb-12">
        
        {/* Category Filter Pills (Interactive Chip Slider) */}
        <div className="relative w-full overflow-hidden rounded-xl">
          <div 
            ref={categoryScrollRef}
            className="flex overflow-x-auto pb-2 gap-3 w-full snap-x scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-16"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border flex-shrink-0 snap-start cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-kandyan-gold hover:text-kandyan-gold'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Right Scroll Chevron Button */}
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

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</label>
          <select 
            value={sortBy}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-2 focus:ring-1 focus:ring-kandyan-gold focus:border-kandyan-gold outline-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* --- Product Grid --- */}
      {visibleArtifacts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-400 font-medium">No items found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleArtifacts.map((artifact) => (
              <div 
                key={artifact.id} 
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-kandyan-hover transition-all duration-500 flex flex-col"
              >
                {/* Image Container & Badges */}
                <div className="aspect-[4/5] w-full relative overflow-hidden bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artifact.image_url}
                    alt={artifact.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Stock Badges */}
                    {artifact.stock === 0 ? (
                      <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                        Sold Out
                      </span>
                    ) : artifact.stock < 5 ? (
                      <span className="bg-kandyan-gold text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                        Limited Stock
                      </span>
                    ) : null}
                    
                    {/* Sale Badge */}
                    {artifact.discounted_price && artifact.discounted_price < artifact.price && (
                      <span className="bg-kandyan-maroon text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm self-start">
                        Sale
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-kandyan-maroon uppercase tracking-widest mb-2">
                    {artifact.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-4 line-clamp-1 group-hover:text-kandyan-gold transition-colors">
                    {artifact.name}
                  </h3>
                  
                  {/* Price & Action */}
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
                    <div>
                      {artifact.discounted_price && artifact.discounted_price < artifact.price ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-400 line-through">
                            Rs. {artifact.price.toLocaleString()}
                          </span>
                          <span className="text-xl font-black text-slate-900">
                            Rs. {artifact.discounted_price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-slate-900">
                          Rs. {artifact.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/shop/${artifact.id}`}
                      className="bg-slate-950 hover:bg-kandyan-maroon text-white p-3 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center group/btn"
                    >
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- Numbered Pagination UI --- */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                &laquo; Previous
              </button>

              {/* Desktop Page Numbers */}
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'border-kandyan-maroon text-kandyan-maroon font-bold bg-rose-50 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Text Fallback */}
              <span className="sm:hidden text-slate-500 font-medium px-4">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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