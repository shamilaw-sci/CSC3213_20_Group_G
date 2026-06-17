"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProductInteractive({ artifact, variants = [] }: { artifact: any, variants: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, setIsDrawerOpen } = useCart();
  
  // 1. VARIANT LOGIC
  const urlVariantId = searchParams.get('variant');
  const initialVariant = variants.find(v => v.id === urlVariantId) || variants[0];
  
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [mainImage, setMainImage] = useState(initialVariant?.image_url || '');

  // 2. UNIFIED IMAGE GALLERY LOGIC
  const allImages = useMemo(() => {
    const safeGallery = Array.isArray(artifact.gallery_images) ? artifact.gallery_images : [];
    const variantImages = variants.map(v => v.image_url).filter(Boolean);
    const combined = [...variantImages, ...safeGallery].filter(Boolean);
    return Array.from(new Set(combined)); 
  }, [artifact, variants]);

  if (!selectedVariant) return <div>Variant data missing.</div>;

  const hasDiscount = selectedVariant.discounted_price && selectedVariant.discounted_price < selectedVariant.price;
  
  const artisanName = selectedVariant.artisans?.name || "Kandyan Art Association Artists";
  const artisanGuild = selectedVariant.artisans?.guild || "Official KCC Heritage Crafters";
  const artisanAvatar = selectedVariant.artisans?.avatar_url;

  const increment = () => setQuantity(prev => (prev < selectedVariant.stock ? prev + 1 : prev));
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Bi-Directional Sync: Color Button -> Image
  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setMainImage(variant.image_url); 
    setQuantity(1);
    router.replace(`/shop/${artifact.id}?variant=${variant.id}`, { scroll: false });
  };

  // Bi-Directional Sync: Image -> Color Button
  const handleImageClick = (img: string) => {
    setMainImage(img); 
    const matchedVariant = variants.find(v => v.image_url === img);
    if (matchedVariant && matchedVariant.id !== selectedVariant.id) {
      setSelectedVariant(matchedVariant);
      setQuantity(1);
      router.replace(`/shop/${artifact.id}?variant=${matchedVariant.id}`, { scroll: false });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${artifact.name} - ${selectedVariant.color_name} | KCC`,
      url: window.location.href, 
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getCartItem = () => ({
    id: selectedVariant.id, 
    name: `${artifact.name} - ${selectedVariant.color_name}`,
    price: selectedVariant.price,
    discounted_price: selectedVariant.discounted_price,
    image_url: selectedVariant.image_url,
    stock: selectedVariant.stock,
    quantity
  });

  const handleAddToCart = () => {
    if (addToCart) addToCart(getCartItem());
    if (setIsDrawerOpen) setIsDrawerOpen(true);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    addToCart(getCartItem());
    router.push('/checkout');
  };

  // ADDED: pb-32 to ensure bottom content isn't covered by the floating dock
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6 pb-32">
      
      {/* LEFT COLUMN: Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 rounded-3xl h-[400px] lg:h-[600px] relative overflow-hidden shadow-sm border border-slate-100 transition-all duration-300">
          <Image src={mainImage} alt={artifact.name} fill className="object-cover" priority />
        </div>
        
        {allImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {allImages.map((img, index) => (
              <button 
                key={index} 
                onClick={() => handleImageClick(img as string)}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  mainImage === img ? 'border-kandyan-gold scale-105 shadow-md' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img as string} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Details */}
      <div className="flex flex-col justify-start">
        
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{artifact.name}</h1>
          <button onClick={handleShare} className="flex flex-col items-center justify-center text-slate-400 hover:text-kandyan-gold transition-colors p-2 shrink-0 group cursor-pointer">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
        
        {/* Static Pricing Header */}
        <div className="flex items-end gap-4 mb-6">
          {hasDiscount ? (
            <>
              <p className="text-3xl text-kandyan-gold font-black">LKR {selectedVariant.discounted_price.toLocaleString()}</p>
              <p className="text-xl text-slate-400 line-through mb-1 font-medium">LKR {selectedVariant.price.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-3xl text-kandyan-gold font-black">LKR {selectedVariant.price.toLocaleString()}</p>
          )}
        </div>

        {/* VARIANT SELECTOR */}
        {variants.length > 0 && (
          <div className="mb-8 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Available Colors</span>
            <div className="flex flex-wrap gap-3">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVariantChange(v)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 cursor-pointer ${
                    selectedVariant.id === v.id
                      ? 'border-kandyan-gold bg-amber-50 text-kandyan-gold shadow-sm'
                      : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {v.hex_code && (
                    <span className="w-3 h-3 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: v.hex_code }}></span>
                  )}
                  {v.color_name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          {selectedVariant.stock > 10 ? (
            <span className="text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg text-xs border border-green-200 uppercase tracking-widest shadow-sm">✓ {selectedVariant.stock} in stock</span>
          ) : selectedVariant.stock > 0 ? (
            <span className="text-kandyan-maroon font-bold bg-rose-50 px-4 py-2 rounded-lg text-xs border border-rose-200 uppercase tracking-widest shadow-sm">⏳ Only {selectedVariant.stock} left!</span>
          ) : (
            <span className="text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-lg text-xs border border-slate-200 uppercase tracking-widest shadow-sm">❌ Out of stock</span>
          )}
        </div>
        
        <p className="text-slate-500 mb-8 leading-relaxed font-light text-lg">
          {artifact.description}
        </p>

        {/* ARTISAN DISPLAY */}
        <div className="bg-stone-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 mb-8 transition-colors group">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm shrink-0 text-kandyan-gold">
            {artisanAvatar ? (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img src={artisanAvatar} alt={artisanName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-kandyan-maroon uppercase tracking-widest mb-1">The Artisan</p>
            <h4 className="text-slate-900 font-bold">{artisanName}</h4>
            <p className="text-sm text-slate-500">{artisanGuild}</p>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Specifications</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col pb-2">
              <span className="text-slate-400 font-medium mb-1">Category</span>
              <span className="font-bold text-slate-900">{artifact.category}</span>
            </div>
            <div className="flex flex-col pb-2">
              <span className="text-slate-400 font-medium mb-1">Material</span>
              <span className="font-bold text-slate-900">{artifact.material || 'Traditional'}</span>
            </div>
            {selectedVariant.weight && (
              <div className="flex flex-col pb-2">
                <span className="text-slate-400 font-medium mb-1">Weight</span>
                <span className="font-bold text-slate-900">{selectedVariant.weight}</span>
              </div>
            )}
            {selectedVariant.dimensions && (
              <div className="flex flex-col pb-2">
                <span className="text-slate-400 font-medium mb-1">Dimensions</span>
                <span className="font-bold text-slate-900">{selectedVariant.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Historical Info */}
        {artifact.historical_info && (
          <div className="mt-8 bg-stone-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
            <h3 className="text-xs font-bold text-kandyan-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Historical Significance
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              {artifact.historical_info}
            </p>
          </div>
        )}

      </div>

      {/* --- NEW: STICKY FLOATING ACTION DOCK --- */}
      {selectedVariant.stock > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[600px] bg-white/85 backdrop-blur-xl border border-slate-200/80 p-3 sm:p-4 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] z-40 flex flex-col sm:flex-row items-center gap-3 ring-1 ring-slate-900/5 animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Top Row (Mobile) / Left Side (Desktop) */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            
            {/* Dynamic Total Price Tracker (Visible mostly on Mobile for context) */}
            <div className="flex flex-col sm:hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
              <span className="font-black text-kandyan-gold text-lg leading-none mt-1">
                LKR {(quantity * (selectedVariant.discounted_price || selectedVariant.price)).toLocaleString()}
              </span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white shrink-0 ml-auto sm:ml-0">
              <button onClick={decrement} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer font-bold transition-colors">−</button>
              <span className="px-3 py-2.5 font-black text-slate-900 w-12 text-center text-sm">{quantity}</span>
              <button onClick={increment} className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer font-bold transition-colors">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row w-full sm:w-auto gap-2 sm:gap-3 flex-grow">
            <Button variant="outline" className="grow !py-3 text-xs sm:text-sm bg-white" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button variant="primary" className="grow !py-3 text-xs sm:text-sm shadow-md" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
          
        </div>
      )}

    </div>
  );
}