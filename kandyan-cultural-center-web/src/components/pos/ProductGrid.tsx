'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { usePOS } from '../../context/POSContext';

interface ProductGridProps {
  searchQuery?: string;
}

export default function ProductGrid({ searchQuery = '' }: ProductGridProps) {
  // We pull everything directly from the Context now
  const { addToCart, cachedProducts, loadProducts } = usePOS();

  // Load products into the cache when the grid first renders
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter the cached products based on the search bar
  const filteredProducts = cachedProducts.filter((product) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term))
    );
  });

  // Handle the case where they search for something that doesn't exist
  if (filteredProducts.length === 0 && cachedProducts.length > 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-stone-400">
        <span className="text-4xl mb-3">🔍</span>
        <p className="font-semibold text-lg">No products found</p>
        <p className="text-sm">Try adjusting your search for "{searchQuery}"</p>
      </div>
    );
  }

  // Handle initial loading state (before cache is ready)
  if (cachedProducts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
      {filteredProducts.map((product) => (
        <button
          key={product.id}
          onClick={() => addToCart(product)}
          className="flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-left group active:scale-95 h-full"
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
                <span>No Image</span>
              </div>
            )}

            {/* Stock Quantity Badge */}
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
            <h3 className="font-bold text-stone-800 text-sm line-clamp-2 mb-3">
              {product.name}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 mb-3 mt-auto">
              <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono border border-stone-200">
                ID: {product.id.slice(0, 8)}
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
              Rs. {product.price.toLocaleString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}