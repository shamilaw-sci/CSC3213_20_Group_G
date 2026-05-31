'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePOS } from '../../context/POSContext';
import { supabase } from '../../lib/supabase'; 
import { POSItem } from '../../types/pos.types';

// 1. Tell TypeScript to expect the search prop
interface ProductGridProps {
  searchQuery?: string;
}

// 2. Accept the prop into the component
export default function ProductGrid({ searchQuery = '' }: ProductGridProps) {
  const { addToCart } = usePOS();
  
  const [products, setProducts] = useState<POSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('artifact_variants')
          .select('*, artifacts(name)'); 

        if (supabaseError) throw supabaseError;

        if (data) {
          const formattedProducts: POSItem[] = data.map((item: any) => ({
            id: item.id.toString(), 
            name: item.artifacts?.name || `Variant #${item.id}`, 
            price: item.price || 0,
            barcode: item.barcode || null,
            type: 'merchandise',
            color: item.color_name || null, 
            hexCode: item.hex_code || null,
            imageUrl: item.image_url || null,
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError("Failed to load store inventory. Check network connection.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // FILTER LOGIC
  const filteredProducts = products.filter((product) => {
    // If the search bar is empty, show everything
    if (!searchQuery.trim()) return true;
    
    // Convert everything to lowercase
    const term = searchQuery.toLowerCase();
    
    return (
      product.name.toLowerCase().includes(term) ||
      product.id.toLowerCase().includes(term) ||
      (product.barcode && product.barcode.toLowerCase().includes(term))
    );
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-500 font-semibold text-center px-6">
        {error}
      </div>
    );
  }

  // Handle the case where they search for something that doesn't exist
  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-stone-400">
        <span className="text-4xl mb-3">🔍</span>
        <p className="font-semibold text-lg">No products found</p>
        <p className="text-sm">Try adjusting your search for "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
      {/* Map over filteredProducts instead of products */}
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