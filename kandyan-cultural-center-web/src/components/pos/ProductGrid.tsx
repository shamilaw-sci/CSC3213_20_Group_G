'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePOS } from '../../context/POSContext';

// 1. ADDED THE NEW PROPS HERE
interface ProductGridProps {
  searchQuery?: string;
  sortBy?: string;
  activeCategory?: string;
  inStockOnly?: boolean;
  outOfStockOnly?: boolean;
  minPrice?: string;
  maxPrice?: string;
}

export default function ProductGrid({ 
  searchQuery = '', 
  sortBy = 'name-asc', 
  activeCategory = 'All', 
  inStockOnly = false,
  outOfStockOnly = false,
  minPrice = '',
  maxPrice = ''
}: ProductGridProps) {
  
  const { addToCart, cachedProducts, loadProducts } = usePOS();

  useEffect(() => {
    if (cachedProducts.length === 0) {
      loadProducts();
    }
  }, [cachedProducts.length, loadProducts]);

  // 2. THE NEW FILTERING & SORTING ENGINE
  const processedProducts = cachedProducts
    .filter((product) => {
      // Search logic
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch = !term || (
        product.name.toLowerCase().includes(term) ||
        product.id.toLowerCase().includes(term) ||
        (product.barcode && product.barcode.toLowerCase().includes(term))
      );

      // Category logic
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;

      // Stock logic
      let matchesStock = true;
      if (inStockOnly) {
        matchesStock = product.stock !== undefined && product.stock > 0;
      } else if (outOfStockOnly) {
        matchesStock = product.stock !== undefined && product.stock <= 0;
      }

      // Price logic
      const parsedMinPrice = minPrice === '' ? 0 : Number(minPrice);
      const parsedMaxPrice = maxPrice === '' ? Infinity : Number(maxPrice);
      
      const productPrice = product.price || 0;
      const passesMinPrice = productPrice >= parsedMinPrice;
      const passesMaxPrice = productPrice <= parsedMaxPrice;

      return matchesSearch && matchesCategory && matchesStock && passesMinPrice && passesMaxPrice;
    })
    .sort((a, b) => {
      // Sorting logic
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });

  if (processedProducts.length === 0 && cachedProducts.length > 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-stone-400">
        <svg className="w-16 h-16 mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="font-semibold text-lg text-stone-500">No products found</p>
        <p className="text-sm">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  if (cachedProducts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
      {processedProducts.map((product) => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          disabled={(product.stock || 0) <= 0} // Prevent adding out-of-stock items
          className={`flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm transition-all text-left h-full ${
            (product.stock || 0) <= 0 
              ? 'border-red-200 opacity-60 cursor-not-allowed grayscale-[40%]' 
              : 'border-stone-200 hover:shadow-md hover:border-amber-400 group active:scale-95'
          }`}
        >
          {/* Dynamic Image Area */}
          <div className="relative h-40 w-full bg-stone-100 border-b border-stone-100 overflow-hidden">
            {product.imageUrl ? (
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Your Custom Stock Quantity Badge */}
            {product.stock !== undefined && (
              <div className="absolute bottom-2 right-2 z-10">
                <span className={`px-2 py-1 rounded-md text-xs font-black shadow-md ${
                  (product.stock || 0) <= 0 
                    ? 'bg-red-500 text-white' 
                    : (product.stock || 0) < 5 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-stone-900/80 text-white backdrop-blur-sm'
                }`}>
                  {(product.stock || 0) <= 0 ? 'OUT OF STOCK' : `${product.stock} IN STOCK`}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            
            {/* Added the category tag to the UI so users can see it */}
            {product.category && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm uppercase tracking-wider w-fit mb-2">
                {product.category}
              </span>
            )}

            <h3 className="font-bold text-stone-800 text-sm line-clamp-2 mb-3">
              {product.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-3 mt-auto">
              <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono border border-stone-200">
                Barcode: {product.barcode || 'N/A'}
              </span>
              
              {product.color && (
                <div className="flex items-center bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded gap-1.5">
                  {product.hexCode && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full shadow-inner" 
                      style={{ backgroundColor: product.hexCode }}
                    />
                  )}
                  <span className="text-[10px] font-bold text-stone-600">
                    {product.color}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-amber-700 font-black text-lg">
              Rs. {(product.price || 0).toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}