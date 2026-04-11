'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Artifact } from './page';

interface ArtifactCatalogProps {
  initialArtifacts: Artifact[];
}

export default function ArtifactCatalog({ initialArtifacts }: ArtifactCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [itemsToShow, setItemsToShow] = useState<number>(12);

  // 1. Extract unique categories dynamically
  const categories = useMemo(() => {
    const cats = initialArtifacts.map((a) => a.category);
    return ['All', ...Array.from(new Set(cats))];
  }, [initialArtifacts]);

  // 2. Filter and Sort Logic
  const processedArtifacts = useMemo(() => {
    let result = [...initialArtifacts];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Sort Logic
    result.sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // Default: Newest (as fetched from DB)
    });

    return result;
  }, [initialArtifacts, selectedCategory, sortBy]);

  // 3. Slice for Pagination
  const visibleArtifacts = processedArtifacts.slice(0, itemsToShow);

  return (
    <div>
      {/* Controls Bar: Categories + Sorting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setItemsToShow(12); // Reset view count on filter change
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                selectedCategory === category
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-500 hover:text-amber-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-2 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Modern Product Grid */}
      {visibleArtifacts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No items found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleArtifacts.map((artifact) => (
              <div 
                key={artifact.id} 
                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col"
              >
                {/* Image Container */}
                <div className="aspect-[4/5] w-full relative overflow-hidden bg-slate-50">
                  <img
                    src={artifact.image_url}
                    alt={artifact.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  
                  {/* Stock Badges */}
                  <div className="absolute top-4 left-4">
                    {artifact.stock === 0 ? (
                      <span className="bg-rose-700 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        Sold Out
                      </span>
                    ) : artifact.stock < 5 ? (
                      <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                        Limited Stock
                      </span>
                    ) : null}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-2">
                    {artifact.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-4 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {artifact.name}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-4">
                    <div>
                      <span className="text-xl font-black text-slate-900">
                        Rs. {artifact.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/shop/${artifact.id}`}
                      className="bg-slate-950 hover:bg-rose-700 text-white p-3 rounded-2xl transition-all duration-300 shadow-md flex items-center justify-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {processedArtifacts.length > itemsToShow && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setItemsToShow(prev => prev + 8)}
                className="bg-white border border-slate-200 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Load More Artifacts
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}