"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext'; 
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProductInteractive({ artifact, variants = [] }: { artifact: any, variants: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, setIsDrawerOpen } = useCart();
  const { formatPrice } = useCurrency(); 
  
  // variety of states for the interactive component
  const urlVariantId = searchParams.get('variant');
  const initialVariant = variants.find(v => v.id === urlVariantId) || variants[0];
  
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [mainImage, setMainImage] = useState(initialVariant?.image_url || '');

  // unified image gallery
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

  const handleVariantChange = (variant: any) => {
    setSelectedVariant(variant);
    setMainImage(variant.image_url); 
    setQuantity(1);
    router.replace(`/shop/${artifact.id}?variant=${variant.id}`, { scroll: false });
  };

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
    if (addToCart) addToCart(getCartItem());
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mt-6 pb-32">
      
      {/* left col: Image Gallery */}
      <div className="lg:col-span-6 flex flex-col gap-5">
        <div className="bg-white/50 backdrop-blur-xl p-3 sm:p-4 rounded-[3rem] border border-white/80 shadow-[0_15px_40px_rgba(31,38,135,0.05)] transition-all duration-300">
          <div className="aspect-square relative overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100/50 shadow-inner">
            <Image src={mainImage} alt={artifact.name} fill className="object-cover" priority />
          </div>
        </div>
        
        {allImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar">
            {allImages.map((img, index) => (
              <button 
                key={index} 
                onClick={() => handleImageClick(img as string)}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden transition-all shrink-0 cursor-pointer backdrop-blur-md ${
                  mainImage === img 
                    ? 'border-2 border-amber-400 shadow-[0_8px_20px_rgba(217,119,6,0.3)] scale-105 z-10' 
                    : 'border border-white/80 bg-white/40 hover:bg-white hover:border-amber-300 opacity-80 hover:opacity-100 shadow-sm'
                }`}
              >
                <Image src={img as string} alt={`Thumbnail ${index + 1}`} fill className="object-cover p-1 rounded-2xl" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* right col: details */}
      <div className="lg:col-span-6 flex flex-col justify-start">
        
        <div className="flex justify-between items-start gap-4 mb-3">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{artifact.name}</h1>
          <button onClick={handleShare} className="flex flex-col items-center justify-center w-14 h-14 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm text-slate-500 hover:text-amber-600 hover:border-amber-300 transition-all shrink-0 group cursor-pointer">
            <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span className="text-[8px] font-black uppercase tracking-wider">{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
        
        <div className="flex items-end gap-4 mb-8">
          {hasDiscount ? (
            <>
              <p className="text-4xl text-slate-900 font-black tracking-tight">{formatPrice(selectedVariant.discounted_price)}</p>
              <p className="text-xl text-slate-400 line-through mb-1 font-bold">{formatPrice(selectedVariant.price)}</p>
            </>
          ) : (
            <p className="text-4xl text-slate-900 font-black tracking-tight">{formatPrice(selectedVariant.price)}</p>
          )}
        </div>

        {variants.length > 0 && (
          <div className="mb-8 bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
            

            <div className="px-5 py-4 border-b border-white/40 flex justify-between items-center bg-white/40">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Available Colors</span>
              <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-200/50 shadow-sm">
                {variants.length} Options
              </span>
            </div>

            <div className="p-4 sm:p-5 max-h-[260px] overflow-y-auto no-scrollbar relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    title={v.color_name}
                    onClick={() => handleVariantChange(v)}
                    className={`relative px-3 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm w-full text-left overflow-hidden ${
                      selectedVariant.id === v.id
                        ? 'border-2 border-amber-400 bg-amber-50 text-amber-700 shadow-[0_4px_10px_rgba(217,119,6,0.15)]'
                        : 'border-2 border-transparent bg-white text-slate-600 hover:border-amber-200 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {v.hex_code && (
                      <span className="w-3.5 h-3.5 rounded-full shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: v.hex_code }}></span>
                    )}
                    <span className="truncate w-full leading-tight pr-1">{v.color_name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {variants.length > 9 && (
              <div className="h-6 w-full bg-gradient-to-t from-white/90 to-transparent absolute bottom-0 left-0 pointer-events-none rounded-b-[2rem]"></div>
            )}
          </div>
        )}

        <div className="mb-8">
          {selectedVariant.stock > 10 ? (
            <span className="text-emerald-700 font-black bg-emerald-50/80 backdrop-blur-sm px-4 py-2.5 rounded-xl text-xs border border-emerald-200/60 uppercase tracking-widest shadow-sm">✓ {selectedVariant.stock} in stock</span>
          ) : selectedVariant.stock > 0 ? (
            <span className="text-rose-700 font-black bg-rose-50/80 backdrop-blur-sm px-4 py-2.5 rounded-xl text-xs border border-rose-200/60 uppercase tracking-widest shadow-sm">⏳ Only {selectedVariant.stock} left!</span>
          ) : (
            <span className="text-slate-600 font-black bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-xl text-xs border border-white/80 uppercase tracking-widest shadow-sm">❌ Out of stock</span>
          )}
        </div>
        
        <p className="text-slate-600 mb-10 leading-relaxed font-light text-lg">
          {artifact.description}
        </p>

        {/* artisan display */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-6 flex items-center gap-5 mb-10 shadow-[0_10px_30px_rgba(31,38,135,0.03)] hover:shadow-[0_15px_40px_rgba(31,38,135,0.06)] transition-all group">
          <div className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center overflow-hidden border border-white shadow-sm shrink-0 text-amber-500">
            {artisanAvatar ? (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img src={artisanAvatar} alt={artisanName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            )}
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-1">The Artisan</p>
            <h4 className="text-lg text-slate-900 font-black mb-0.5">{artisanName}</h4>
            <p className="text-sm text-slate-500 font-medium">{artisanGuild}</p>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-6 pt-10 border-t border-white/60">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Specifications</h3>
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium mb-1">Category</span>
              <span className="font-extrabold text-slate-900 text-base">{artifact.category}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-medium mb-1">Material</span>
              <span className="font-extrabold text-slate-900 text-base">{artifact.material || 'Traditional'}</span>
            </div>
            {selectedVariant.weight && (
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium mb-1">Weight</span>
                <span className="font-extrabold text-slate-900 text-base">{selectedVariant.weight}</span>
              </div>
            )}
            {selectedVariant.dimensions && (
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium mb-1">Dimensions</span>
                <span className="font-extrabold text-slate-900 text-base">{selectedVariant.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Historical Info */}
        {artifact.historical_info && (
          <div className="mt-10 bg-amber-50/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-amber-200/50 relative overflow-hidden shadow-sm">
            <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4 flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-200/50 rounded-lg text-amber-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              Historical Significance
            </h3>
            <p className="text-slate-700 text-base leading-relaxed font-medium">
              {artifact.historical_info}
            </p>
          </div>
        )}

      </div>

      {selectedVariant.stock > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[700px] bg-white/80 backdrop-blur-2xl border border-white/80 p-3 sm:p-4 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(31,38,135,0.15)] z-40 flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-8 duration-500">
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-2">
            <div className="flex flex-col sm:hidden">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">Total</span>
              <span className="font-black text-slate-900 text-lg leading-none mt-1.5">
                {formatPrice(quantity * (selectedVariant.discounted_price || selectedVariant.price))}
              </span>
            </div>

            <div className="flex items-center border border-white/80 rounded-2xl overflow-hidden shadow-sm bg-white/60 backdrop-blur-md shrink-0 ml-auto sm:ml-0">
              <button onClick={decrement} className="px-5 py-3 sm:py-3.5 hover:bg-white text-slate-500 hover:text-amber-600 cursor-pointer font-extrabold transition-colors text-lg leading-none">−</button>
              <span className="px-2 py-3 sm:py-3.5 font-black text-slate-900 w-12 text-center text-sm border-x border-white/60">{quantity}</span>
              <button onClick={increment} className="px-5 py-3 sm:py-3.5 hover:bg-white text-slate-500 hover:text-amber-600 cursor-pointer font-extrabold transition-colors text-lg leading-none">+</button>
            </div>
          </div>

          <div className="flex flex-row w-full sm:w-auto gap-3 sm:gap-4 flex-grow">
            <button 
              className="grow py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-bold bg-white/60 hover:bg-white border border-white/80 text-slate-700 hover:text-amber-600 rounded-[1.5rem] shadow-sm transition-all" 
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button 
              className="grow py-3.5 sm:py-4 px-4 text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-0.5 transition-all" 
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
          
        </div>
      )}

    </div>
  );
}